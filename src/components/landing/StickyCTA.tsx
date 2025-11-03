import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

export const StickyCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ne pas afficher le CTA si l'utilisateur est connecté (il sera redirigé)
  if (user) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:px-6"
        >
          <div className="mx-auto max-w-xl">
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-xl">
                    🛒
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-neutral-900">
                      Trouvez votre premier panier
                    </p>
                    <p className="text-sm text-neutral-600">
                      Économisez jusqu'à -70% • Retrait simple et rapide
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary w-full sm:w-auto"
                >
                  <span className="flex items-center gap-2">
                    Je crée mon compte
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

