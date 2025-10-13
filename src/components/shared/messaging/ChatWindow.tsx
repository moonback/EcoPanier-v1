/**
 * Fenêtre de chat avec messages
 * EcoPanier
 */

import { useEffect, useRef } from 'react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Package } from 'lucide-react';
import type { MessageWithSender, ConversationWithDetails } from '@/lib/messaging.types';

interface ChatWindowProps {
  messages: MessageWithSender[];
  conversation: ConversationWithDetails | null;
  currentUserId: string;
  loading?: boolean;
}

export function ChatWindow({
  messages,
  conversation,
  currentUserId,
  loading = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <Package className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          Sélectionnez une conversation
        </h3>
        <p className="text-sm text-neutral-500">
          Choisissez une conversation dans la liste pour voir les messages
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          Début de la conversation
        </h3>
        <p className="text-sm text-neutral-500">
          Envoyez votre premier message pour démarrer l'échange
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const showDateSeparator =
          index === 0 ||
          !isSameDay(
            new Date(message.created_at),
            new Date(messages[index - 1].created_at)
          );

        return (
          <div key={message.id}>
            {/* Séparateur de date */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-neutral-100 rounded-full text-xs text-neutral-600">
                  {format(new Date(message.created_at), 'EEEE d MMMM yyyy', {
                    locale: fr,
                  })}
                </div>
              </div>
            )}

            {/* Message */}
            <div
              className={`flex items-start gap-3 ${
                isOwnMessage ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isOwnMessage ? 'bg-primary-500' : 'bg-neutral-300'
                  }`}
                >
                  <span className="text-xs font-semibold text-white">
                    {message.sender.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Bulle de message */}
              <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                {/* Nom et heure */}
                <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs font-medium text-neutral-700">
                    {message.sender.full_name}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {format(new Date(message.created_at), 'HH:mm')}
                  </span>
                </div>

                {/* Contenu */}
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Type de message (badge) */}
                  {message.message_type !== 'text' && (
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isOwnMessage
                            ? 'bg-primary-600 text-primary-100'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {message.message_type === 'quick_question' && '❓ Question rapide'}
                        {message.message_type === 'negotiation' && '💬 Négociation'}
                        {message.message_type === 'custom_request' && '✨ Demande spéciale'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Statut de lecture */}
                {isOwnMessage && message.is_read && (
                  <div className="text-xs text-neutral-500 mt-1">
                    Lu {message.read_at && format(new Date(message.read_at), 'HH:mm')}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Ancre pour l'auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
}

