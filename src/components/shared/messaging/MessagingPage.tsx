/**
 * Page principale de messagerie
 * EcoPanier - Chat client-commerçant
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useMessaging } from '@/hooks/useMessaging';
import { ConversationsList } from './ConversationsList';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import { QuickReplies } from './QuickReplies';
import { fetchConversationById } from '@/utils/messagingService';
import type { ConversationWithDetails } from '@/lib/messaging.types';

export function MessagingPage() {
  const { user, profile } = useAuthStore();
  const {
    conversations,
    currentMessages,
    unreadCount,
    loading,
    sending,
    error,
    openConversation,
    send,
  } = useMessaging();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithDetails | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const userRole = profile?.role === 'merchant' ? 'merchant' : 'customer';

  // Charger les détails de la conversation courante
  useEffect(() => {
    if (currentConversationId) {
      fetchConversationById(currentConversationId).then(setCurrentConversation);
    } else {
      setCurrentConversation(null);
    }
  }, [currentConversationId]);

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await openConversation(conversationId);
    setShowMobileChat(true);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;

    await send({
      conversationId: currentConversationId,
      content,
    });
  };

  const handleQuickReply = (content: string) => {
    // Cette fonction sera utilisée pour insérer le contenu dans le champ de saisie
    // Pour l'instant, on envoie directement
    if (currentConversationId) {
      handleSendMessage(content);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-neutral-600">Veuillez vous connecter pour accéder à la messagerie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* En-tête */}
      <div className="bg-white border-b-2 border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary-500" />
              <h1 className="text-2xl font-bold text-neutral-800">Messagerie</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Liste des conversations (gauche) */}
            <div
              className={`
                w-full md:w-96 border-r-2 border-neutral-200 overflow-y-auto
                ${showMobileChat ? 'hidden md:block' : 'block'}
              `}
            >
              <div className="p-4 border-b-2 border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-800">
                  Conversations ({conversations.length})
                </h2>
              </div>
              <div className="p-4">
                <ConversationsList
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  userRole={userRole}
                  onSelectConversation={handleSelectConversation}
                  loading={loading && conversations.length === 0}
                />
              </div>
            </div>

            {/* Fenêtre de chat (droite) */}
            <div
              className={`
                flex-1 flex flex-col
                ${showMobileChat ? 'block' : 'hidden md:flex'}
              `}
            >
              {/* En-tête de la conversation */}
              {currentConversation && (
                <div className="flex items-center gap-3 p-4 border-b-2 border-neutral-200 bg-white">
                  {/* Bouton retour (mobile) */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Infos conversation */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-800 truncate">
                      {userRole === 'customer'
                        ? currentConversation.merchant.business_name || currentConversation.merchant.full_name
                        : currentConversation.customer.full_name}
                    </h3>
                    {currentConversation.lot && (
                      <p className="text-sm text-neutral-500 truncate">
                        À propos de : {currentConversation.lot.title}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <ChatWindow
                messages={currentMessages}
                conversation={currentConversation}
                currentUserId={user.id}
                loading={loading && !!currentConversationId}
              />

              {/* Zone de saisie */}
              {currentConversationId && (
                <>
                  {/* Réponses rapides (commerçants uniquement) */}
                  {userRole === 'merchant' && (
                    <QuickReplies
                      merchantId={user.id}
                      onSelect={handleQuickReply}
                    />
                  )}

                  {/* Input */}
                  <MessageInput
                    onSend={handleSendMessage}
                    sending={sending}
                    disabled={!currentConversationId}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-4 bg-accent-50 border-2 border-accent-200 rounded-lg">
            <p className="text-sm text-accent-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

