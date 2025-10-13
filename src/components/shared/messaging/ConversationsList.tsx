/**
 * Liste des conversations
 * EcoPanier
 */

import { MessageCircle, Clock, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ConversationWithDetails } from '@/lib/messaging.types';

interface ConversationsListProps {
  conversations: ConversationWithDetails[];
  currentConversationId: string | null;
  userRole: 'customer' | 'merchant';
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export function ConversationsList({
  conversations,
  currentConversationId,
  userRole,
  onSelectConversation,
  loading = false,
}: ConversationsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-600">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <MessageCircle className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          Aucune conversation
        </h3>
        <p className="text-sm text-neutral-500">
          {userRole === 'customer' 
            ? 'Contactez un commerçant pour démarrer une conversation'
            : 'Les clients pourront vous contacter via vos lots'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = userRole === 'customer' 
          ? conversation.merchant 
          : conversation.customer;
        
        const unreadCount = userRole === 'customer'
          ? conversation.customer_unread_count
          : conversation.merchant_unread_count;

        const isActive = conversation.id === currentConversationId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`
              w-full flex items-start gap-3 p-4 rounded-lg text-left
              transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 border-2 border-primary-500' 
                : 'bg-white border-2 border-neutral-200 hover:border-primary-300 hover:shadow-sm'}
            `}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-700">
                  {otherParticipant.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              {/* En-tête */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-800 truncate">
                    {userRole === 'customer' && conversation.merchant.business_name
                      ? conversation.merchant.business_name
                      : otherParticipant.full_name}
                  </h3>
                  {conversation.lot && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                      <ShoppingBag className="w-3 h-3" />
                      <span className="truncate">{conversation.lot.title}</span>
                    </div>
                  )}
                </div>
                {conversation.last_message_at && (
                  <div className="flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Dernier message */}
              {conversation.last_message_preview && (
                <p className="text-sm text-neutral-600 truncate">
                  {conversation.last_message_preview}
                </p>
              )}

              {/* Badge non lu */}
              {unreadCount > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-accent-500 rounded-full">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

