/**
 * Service de messagerie pour le chat client-commerçant
 * EcoPanier
 */

import { supabase } from '@/lib/supabase';
import type {
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
  CreateConversationParams,
  SendMessageParams,
  QuickReplyTemplate,
  QuickReplyTemplateInsert,
} from '@/lib/messaging.types';

// ============================================================================
// CONVERSATIONS
// ============================================================================

/**
 * Récupère toutes les conversations d'un utilisateur
 */
export async function fetchUserConversations(
  userId: string
): Promise<ConversationWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url),
        merchant:profiles!merchant_id(id, full_name, business_name, avatar_url),
        lot:lots(id, title, image_url)
      `)
      .or(`customer_id.eq.${userId},merchant_id.eq.${userId}`)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data as ConversationWithDetails[];
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    throw new Error('Impossible de charger les conversations.');
  }
}

/**
 * Récupère une conversation par ID avec détails
 */
export async function fetchConversationById(
  conversationId: string
): Promise<ConversationWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customer:profiles!customer_id(id, full_name, avatar_url),
        merchant:profiles!merchant_id(id, full_name, business_name, avatar_url),
        lot:lots(id, title, image_url)
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data as ConversationWithDetails;
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    return null;
  }
}

/**
 * Trouve ou crée une conversation entre un client et un commerçant
 */
export async function findOrCreateConversation(
  params: CreateConversationParams
): Promise<Conversation> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    // Chercher une conversation existante
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', user.id)
      .eq('merchant_id', params.merchantId)
      .eq('lot_id', params.lotId || null)
      .single();

    if (existing) {
      return existing;
    }

    // Créer une nouvelle conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        customer_id: user.id,
        merchant_id: params.merchantId,
        lot_id: params.lotId,
        status: 'active',
      })
      .select()
      .single();

    if (createError) throw createError;

    // Envoyer le message initial
    if (params.initialMessage.trim()) {
      await sendMessage({
        conversationId: newConversation.id,
        content: params.initialMessage,
        messageType: params.messageType,
      });
    }

    return newConversation;
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    throw new Error('Impossible de démarrer la conversation.');
  }
}

/**
 * Archive une conversation
 */
export async function archiveConversation(conversationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'archived' })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la conversation:', error);
    throw new Error('Impossible d\'archiver la conversation.');
  }
}

/**
 * Compte les messages non lus pour un utilisateur
 */
export async function countUnreadMessages(userId: string): Promise<number> {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('customer_id, customer_unread_count, merchant_unread_count')
      .or(`customer_id.eq.${userId},merchant_id.eq.${userId}`)
      .eq('status', 'active');

    if (error) throw error;

    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.customer_id === userId 
        ? conv.customer_unread_count 
        : conv.merchant_unread_count);
    }, 0);

    return total;
  } catch (error) {
    console.error('Erreur lors du comptage des messages non lus:', error);
    return 0;
  }
}

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Récupère les messages d'une conversation
 */
export async function fetchMessages(
  conversationId: string,
  limit = 50
): Promise<MessageWithSender[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as MessageWithSender[];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw new Error('Impossible de charger les messages.');
  }
}

/**
 * Envoie un nouveau message
 */
export async function sendMessage(
  params: SendMessageParams
): Promise<Message> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const content = params.content.trim();
    if (!content) throw new Error('Le message ne peut pas être vide');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: params.conversationId,
        sender_id: user.id,
        content,
        message_type: params.messageType || 'text',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw new Error('Impossible d\'envoyer le message.');
  }
}

/**
 * Marque les messages d'une conversation comme lus
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors du marquage des messages comme lus:', error);
    // Ne pas throw, c'est une opération non critique
  }
}

// ============================================================================
// TEMPLATES DE RÉPONSES RAPIDES
// ============================================================================

/**
 * Récupère les templates de réponses rapides d'un commerçant
 */
export async function fetchQuickReplyTemplates(
  merchantId: string
): Promise<QuickReplyTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('quick_reply_templates')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return [];
  }
}

/**
 * Crée un template de réponse rapide
 */
export async function createQuickReplyTemplate(
  template: Omit<QuickReplyTemplateInsert, 'merchant_id'>
): Promise<QuickReplyTemplate> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('quick_reply_templates')
      .insert({
        ...template,
        merchant_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    throw new Error('Impossible de créer le template.');
  }
}

/**
 * Supprime un template de réponse rapide
 */
export async function deleteQuickReplyTemplate(templateId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('quick_reply_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    throw new Error('Impossible de supprimer le template.');
  }
}

/**
 * Incrémente le compteur d'utilisation d'un template
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment', {
      row_id: templateId,
      table_name: 'quick_reply_templates',
      column_name: 'usage_count',
    });

    // Si la fonction RPC n'existe pas, faire un update classique
    if (error) {
      const { data: template } = await supabase
        .from('quick_reply_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (template) {
        await supabase
          .from('quick_reply_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId);
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    // Ne pas throw, c'est une opération non critique
  }
}

// ============================================================================
// TEMPS RÉEL (REALTIME)
// ============================================================================

/**
 * S'abonne aux nouveaux messages d'une conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * S'abonne aux mises à jour de conversations
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: (conversation: Conversation) => void
) {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `customer_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Conversation);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `merchant_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Conversation);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

