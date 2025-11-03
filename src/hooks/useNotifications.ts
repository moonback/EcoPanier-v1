import { useState, useEffect, useCallback } from 'react';
import {
  Notification,
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from '@/utils/notificationService';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les notifications initiales
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [allNotifications, count] = await Promise.all([
        getNotifications(userId, 50),
        getUnreadCount(userId),
      ]);

      setNotifications(allNotifications);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // S'abonner aux nouvelles notifications (Realtime)
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Supabase Realtime
    const channel = subscribeToNotifications(userId, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId, fetchNotifications]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur marquer comme lu:', err);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await markAllNotificationsAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur marquer tous comme lus:', err);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
} 