import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { formatCurrency } from './helpers';

type Wallet = Database['public']['Tables']['wallets']['Row'];
type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row'];
type WalletInsert = Database['public']['Tables']['wallets']['Insert'];
type WalletTransactionInsert = Database['public']['Tables']['wallet_transactions']['Insert'];
type WalletUpdate = Database['public']['Tables']['wallets']['Update'];
type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'];
type WithdrawalRequestInsert = Database['public']['Tables']['withdrawal_requests']['Insert'];

// Export des types
export type { WalletTransaction };

/**
 * Service pour gérer les opérations de wallet
 * Gère la récupération du solde, les recharges, les paiements et l'historique des transactions
 */

/**
 * Crée une notification pour l'utilisateur
 */
async function createNotification(
  userId: string,
  notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
    } as never);
  } catch (error) {
    // Ne pas faire échouer l'opération principale si la notification échoue
    console.error('Erreur lors de la création de la notification:', error);
  }
}

/**
 * Récupère le wallet d'un utilisateur
 */
export async function getWallet(userId: string): Promise<Wallet | null> {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Si le wallet n'existe pas, le créer automatiquement
      if (error.code === 'PGRST116') {
        const walletData: WalletInsert = {
          user_id: userId,
          balance: 0,
        };
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert(walletData as never)
          .select()
          .single();

        if (createError) throw createError;
        return newWallet;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du wallet:', error);
    throw new Error('Impossible de récupérer le wallet. Vérifiez votre connexion.');
  }
}

/**
 * Récupère le solde du wallet d'un utilisateur
 */
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    const wallet = await getWallet(userId);
    return wallet?.balance ?? 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    return 0;
  }
}

/**
 * Recharge le wallet d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @param amount - Montant à recharger (doit être > 0)
 * @param description - Description de la recharge
 * @param metadata - Métadonnées supplémentaires (optionnel)
 */
export async function rechargeWallet(
  userId: string,
  amount: number,
  description: string = 'Recharge de wallet',
  metadata?: Record<string, unknown>
): Promise<WalletTransaction> {
  try {
    if (amount <= 0) {
      throw new Error('Le montant de recharge doit être supérieur à 0');
    }

    // Récupérer le wallet
    const wallet = await getWallet(userId);
    if (!wallet) {
      throw new Error('Wallet introuvable');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Créer la transaction de recharge
    const transactionData: WalletTransactionInsert = {
      wallet_id: wallet.id,
      user_id: userId,
      type: 'recharge',
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      status: 'completed',
      metadata: metadata ?? null,
    };
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert(transactionData as never)
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Mettre à jour le solde du wallet
    const updateData: WalletUpdate = {
      balance: balanceAfter,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('wallets')
      .update(updateData as never)
      .eq('id', wallet.id);

    if (updateError) throw updateError;

    // Créer une notification de succès
    await createNotification(userId, {
      title: 'Recharge réussie',
      message: `Votre wallet a été rechargé de ${formatCurrency(amount)}. Nouveau solde: ${formatCurrency(balanceAfter)}`,
      type: 'success',
    });

    return transaction;
  } catch (error) {
    console.error('Erreur lors de la recharge du wallet:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible de recharger le wallet. Vérifiez votre connexion.'
    );
  }
}

/**
 * Effectue un paiement depuis le wallet
 * @param userId - ID de l'utilisateur
 * @param amount - Montant à débiter (doit être > 0)
 * @param description - Description du paiement
 * @param referenceId - ID de référence (ex: reservation_id)
 * @param referenceType - Type de référence (ex: 'reservation')
 * @param metadata - Métadonnées supplémentaires (optionnel)
 */
export async function payFromWallet(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
  referenceType?: 'reservation' | 'suspended_basket' | 'mission',
  metadata?: Record<string, unknown>
): Promise<WalletTransaction> {
  try {
    if (amount <= 0) {
      throw new Error('Le montant du paiement doit être supérieur à 0');
    }

    // Récupérer le wallet
    const wallet = await getWallet(userId);
    if (!wallet) {
      throw new Error('Wallet introuvable');
    }

    const balanceBefore = wallet.balance;

    // Vérifier que le solde est suffisant
    if (balanceBefore < amount) {
      throw new Error('Solde insuffisant pour effectuer ce paiement');
    }

    const balanceAfter = balanceBefore - amount;

    // Créer la transaction de paiement
    const transactionData: WalletTransactionInsert = {
      wallet_id: wallet.id,
      user_id: userId,
      type: 'payment',
      amount: -amount, // Montant négatif pour un paiement
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      reference_id: referenceId ?? null,
      reference_type: referenceType ?? null,
      status: 'completed',
      metadata: metadata ?? null,
    };
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert(transactionData as never)
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Mettre à jour le solde du wallet
    const updateData: WalletUpdate = {
      balance: balanceAfter,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('wallets')
      .update(updateData as never)
      .eq('id', wallet.id);

    if (updateError) throw updateError;

    // Créer une notification de paiement
    await createNotification(userId, {
      title: 'Paiement effectué',
      message: `Paiement de ${formatCurrency(amount)} effectué depuis votre wallet. Nouveau solde: ${formatCurrency(balanceAfter)}`,
      type: 'info',
    });

    return transaction;
  } catch (error) {
    console.error('Erreur lors du paiement depuis le wallet:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible d\'effectuer le paiement. Vérifiez votre connexion.'
    );
  }
}

/**
 * Rembourse un montant dans le wallet
 * @param userId - ID de l'utilisateur
 * @param amount - Montant à rembourser (doit être > 0)
 * @param description - Description du remboursement
 * @param referenceId - ID de référence (ex: reservation_id)
 * @param referenceType - Type de référence (ex: 'reservation')
 * @param metadata - Métadonnées supplémentaires (optionnel)
 */
export async function refundToWallet(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
  referenceType?: 'reservation' | 'suspended_basket' | 'mission',
  metadata?: Record<string, unknown>
): Promise<WalletTransaction> {
  try {
    if (amount <= 0) {
      throw new Error('Le montant du remboursement doit être supérieur à 0');
    }

    // Récupérer le wallet
    const wallet = await getWallet(userId);
    if (!wallet) {
      throw new Error('Wallet introuvable');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Créer la transaction de remboursement
    const transactionData: WalletTransactionInsert = {
      wallet_id: wallet.id,
      user_id: userId,
      type: 'refund',
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      reference_id: referenceId ?? null,
      reference_type: referenceType ?? null,
      status: 'completed',
      metadata: metadata ?? null,
    };
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert(transactionData as never)
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Mettre à jour le solde du wallet
    const updateData: WalletUpdate = {
      balance: balanceAfter,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('wallets')
      .update(updateData as never)
      .eq('id', wallet.id);

    if (updateError) throw updateError;

    // Créer une notification de remboursement
    await createNotification(userId, {
      title: 'Remboursement reçu',
      message: `Un remboursement de ${formatCurrency(amount)} a été ajouté à votre wallet. Nouveau solde: ${formatCurrency(balanceAfter)}`,
      type: 'success',
    });

    return transaction;
  } catch (error) {
    console.error('Erreur lors du remboursement dans le wallet:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible d\'effectuer le remboursement. Vérifiez votre connexion.'
    );
  }
}

/**
 * Récupère l'historique des transactions d'un wallet
 * @param userId - ID de l'utilisateur
 * @param limit - Nombre de transactions à récupérer (défaut: 50)
 * @param offset - Offset pour la pagination (défaut: 0)
 */
export async function getWalletTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    throw new Error('Impossible de récupérer l\'historique des transactions. Vérifiez votre connexion.');
  }
}

/**
 * Vérifie si le wallet a un solde suffisant pour un montant donné
 */
export async function hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
  try {
    const balance = await getWalletBalance(userId);
    return balance >= amount;
  } catch (error) {
    console.error('Erreur lors de la vérification du solde:', error);
    return false;
  }
}

/**
 * Interface pour les statistiques du wallet
 */
export interface WalletStats {
  totalRecharged: number;
  totalSpent: number;
  totalRefunded: number;
  transactionCount: number;
  rechargeCount: number;
  paymentCount: number;
  refundCount: number;
  averageTransactionAmount: number;
  lastTransactionDate: string | null;
}

/**
 * Récupère les statistiques du wallet d'un utilisateur
 */
export async function getWalletStats(userId: string): Promise<WalletStats> {
  try {
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('type, amount, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    const stats: WalletStats = {
      totalRecharged: 0,
      totalSpent: 0,
      totalRefunded: 0,
      transactionCount: transactions?.length ?? 0,
      rechargeCount: 0,
      paymentCount: 0,
      refundCount: 0,
      averageTransactionAmount: 0,
      lastTransactionDate: null,
    };

    if (transactions && transactions.length > 0) {
      let totalAmount = 0;
      let lastDate: string | null = null;

      transactions.forEach((transaction: { type: string; amount: number; created_at: string }) => {
        const amount = Math.abs(transaction.amount);
        totalAmount += amount;

        if (!lastDate || transaction.created_at > lastDate) {
          lastDate = transaction.created_at;
        }

        switch (transaction.type) {
          case 'recharge':
            stats.totalRecharged += amount;
            stats.rechargeCount++;
            break;
          case 'payment':
            stats.totalSpent += amount;
            stats.paymentCount++;
            break;
          case 'refund':
            stats.totalRefunded += amount;
            stats.refundCount++;
            break;
        }
      });

      stats.averageTransactionAmount = totalAmount / stats.transactionCount;
      stats.lastTransactionDate = lastDate;
    }

    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new Error('Impossible de récupérer les statistiques du wallet. Vérifiez votre connexion.');
  }
}

/**
 * Récupère les transactions filtrées par type
 */
export async function getWalletTransactionsByType(
  userId: string,
  type: 'recharge' | 'payment' | 'refund' | 'merchant_payment' | 'all' | undefined,
  limit: number = 50,
  offset: number = 0
): Promise<WalletTransaction[]> {
  try {
    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions filtrées:', error);
    throw new Error('Impossible de récupérer les transactions. Vérifiez votre connexion.');
  }
}

/**
 * Récupère le nombre total de transactions pour la pagination
 */
export async function getWalletTransactionsCount(
  userId: string,
  type?: 'recharge' | 'payment' | 'refund' | 'merchant_payment'
): Promise<number> {
  try {
    let query = supabase
      .from('wallet_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { count, error } = await query;

    if (error) throw error;

    return count ?? 0;
  } catch (error) {
    console.error('Erreur lors du comptage des transactions:', error);
    return 0;
  }
}

/**
 * Payer un commerçant quand le client confirme la réception d'un lot
 * @param reservationId - ID de la réservation
 * @param merchantId - ID du commerçant
 * @param amount - Montant à payer au commerçant
 * @param description - Description du paiement
 */
export async function payMerchantOnConfirmation(
  reservationId: string,
  merchantId: string,
  amount: number,
  description: string
): Promise<WalletTransaction> {
  try {
    if (amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    // Récupérer le wallet du commerçant
    const merchantWallet = await getWallet(merchantId);
    if (!merchantWallet) {
      throw new Error('Wallet du commerçant introuvable');
    }

    const balanceBefore = merchantWallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Créer la transaction de paiement au commerçant
    const transactionData: WalletTransactionInsert = {
      wallet_id: merchantWallet.id,
      user_id: merchantId,
      type: 'merchant_payment',
      amount: amount, // Montant positif pour un paiement reçu
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      reference_id: reservationId,
      reference_type: 'reservation',
      status: 'completed',
      metadata: null,
    };
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert(transactionData as never)
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Mettre à jour le solde du wallet du commerçant
    const updateData: WalletUpdate = {
      balance: balanceAfter,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase
      .from('wallets')
      .update(updateData as never)
      .eq('id', merchantWallet.id);

    if (updateError) throw updateError;

    // Créer une notification pour le commerçant
    await createNotification(merchantId, {
      title: 'Paiement reçu',
      message: `Vous avez reçu ${formatCurrency(amount)} suite à la confirmation de réception d'un lot. Nouveau solde: ${formatCurrency(balanceAfter)}`,
      type: 'success',
    });

    return transaction;
  } catch (error) {
    console.error('Erreur lors du paiement au commerçant:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible d\'effectuer le paiement au commerçant. Vérifiez votre connexion.'
    );
  }
}

/**
 * Confirme la réception d'un lot par le client et paie le commerçant
 * @param reservationId - ID de la réservation
 * @param customerId - ID du client
 */
export async function confirmReceiptAndPayMerchant(
  reservationId: string,
  customerId: string
): Promise<void> {
  try {
    // Récupérer la réservation avec le lot et le merchant_id
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        *,
        lots!inner(
          merchant_id,
          discounted_price
        )
      `)
      .eq('id', reservationId)
      .eq('user_id', customerId)
      .single();

    if (reservationError) throw reservationError;
    if (!reservation) {
      throw new Error('Réservation introuvable');
    }

    // Type assertion pour la réservation avec relations
    const reservationData = reservation as {
      status: string;
      customer_confirmed?: boolean;
      total_price: number;
      lots: { merchant_id: string; discounted_price: number; title?: string };
    };

    // Vérifier que la réservation est complétée
    if (reservationData.status !== 'completed') {
      throw new Error('La réservation doit être complétée avant de confirmer la réception');
    }

    // Vérifier que le client n'a pas déjà confirmé
    if (reservationData.customer_confirmed) {
      throw new Error('Vous avez déjà confirmé la réception de ce lot');
    }

    const merchantId = reservationData.lots.merchant_id;
    const amount = reservationData.total_price;

    // Si le montant est > 0, payer le commerçant
    if (amount > 0) {
      await payMerchantOnConfirmation(
        reservationId,
        merchantId,
        amount,
        `Paiement pour la réservation ${reservationId} - ${reservationData.lots.title || 'Lot'}`
      );
    }

    // Mettre à jour la réservation pour marquer comme confirmée
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        customer_confirmed: true,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', reservationId);

    if (updateError) throw updateError;

    // Créer une notification pour le client
    await createNotification(customerId, {
      title: 'Réception confirmée',
      message: amount > 0
        ? `Vous avez confirmé la réception. Le commerçant a reçu ${formatCurrency(amount)}.`
        : 'Vous avez confirmé la réception de votre lot.',
      type: 'success',
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation de réception:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible de confirmer la réception. Vérifiez votre connexion.'
    );
  }
}

// Constantes pour les virements
const MIN_WITHDRAWAL_AMOUNT = 100; // Montant minimum en euros
const WITHDRAWAL_COMMISSION_RATE = 0.08; // 8% de commission

/**
 * Calcule le montant net après commission pour un virement
 * @param requestedAmount - Montant demandé
 * @returns Object avec commissionAmount et netAmount
 */
export function calculateWithdrawalAmounts(requestedAmount: number): {
  commissionAmount: number;
  netAmount: number;
} {
  const commissionAmount = requestedAmount * WITHDRAWAL_COMMISSION_RATE;
  const netAmount = requestedAmount - commissionAmount;
  return { commissionAmount, netAmount };
}

/**
 * Crée une demande de virement pour un commerçant
 * @param merchantId - ID du commerçant
 * @param requestedAmount - Montant demandé (minimum 100€)
 * @param bankAccountName - Nom du titulaire du compte
 * @param bankAccountIban - IBAN du compte
 * @param bankAccountBic - BIC du compte (optionnel)
 */
export async function createWithdrawalRequest(
  merchantId: string,
  requestedAmount: number,
  bankAccountName: string,
  bankAccountIban: string,
  bankAccountBic?: string
): Promise<WithdrawalRequest> {
  try {
    // Vérifier le montant minimum
    if (requestedAmount < MIN_WITHDRAWAL_AMOUNT) {
      throw new Error(`Le montant minimum pour un virement est de ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}`);
    }

    // Récupérer le wallet du commerçant
    const wallet = await getWallet(merchantId);
    if (!wallet) {
      throw new Error('Wallet introuvable');
    }

    // Vérifier que le solde est suffisant
    if (wallet.balance < requestedAmount) {
      throw new Error(
        `Solde insuffisant. Solde disponible: ${formatCurrency(wallet.balance)}, montant demandé: ${formatCurrency(requestedAmount)}`
      );
    }

    // Calculer la commission et le montant net
    const { commissionAmount, netAmount } = calculateWithdrawalAmounts(requestedAmount);

    // Créer la demande de virement
    const withdrawalData: WithdrawalRequestInsert = {
      merchant_id: merchantId,
      wallet_id: wallet.id,
      requested_amount: requestedAmount,
      commission_amount: commissionAmount,
      net_amount: netAmount,
      status: 'pending',
      bank_account_name: bankAccountName,
      bank_account_iban: bankAccountIban,
      bank_account_bic: bankAccountBic ?? null,
    };

    const { data: withdrawalRequest, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert(withdrawalData as never)
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

    // Créer une notification pour le commerçant
    await createNotification(merchantId, {
      title: 'Demande de virement créée',
      message: `Votre demande de virement de ${formatCurrency(requestedAmount)} (net: ${formatCurrency(netAmount)} après commission) a été créée et est en attente de validation.`,
      type: 'info',
    });

    return withdrawalRequest;
  } catch (error) {
    console.error('Erreur lors de la création de la demande de virement:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible de créer la demande de virement. Vérifiez votre connexion.'
    );
  }
}

/**
 * Récupère les demandes de virement d'un commerçant
 * @param merchantId - ID du commerçant
 * @param status - Filtrer par statut (optionnel)
 */
export async function getWithdrawalRequests(
  merchantId: string,
  status?: WithdrawalRequest['status']
): Promise<WithdrawalRequest[]> {
  try {
    let query = supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as WithdrawalRequest[]) ?? [];
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de virement:', error);
    throw new Error('Impossible de récupérer les demandes de virement. Vérifiez votre connexion.');
  }
}

/**
 * Annule une demande de virement en attente
 * @param withdrawalRequestId - ID de la demande de virement
 * @param merchantId - ID du commerçant (pour vérification)
 */
export async function cancelWithdrawalRequest(
  withdrawalRequestId: string,
  merchantId: string
): Promise<void> {
  try {
    // Vérifier que la demande appartient au commerçant et est en attente
    const { data: request, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalRequestId)
      .eq('merchant_id', merchantId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) {
      throw new Error('Demande de virement introuvable');
    }

    if ((request as WithdrawalRequest).status !== 'pending') {
      throw new Error('Seules les demandes en attente peuvent être annulées');
    }

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'cancelled' } as never)
      .eq('id', withdrawalRequestId);

    if (updateError) throw updateError;

    // Créer une notification
    await createNotification(merchantId, {
      title: 'Demande de virement annulée',
      message: `Votre demande de virement de ${formatCurrency((request as WithdrawalRequest).requested_amount)} a été annulée.`,
      type: 'info',
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la demande de virement:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible d\'annuler la demande de virement. Vérifiez votre connexion.'
    );
  }
}

// Export des types et constantes
export type { WithdrawalRequest };
export { MIN_WITHDRAWAL_AMOUNT, WITHDRAWAL_COMMISSION_RATE };

// Types pour les comptes bancaires
type MerchantBankAccount = Database['public']['Tables']['merchant_bank_accounts']['Row'];
type MerchantBankAccountInsert = Database['public']['Tables']['merchant_bank_accounts']['Insert'];
type MerchantBankAccountUpdate = Database['public']['Tables']['merchant_bank_accounts']['Update'];

/**
 * Récupère les comptes bancaires d'un commerçant
 * @param merchantId - ID du commerçant
 */
export async function getMerchantBankAccounts(merchantId: string): Promise<MerchantBankAccount[]> {
  try {
    const { data, error } = await supabase
      .from('merchant_bank_accounts')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as MerchantBankAccount[]) ?? [];
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes bancaires:', error);
    throw new Error('Impossible de récupérer les comptes bancaires. Vérifiez votre connexion.');
  }
}

/**
 * Récupère le compte bancaire par défaut d'un commerçant
 * @param merchantId - ID du commerçant
 */
export async function getDefaultBankAccount(merchantId: string): Promise<MerchantBankAccount | null> {
  try {
    const { data, error } = await supabase
      .from('merchant_bank_accounts')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) throw error;

    return data as MerchantBankAccount | null;
  } catch (error) {
    console.error('Erreur lors de la récupération du compte par défaut:', error);
    return null;
  }
}

/**
 * Crée ou met à jour un compte bancaire pour un commerçant
 * @param merchantId - ID du commerçant
 * @param accountData - Données du compte bancaire
 * @param accountId - ID du compte à mettre à jour (optionnel, pour mise à jour)
 */
export async function saveMerchantBankAccount(
  merchantId: string,
  accountData: {
    account_name: string;
    iban: string;
    bic?: string;
    is_default?: boolean;
  },
  accountId?: string
): Promise<MerchantBankAccount> {
  try {
    // Nettoyer l'IBAN (supprimer les espaces)
    const cleanIban = accountData.iban.replace(/\s/g, '').toUpperCase();

    if (accountId) {
      // Mise à jour
      const updateData: MerchantBankAccountUpdate = {
        account_name: accountData.account_name,
        iban: cleanIban,
        bic: accountData.bic?.toUpperCase() || null,
        is_default: accountData.is_default ?? false,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('merchant_bank_accounts')
        .update(updateData as never)
        .eq('id', accountId)
        .eq('merchant_id', merchantId)
        .select()
        .single();

      if (error) throw error;

      // Créer une notification
      await createNotification(merchantId, {
        title: 'Compte bancaire mis à jour',
        message: 'Vos informations bancaires ont été mises à jour avec succès.',
        type: 'success',
      });

      return data as MerchantBankAccount;
    } else {
      // Création
      // Si c'est le premier compte ou si is_default est true, le définir comme défaut
      const existingAccounts = await getMerchantBankAccounts(merchantId);
      const shouldBeDefault = accountData.is_default ?? existingAccounts.length === 0;

      const insertData: MerchantBankAccountInsert = {
        merchant_id: merchantId,
        account_name: accountData.account_name,
        iban: cleanIban,
        bic: accountData.bic?.toUpperCase() || null,
        is_default: shouldBeDefault,
      };

      const { data, error } = await supabase
        .from('merchant_bank_accounts')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      // Créer une notification
      await createNotification(merchantId, {
        title: 'Compte bancaire enregistré',
        message: 'Vos informations bancaires ont été enregistrées avec succès.',
        type: 'success',
      });

      return data as MerchantBankAccount;
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du compte bancaire:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible d\'enregistrer le compte bancaire. Vérifiez votre connexion.'
    );
  }
}

/**
 * Supprime un compte bancaire
 * @param accountId - ID du compte à supprimer
 * @param merchantId - ID du commerçant (pour vérification)
 */
export async function deleteMerchantBankAccount(
  accountId: string,
  merchantId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('merchant_bank_accounts')
      .delete()
      .eq('id', accountId)
      .eq('merchant_id', merchantId);

    if (error) throw error;

    // Créer une notification
    await createNotification(merchantId, {
      title: 'Compte bancaire supprimé',
      message: 'Le compte bancaire a été supprimé avec succès.',
      type: 'info',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte bancaire:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Impossible de supprimer le compte bancaire. Vérifiez votre connexion.'
    );
  }
}

// Export du type
export type { MerchantBankAccount };

