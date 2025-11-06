// Imports externes
import { useState } from 'react';
import { X, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  confirmButtonText?: string;
}

/**
 * Modal de confirmation par mot de passe pour les actions sensibles
 * Vérifie le mot de passe avant d'autoriser une action
 */
export function PasswordConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation requise',
  message = 'Veuillez entrer votre mot de passe pour confirmer cette action',
  confirmButtonText = 'Confirmer',
}: PasswordConfirmationModalProps) {
  // État local
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer l'email de l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier le mot de passe en tentant une connexion
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInError) {
        throw new Error('Mot de passe incorrect');
      }

      // Mot de passe correct, exécuter l'action
      await onConfirm();
      
      // Réinitialiser et fermer
      setPassword('');
      setError(null);
      onClose();
    } catch (err) {
      console.error('Erreur de confirmation:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la vérification du mot de passe'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setPassword('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in-up">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <Lock className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Fermer"
            disabled={loading}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        {/* Erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Champ mot de passe */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && password.trim()) {
                  handleConfirm();
                }
              }}
              placeholder="Entrez votre mot de passe"
              disabled={loading}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 transition-all text-sm disabled:opacity-50"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

