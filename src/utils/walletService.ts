import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { formatCurrency } from './helpers';

type Wallet = Database['public']['Tables']['wallets']['Row'];
type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row'];
type WalletInsert = Database['public']['Tables']['wallets']['Insert'];
type WalletTransactionInsert = Database['public']['Tables']['wallet_transactions']['Insert'];
type WalletUpdate = Database['public']['Tables']['wallets']['Update'];

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
  type: 'recharge' | 'payment' | 'refund' | 'all',
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

    if (type !== 'all') {
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
  type?: 'recharge' | 'payment' | 'refund'
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

