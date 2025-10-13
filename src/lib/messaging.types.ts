/**
 * Types pour le système de messagerie
 * EcoPanier - Chat direct client-commerçant
 */

import type { Database } from './database.types';

// Types de base depuis la DB
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type QuickReplyTemplate = Database['public']['Tables']['quick_reply_templates']['Row'];

// Types pour les inserts
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type QuickReplyTemplateInsert = Database['public']['Tables']['quick_reply_templates']['Insert'];

// Types enrichis avec relations
export interface ConversationWithDetails extends Conversation {
  customer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  merchant: {
    id: string;
    full_name: string;
    business_name?: string;
    avatar_url?: string;
  };
  lot?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
}

// Types pour les statuts
export type ConversationStatus = 'active' | 'archived' | 'blocked';
export type MessageType = 'text' | 'quick_question' | 'negotiation' | 'custom_request';
export type QuickReplyCategory = 'general' | 'allergens' | 'schedule' | 'custom';

// Type pour créer une nouvelle conversation
export interface CreateConversationParams {
  merchantId: string;
  lotId?: string;
  initialMessage: string;
  messageType?: MessageType;
}

// Type pour envoyer un message
export interface SendMessageParams {
  conversationId: string;
  content: string;
  messageType?: MessageType;
}

// Type pour les notifications temps réel
export interface MessageNotification {
  conversationId: string;
  message: MessageWithSender;
  conversationPreview: {
    otherParticipant: string;
    lotTitle?: string;
  };
}

// Constantes
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TEMPLATE_LENGTH = 500;
export const MESSAGE_TYPES: Record<MessageType, string> = {
  text: 'Message texte',
  quick_question: 'Question rapide',
  negotiation: 'Négociation',
  custom_request: 'Demande spéciale',
};
export const QUICK_REPLY_CATEGORIES: Record<QuickReplyCategory, string> = {
  general: 'Général',
  allergens: 'Allergènes',
  schedule: 'Horaires',
  custom: 'Personnalisé',
};

