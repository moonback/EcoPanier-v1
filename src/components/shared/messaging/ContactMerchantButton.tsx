/**
 * Bouton pour contacter un commerçant
 * EcoPanier
 */

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuthStore } from '@/stores/authStore';
import type { MessageType } from '@/lib/messaging.types';

interface ContactMerchantButtonProps {
  merchantId: string;
  merchantName: string;
  lotId?: string;
  lotTitle?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ContactMerchantButton({
  merchantId,
  merchantName,
  lotId,
  lotTitle,
  variant = 'secondary',
  className = '',
}: ContactMerchantButtonProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { startConversation } = useMessaging();
  
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [sending, setSending] = useState(false);

  // Templates de messages rapides
  const quickMessages = [
    { type: 'quick_question' as MessageType, text: 'Bonjour, ce lot contient-il des allergènes ?' },
    { type: 'negotiation' as MessageType, text: 'Bonjour, est-il possible de venir 30 minutes plus tard ?' },
    { type: 'custom_request' as MessageType, text: 'Bonjour, puis-je avoir plus de légumes et moins de fruits ?' },
    { type: 'text' as MessageType, text: 'Bonjour, j\'ai une question concernant ce lot.' },
  ];

  const handleStartConversation = async (initialMessage?: string, type?: MessageType) => {
    if (!user) {
      alert('Veuillez vous connecter pour contacter le commerçant');
      navigate('/login');
      return;
    }

    if (profile?.role !== 'customer') {
      alert('Seuls les clients peuvent contacter les commerçants');
      return;
    }

    setSending(true);
    try {
      const conversationId = await startConversation({
        merchantId,
        lotId,
        initialMessage: initialMessage || message,
        messageType: type || messageType,
      });

      // Rediriger vers la page de messagerie
      navigate('/messages', { state: { conversationId } });
    } catch (error) {
      console.error('Erreur lors du démarrage de la conversation:', error);
      alert('Impossible de démarrer la conversation. Veuillez réessayer.');
    } finally {
      setSending(false);
      setShowQuickMessage(false);
    }
  };

  const buttonClass = variant === 'primary'
    ? 'bg-primary-500 text-white hover:bg-primary-600'
    : 'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50';

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setShowQuickMessage(true)}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 rounded-lg
          font-medium transition-all duration-200 shadow-md hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonClass}
          ${className}
        `}
        disabled={sending}
      >
        <MessageCircle className="w-5 h-5" />
        <span>Contacter</span>
      </button>

      {/* Modal de message rapide */}
      {showQuickMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 border-b-2 border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Contacter {merchantName}
                </h2>
                {lotTitle && (
                  <p className="text-sm text-neutral-500 mt-1">
                    À propos de : {lotTitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowQuickMessage(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Messages rapides prédéfinis */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Messages rapides
                </label>
                <div className="space-y-2">
                  {quickMessages.map((quick, index) => (
                    <button
                      key={index}
                      onClick={() => handleStartConversation(quick.text, quick.type)}
                      disabled={sending}
                      className="
                        w-full p-3 text-left rounded-lg
                        bg-neutral-50 hover:bg-primary-50 hover:border-primary-300
                        border-2 border-neutral-200
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-700">{quick.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ou message personnalisé */}
              <div className="pt-4 border-t-2 border-neutral-200">
                <label htmlFor="custom-message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Ou écrivez votre propre message
                </label>
                <textarea
                  id="custom-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  rows={4}
                  className="
                    w-full px-4 py-3 border-2 border-neutral-300 rounded-lg
                    focus:border-primary-500 focus:outline-none
                    resize-none
                  "
                />
                
                {/* Type de message */}
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as MessageType)}
                  className="
                    mt-2 w-full px-3 py-2 text-sm
                    border-2 border-neutral-300 rounded-lg
                    focus:border-primary-500 focus:outline-none
                  "
                >
                  <option value="text">Message général</option>
                  <option value="quick_question">Question rapide</option>
                  <option value="negotiation">Négociation</option>
                  <option value="custom_request">Demande spéciale</option>
                </select>

                <button
                  onClick={() => handleStartConversation()}
                  disabled={!message.trim() || sending}
                  className="
                    w-full mt-4 px-4 py-3 rounded-lg
                    bg-primary-500 text-white font-medium
                    hover:bg-primary-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    flex items-center justify-center gap-2
                  "
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

