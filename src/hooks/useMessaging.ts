/**
 * Hook personnalisé pour le système de messagerie
 * EcoPanier
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchUserConversations,
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
  findOrCreateConversation,
  countUnreadMessages,
  subscribeToMessages,
  subscribeToConversations,
} from '@/utils/messagingService';
import type {
  ConversationWithDetails,
  MessageWithSender,
  CreateConversationParams,
  SendMessageParams,
} from '@/lib/messaging.types';

interface UseMessagingReturn {
  // État
  conversations: ConversationWithDetails[];
  currentMessages: MessageWithSender[];
  unreadCount: number;
  loading: boolean;
  sending: boolean;
  error: string | null;

  // Actions
  loadConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  startConversation: (params: CreateConversationParams) => Promise<string>;
  send: (params: SendMessageParams) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

/**
 * Hook pour gérer les conversations et messages
 */
export function useMessaging(): UseMessagingReturn {
  const { user } = useAuthStore();
  
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [currentMessages, setCurrentMessages] = useState<MessageWithSender[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Charger les conversations de l'utilisateur
  const loadConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchUserConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger le nombre de messages non lus
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await countUnreadMessages(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Erreur lors du comptage des messages non lus:', err);
    }
  }, [user]);

  // Ouvrir une conversation et charger ses messages
  const openConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setCurrentConversationId(conversationId);
    
    try {
      const messages = await fetchMessages(conversationId);
      setCurrentMessages(messages);
      
      // Marquer les messages comme lus
      await markMessagesAsRead(conversationId, user.id);
      
      // Rafraîchir le compteur de non-lus
      await refreshUnreadCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, [user, refreshUnreadCount]);

  // Démarrer une nouvelle conversation
  const startConversation = useCallback(async (
    params: CreateConversationParams
  ): Promise<string> => {
    if (!user) throw new Error('Non authentifié');

    setLoading(true);
    setError(null);
    
    try {
      const conversation = await findOrCreateConversation(params);
      
      // Recharger les conversations
      await loadConversations();
      
      // Ouvrir la nouvelle conversation
      await openConversation(conversation.id);
      
      return conversation.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, loadConversations, openConversation]);

  // Envoyer un message
  const send = useCallback(async (params: SendMessageParams) => {
    if (!user) return;

    setSending(true);
    setError(null);
    
    try {
      await sendMessage(params);
      
      // Recharger les messages de la conversation courante
      if (currentConversationId === params.conversationId) {
        const messages = await fetchMessages(params.conversationId);
        setCurrentMessages(messages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
      throw err;
    } finally {
      setSending(false);
    }
  }, [user, currentConversationId]);

  // Marquer comme lu
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    try {
      await markMessagesAsRead(conversationId, user.id);
      await refreshUnreadCount();
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, [user, refreshUnreadCount]);

  // Charger les conversations au montage
  useEffect(() => {
    if (user) {
      loadConversations();
      refreshUnreadCount();
    }
  }, [user, loadConversations, refreshUnreadCount]);

  // S'abonner aux nouveaux messages de la conversation courante
  useEffect(() => {
    if (!currentConversationId || !user) return;

    const unsubscribe = subscribeToMessages(currentConversationId, async (newMessage) => {
      // Ajouter le nouveau message à la liste
      setCurrentMessages(prev => [...prev, newMessage as MessageWithSender]);
      
      // Si c'est un message d'un autre utilisateur, marquer comme lu
      if (newMessage.sender_id !== user.id) {
        await markMessagesAsRead(currentConversationId, user.id);
        await refreshUnreadCount();
      }
    });

    return unsubscribe;
  }, [currentConversationId, user, refreshUnreadCount]);

  // S'abonner aux mises à jour des conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.id, () => {
      // Recharger les conversations et le compteur
      loadConversations();
      refreshUnreadCount();
    });

    return unsubscribe;
  }, [user, loadConversations, refreshUnreadCount]);

  return {
    // État
    conversations,
    currentMessages,
    unreadCount,
    loading,
    sending,
    error,

    // Actions
    loadConversations,
    openConversation,
    startConversation,
    send,
    markAsRead,
    refreshUnreadCount,
  };
}

