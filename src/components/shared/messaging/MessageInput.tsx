/**
 * Zone de saisie de message
 * EcoPanier
 */

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile } from 'lucide-react';
import { MAX_MESSAGE_LENGTH } from '@/lib/messaging.types';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  sending?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  sending = false,
  placeholder = 'Écrivez votre message...',
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending || disabled) return;

    try {
      await onSend(trimmed);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Envoyer avec Entrée (sans Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Limiter la longueur
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
    }

    // Auto-resize du textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const charsLeft = MAX_MESSAGE_LENGTH - message.length;
  const showCharCount = message.length > MAX_MESSAGE_LENGTH * 0.8;

  return (
    <div className="border-t-2 border-neutral-200 bg-white p-4">
      <div className="flex items-end gap-3">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className="
              w-full px-4 py-3 pr-12
              border-2 border-neutral-300 rounded-2xl
              resize-none overflow-y-auto
              focus:border-primary-500 focus:outline-none
              disabled:bg-neutral-100 disabled:cursor-not-allowed
              transition-colors
            "
            style={{ maxHeight: '120px' }}
          />

          {/* Compteur de caractères */}
          {showCharCount && (
            <div
              className={`
                absolute bottom-2 right-3 text-xs font-medium
                ${charsLeft < 50 ? 'text-accent-500' : 'text-neutral-400'}
              `}
            >
              {charsLeft}
            </div>
          )}
        </div>

        {/* Bouton emoji (futur) */}
        <button
          type="button"
          className="
            flex-shrink-0 p-3 rounded-full
            text-neutral-500 hover:text-primary-600 hover:bg-primary-50
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          disabled={disabled || sending}
          title="Émojis (bientôt disponible)"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Bouton d'envoi */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!message.trim() || sending || disabled}
          className="
            flex-shrink-0 p-3 rounded-full
            bg-primary-500 text-white
            hover:bg-primary-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-md hover:shadow-lg
          "
          title="Envoyer (Entrée)"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Aide */}
      <div className="mt-2 text-xs text-neutral-500 text-center">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-xs">
            Entrée
          </kbd>
          pour envoyer •
          <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-xs">
            Maj + Entrée
          </kbd>
          pour une nouvelle ligne
        </span>
      </div>
    </div>
  );
}

