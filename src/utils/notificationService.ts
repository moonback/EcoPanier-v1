import { supabase } from '@/lib/supabase';

export type NotificationType = 'confirmation' | 'reminder' | 'opportunity' | 'social' | 'feedback' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_type?: string;
  related_id?: string;
  read: boolean;
  action_url?: string;
  created_at: string;
  expires_at: string;
}

// ============================================
// CRÉER UNE NOTIFICATION
// ============================================

export const createNotification = async (
  userId: string,
  notification: {
    title: string;
    message: string;
    type: NotificationType;
    relatedType?: string;
    relatedId?: string;
    actionUrl?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        related_type: notification.relatedType,
        related_id: notification.relatedId,
        action_url: notification.actionUrl,
      });

    if (error) throw error;

    // Envoyer une notification push si activée
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
      });
    }

    return data;
  } catch (error) {
    console.error('Erreur création notification:', error);
    throw error;
  }
};

// ============================================
// NOTIFICATIONS PRÉDÉFINIES
// ============================================

// 1. CONFIRMATION DE RÉSERVATION
export const notifyReservationConfirmed = async (
  userId: string,
  lotTitle: string,
  merchantName: string,
  pickupPin: string,
  reservationId: string
) => {
  return createNotification(userId, {
    title: '✅ Réservation confirmée !',
    message: `${lotTitle} chez ${merchantName} - Code PIN: ${pickupPin}`,
    type: 'confirmation',
    relatedType: 'reservation',
    relatedId: reservationId,
    actionUrl: '/dashboard?tab=reservations',
  });
};

// 2. RAPPEL DE RETRAIT (1 heure avant)
export const notifyPickupReminder = async (
  userId: string,
  lotTitle: string,
  merchantName: string,
  pickupStart: string,
  reservationId: string
) => {
  const pickupTime = new Date(pickupStart).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return createNotification(userId, {
    title: '⏰ Retrait dans 1 heure',
    message: `${lotTitle} chez ${merchantName} à ${pickupTime}`,
    type: 'reminder',
    relatedType: 'reservation',
    relatedId: reservationId,
    actionUrl: '/dashboard?tab=reservations',
  });
};

// 3. OPPORTUNITÉ - LOT DISPONIBLE
export const notifyNewLotAvailable = async (
  userId: string,
  lotTitle: string,
  merchantName: string,
  discount: number,
  lotId: string
) => {
  return createNotification(userId, {
    title: '🔥 Nouveau lot disponible !',
    message: `${lotTitle} chez ${merchantName} à -${discount}%`,
    type: 'opportunity',
    relatedType: 'lot',
    relatedId: lotId,
    actionUrl: `/dashboard?tab=browse&lot=${lotId}`,
  });
};

// 4. IMPACT SOCIAL - MILESTONE
export const notifyMilestone = async (
  userId: string,
  milestone: number,
  type: 'meals' | 'co2' | 'money'
) => {
  const messages = {
    meals: `🎉 Bravo ! Vous avez sauvé ${milestone} repas !`,
    co2: `🎉 Bravo ! Vous avez réduit ${milestone}kg de CO₂ !`,
    money: `🎉 Bravo ! Vous avez économisé ${milestone}€ !`,
  };

  return createNotification(userId, {
    title: '🏆 Vous avez atteint une étape !',
    message: messages[type],
    type: 'social',
    actionUrl: '/dashboard?tab=impact',
  });
};

// 5. FEEDBACK DEMANDÉ
export const notifyFeedbackRequest = async (
  userId: string,
  merchantName: string,
  reservationId: string
) => {
  return createNotification(userId, {
    title: '📝 Nous aimerions votre avis',
    message: `Comment s'est passé votre retrait chez ${merchantName} ?`,
    type: 'feedback',
    relatedType: 'reservation',
    relatedId: reservationId,
    actionUrl: `/dashboard?tab=reservations&feedback=${reservationId}`,
  });
};

// ============================================
// RÉCUPÉRER LES NOTIFICATIONS
// ============================================

export const getNotifications = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    throw error;
  }
};

// Notifications non lues uniquement
export const getUnreadNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('Erreur récupération notifications non lues:', error);
    throw error;
  }
};

// Compter les non lues
export const getUnreadCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erreur compte notifications:', error);
    return 0;
  }
};

// ============================================
// MARQUER COMME LU
// ============================================

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur marquer comme lu:', error);
    throw error;
  }
};

// Marquer tous comme lus
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur marquer tous comme lus:', error);
    throw error;
  }
};

// ============================================
// SUPABASE REALTIME - ÉCOUTER LES NOTIFICATIONS
// ============================================

export const subscribeToNotifications = (userId: string, onNotification: (notification: Notification) => void) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return channel;
};
