import { useState, useEffect, useCallback } from 'react';
import {
  Message,
  QuickReply,
  sendMessage,
  getConversation,
  getUserConversations,
  markMessagesAsRead,
  getUnreadMessageCount,
  getQuickReplies,
  subscribeToConversation,
} from '@/utils/messagingService';

// Hook pour une conversation spécifique
export function useConversation(userId: string | undefined, otherUserId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);

  // Charger les messages
  const fetchMessages = useCallback(async () => {
    if (!userId || !otherUserId) return;

    try {
      setLoading(true);
      const msgs = await getConversation(userId, otherUserId);
      setMessages(msgs);
      setError(null);

      // Marquer comme lus
      await markMessagesAsRead(userId, otherUserId);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError('Impossible de charger la conversation');
    } finally {
      setLoading(false);
    }
  }, [userId, otherUserId]);

  // Charger les réponses rapides
  const loadQuickReplies = useCallback(async (role: string) => {
    try {
      const replies = await getQuickReplies(role);
      setQuickReplies(replies);
    } catch (err) {
      console.error('Erreur chargement réponses rapides:', err);
    }
  }, []);

  // S'abonner aux nouveaux messages
  useEffect(() => {
    if (!userId || !otherUserId) return;

    fetchMessages();

    // Charger réponses rapides (pour le rôle de l'utilisateur)
    // À adapter selon le rôle réel
    loadQuickReplies('customer');

    // Supabase Realtime
    const channel = subscribeToConversation(userId, otherUserId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId, otherUserId, fetchMessages, loadQuickReplies]);

  // Envoyer un message
  const sendMsg = useCallback(
    async (content: string, messageType: 'text' | 'quick_reply' = 'text') => {
      if (!userId || !otherUserId) return;

      try {
        const newMessage = await sendMessage(
          userId,
          otherUserId,
          content,
          undefined,
          messageType
        );

        if (newMessage) {
          setMessages((prev) => [...prev, newMessage[0] as Message]);
        }
      } catch (err) {
        console.error('Erreur envoi message:', err);
        throw err;
      }
    },
    [userId, otherUserId]
  );

  return {
    messages,
    quickReplies,
    loading,
    error,
    sendMessage: sendMsg,
    refresh: fetchMessages,
  };
}

// Hook pour la liste des conversations
export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [convs, unread] = await Promise.all([
        getUserConversations(userId),
        getUnreadMessageCount(userId),
      ]);

      setConversations(convs);
      setUnreadCount(unread);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();

    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(fetchConversations, 10000);

    return () => clearInterval(interval);
  }, [fetchConversations]);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    refresh: fetchConversations,
  };
}
