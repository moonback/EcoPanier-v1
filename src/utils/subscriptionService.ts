import { addDays, differenceInCalendarDays, isAfter } from 'date-fns';
import { supabase } from '../lib/supabase';
import { payFromWallet, refundToWallet } from './walletService';
import type { Database } from '../lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type MerchantSubscriptionRow = Database['public']['Tables']['merchant_subscriptions']['Row'];

export type MerchantSubscriptionStatus = 'none' | 'active' | 'expired';

export interface MerchantSubscriptionInfo {
  status: MerchantSubscriptionStatus;
  plan: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
}

export interface MerchantLotQuota {
  limit: number | null;
  used: number;
  remaining: number | null;
  hasActiveSubscription: boolean;
}

export const MERCHANT_SUBSCRIPTION_PRICE = 29.9;
export const MERCHANT_SUBSCRIPTION_DURATION_DAYS = 30;
export const MERCHANT_SUBSCRIPTION_PLAN = 'premium';
export const MERCHANT_DAILY_LOT_LIMIT = 20;

function computeSubscriptionStatus(profile: Pick<ProfileRow, 'subscription_status' | 'subscription_expires_at'>): MerchantSubscriptionStatus {
  const rawStatus = profile.subscription_status ?? 'none';
  const expiresAt = profile.subscription_expires_at;

  if (!expiresAt) {
    return rawStatus === 'active' ? 'expired' : rawStatus;
  }

  const now = new Date();
  const expiryDate = new Date(expiresAt);

  if (isAfter(expiryDate, now)) {
    return 'active';
  }

  return 'expired';
}

export async function fetchMerchantSubscriptionInfo(merchantId: string): Promise<MerchantSubscriptionInfo> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan, subscription_expires_at')
      .eq('id', merchantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error('Profil commerçant introuvable');
    }

    const computedStatus = computeSubscriptionStatus(data);

    if (data.subscription_status !== computedStatus) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: computedStatus,
          subscription_plan: computedStatus === 'active' ? data.subscription_plan ?? MERCHANT_SUBSCRIPTION_PLAN : null,
          subscription_expires_at: computedStatus === 'active' ? data.subscription_expires_at : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', merchantId);
    }

    const expiresAt = computedStatus === 'active' ? data.subscription_expires_at : null;
    const daysRemaining =
      expiresAt && computedStatus === 'active'
        ? Math.max(differenceInCalendarDays(new Date(expiresAt), new Date()), 0)
        : null;

    return {
      status: computedStatus,
      plan: computedStatus === 'active' ? (data.subscription_plan ?? MERCHANT_SUBSCRIPTION_PLAN) : null,
      expiresAt,
      daysRemaining,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l’abonnement commerçant:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible de récupérer les informations d’abonnement. Vérifiez votre connexion.'
    );
  }
}

export async function activateMerchantSubscription(merchantId: string): Promise<MerchantSubscriptionInfo> {
  let transactionId: string | null = null;
  let subscriptionRecord: MerchantSubscriptionRow | null = null;

  try {
    const info = await fetchMerchantSubscriptionInfo(merchantId);
    const now = new Date();
    const baseDate =
      info.status === 'active' && info.expiresAt ? new Date(info.expiresAt) : now;
    const endsAt = addDays(baseDate, MERCHANT_SUBSCRIPTION_DURATION_DAYS);

    const transaction = await payFromWallet(
      merchantId,
      MERCHANT_SUBSCRIPTION_PRICE,
      `Abonnement commerçant EcoPanier (${MERCHANT_SUBSCRIPTION_DURATION_DAYS} jours)`,
      undefined,
      'subscription',
      {
        plan: MERCHANT_SUBSCRIPTION_PLAN,
        durationDays: MERCHANT_SUBSCRIPTION_DURATION_DAYS,
      }
    );
    transactionId = transaction.id;

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('merchant_subscriptions')
      .insert({
        merchant_id: merchantId,
        plan: MERCHANT_SUBSCRIPTION_PLAN,
        amount: MERCHANT_SUBSCRIPTION_PRICE,
        status: 'active',
        starts_at: baseDate.toISOString(),
        ends_at: endsAt.toISOString(),
        wallet_transaction_id: transaction.id,
        metadata: {
          durationDays: MERCHANT_SUBSCRIPTION_DURATION_DAYS,
          activatedAt: now.toISOString(),
          previousExpiry: info.expiresAt,
        },
      })
      .select()
      .single();

    if (subscriptionError) throw subscriptionError;
    subscriptionRecord = subscriptionData;

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: MERCHANT_SUBSCRIPTION_PLAN,
        subscription_expires_at: endsAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', merchantId)
      .select('subscription_status, subscription_plan, subscription_expires_at')
      .single();

    if (profileError) throw profileError;

    return {
      status: 'active',
      plan: updatedProfile.subscription_plan,
      expiresAt: updatedProfile.subscription_expires_at,
      daysRemaining: Math.max(
        differenceInCalendarDays(
          new Date(updatedProfile.subscription_expires_at ?? endsAt.toISOString()),
          new Date()
        ),
        0
      ),
    };
  } catch (error) {
    console.error('Erreur lors de l’activation de l’abonnement commerçant:', error);

    if (transactionId) {
      try {
        await refundToWallet(
          merchantId,
          MERCHANT_SUBSCRIPTION_PRICE,
          'Remboursement abonnement commerçant (échec activation)',
          subscriptionRecord?.id ?? undefined,
          'subscription',
          {
            transactionId,
          }
        );
      } catch (refundError) {
        console.error('Erreur lors du remboursement suite à un échec d’abonnement:', refundError);
      }
    }

    if (subscriptionRecord?.id) {
      try {
        await supabase
          .from('merchant_subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', subscriptionRecord.id);
      } catch (cleanupError) {
        console.error('Erreur lors de la mise à jour du statut d’abonnement après échec:', cleanupError);
      }
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible d’activer l’abonnement commerçant. Vérifiez votre solde et réessayez.'
    );
  }
}

export async function getMerchantLotQuota(
  merchantId: string,
  subscriptionInfo?: MerchantSubscriptionInfo
): Promise<MerchantLotQuota> {
  const info = subscriptionInfo ?? (await fetchMerchantSubscriptionInfo(merchantId));

  if (info.status === 'active') {
    return {
      limit: null,
      used: 0,
      remaining: null,
      hasActiveSubscription: true,
    };
  }

  const today = new Date();
  const startOfDayIso = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();

  const endOfDayIso = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();

  const { count, error } = await supabase
    .from('lots')
    .select('id', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .gte('created_at', startOfDayIso)
    .lte('created_at', endOfDayIso);

  if (error) {
    console.error('Erreur lors du calcul du quota de lots:', error);
    throw new Error('Impossible de calculer votre quota de publication. Réessayez plus tard.');
  }

  const used = count ?? 0;
  const remaining = Math.max(MERCHANT_DAILY_LOT_LIMIT - used, 0);

  return {
    limit: MERCHANT_DAILY_LOT_LIMIT,
    used,
    remaining,
    hasActiveSubscription: false,
  };
}


