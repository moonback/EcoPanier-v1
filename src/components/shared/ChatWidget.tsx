import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useConversation } from '@/hooks/useMessaging';
import type { Message, QuickReply } from '@/utils/messagingService';

interface ChatWidgetProps {
  recipientId: string;
  recipientName: string;
  onClose?: () => void;
  defaultOpen?: boolean;
}

export const ChatWidget = ({
  recipientId,
  recipientName,
  onClose,
  defaultOpen = false,
}: ChatWidgetProps) => {
  const { user, profile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [inputValue, setInputValue] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    quickReplies,
    loading,
    sendMessage: sendMsg,
  } = useConversation(user?.id, recipientId);

  // Auto scroll vers les derniers messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      await sendMsg(inputValue, 'text');
      setInputValue('');
      setShowQuickReplies(false);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleQuickReply = async (reply: QuickReply) => {
    try {
      await sendMsg(reply.text, 'quick_reply');
      setShowQuickReplies(false);
    } catch (error) {
      console.error('Erreur envoi réponse rapide:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!user) return null;

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            fixed bottom-24 right-6 p-4 rounded-full
            bg-gradient-to-br from-primary-500 to-primary-600
            text-white shadow-lg hover:shadow-xl
            transition-all duration-200 transform hover:scale-110
            z-40 animate-bounce
          "
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="
          fixed bottom-24 right-6 w-96 max-w-[90vw]
          bg-white rounded-2xl shadow-2xl
          flex flex-col max-h-96 z-50
          animate-fade-scale-in
        ">
          {/* Header */}
          <div className="
            bg-gradient-to-r from-primary-500 to-primary-600
            text-white p-4 rounded-t-2xl
            flex items-center justify-between
          ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{recipientName}</h3>
                <p className="text-xs opacity-80">Répondre</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loading && !messages.length ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin">
                  <MessageCircle className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
                <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Aucun message</p>
                <p className="text-xs">Commencez la conversation !</p>
              </div>
            ) : (
              <>
                {messages.map((message: Message) => {
                  const isCurrentUser = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-xs px-4 py-2 rounded-2xl
                          ${isCurrentUser
                            ? 'bg-primary-500 text-white rounded-br-none'
                            : 'bg-white text-neutral-900 rounded-bl-none border border-neutral-200'
                          }
                          break-words
                        `}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'opacity-70' : 'text-neutral-400'}`}>
                          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Replies */}
          {showQuickReplies && quickReplies.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-200 bg-white max-h-24 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply: QuickReply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply)}
                    className="
                      text-left text-xs p-2 rounded-lg
                      bg-neutral-100 hover:bg-primary-100
                      transition-colors border border-neutral-200
                      hover:border-primary-300
                      line-clamp-2
                    "
                  >
                    <span className="mr-1">{reply.emoji || '💬'}</span>
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-neutral-200 bg-white rounded-b-2xl space-y-2">
            {/* Quick Reply Button */}
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="
                w-full flex items-center justify-center gap-2
                text-xs font-medium text-primary-600 hover:bg-primary-50
                p-2 rounded-lg transition-colors
              "
            >
              <Zap className="w-4 h-4" />
              Réponses rapides
            </button>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Écrivez votre message..."
                className="
                  flex-1 px-3 py-2 rounded-lg border border-neutral-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  text-sm
                "
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="
                  p-2 rounded-lg bg-primary-500 text-white
                  hover:bg-primary-600 disabled:opacity-50
                  transition-colors
                "
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 