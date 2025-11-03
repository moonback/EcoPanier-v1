import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  reservation_id?: string;
  content: string;
  message_type: 'text' | 'quick_reply' | 'image' | 'document';
  attachment_url?: string;
  read: boolean;
  created_at: string;
  senderProfile?: { full_name: string; };
}

export interface QuickReply {
  id: string;
  text: string;
  emoji?: string;
  category: string;
}

// ============================================
// ENVOYER UN MESSAGE
// ============================================

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content: string,
  reservationId?: string,
  messageType: 'text' | 'quick_reply' | 'image' | 'document' = 'text',
  attachmentUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        reservation_id: reservationId,
        content,
        message_type: messageType,
        attachment_url: attachmentUrl,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur envoi message:', error);
    throw error;
  }
};

// ============================================
// RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION
// ============================================

export const getConversation = async (
  userId: string,
  otherUserId: string,
  limit = 50
) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(full_name)
      `)
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse() as Message[];
  } catch (error) {
    console.error('Erreur récupération conversation:', error);
    throw error;
  }
};

// ============================================
// RÉCUPÉRER LES CONVERSATIONS DE L'UTILISATEUR
// ============================================

export const getUserConversations = async (userId: string) => {
  try {
    // Récupérer les derniers messages avec chaque personne
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        read,
        created_at,
        sender:sender_id(full_name, id),
        recipient:recipient_id(full_name, id)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Grouper par conversation unique
    const conversations = new Map();
    data?.forEach((msg: any) => {
      const otherUserId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          otherUserId,
          otherUserName: msg.sender_id === userId ? msg.recipient.full_name : msg.sender.full_name,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: msg.recipient_id === userId && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversations.get(otherUserId);
        if (msg.recipient_id === userId && !msg.read) {
          conv.unreadCount += 1;
        }
      }
    });

    return Array.from(conversations.values());
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    throw error;
  }
};

// ============================================
// MARQUER MESSAGES COMME LUS
// ============================================

export const markMessagesAsRead = async (
  recipientId: string,
  senderId: string
) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('recipient_id', recipientId)
      .eq('sender_id', senderId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur marquer messages comme lus:', error);
    throw error;
  }
};

// ============================================
// COMPTER MESSAGES NON LUS
// ============================================

export const getUnreadMessageCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erreur compte messages non lus:', error);
    return 0;
  }
};

// ============================================
// RÉCUPÉRER LES RÉPONSES RAPIDES
// ============================================

export const getQuickReplies = async (role: string) => {
  try {
    const { data, error } = await supabase
      .from('quick_replies')
      .select('*')
      .eq('role', role)
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as QuickReply[];
  } catch (error) {
    console.error('Erreur récupération réponses rapides:', error);
    return [];
  }
};

// ============================================
// SUPABASE REALTIME - ÉCOUTER LES MESSAGES
// ============================================

export const subscribeToConversation = (
  userId: string,
  otherUserId: string,
  onMessage: (message: Message) => void
) => {
  const channel = supabase
    .channel(`messages:${userId}:${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId}))`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
};
