import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../stores/authStore';

export const MerchantStickyCTA = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ne pas afficher le CTA si l'utilisateur est déjà commerçant connecté
  if (user && profile?.role === 'merchant') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-0 right-0 z-50 px-6"
        >
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/auth?role=merchant')}
              className="group w-full flex items-center justify-between bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:from-secondary-700 hover:to-secondary-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏪</span>
                <div className="text-left">
                  <div className="font-semibold">Commencez gratuitement</div>
                  <div className="text-xs text-white/80">Valorisez vos invendus dès aujourd'hui</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

