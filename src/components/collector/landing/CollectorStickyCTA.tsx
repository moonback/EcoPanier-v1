import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../stores/authStore';

export const CollectorStickyCTA = () => {
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

  // Ne pas afficher le CTA si l'utilisateur est déjà collecteur connecté
  if (user && profile?.role === 'collector') return null;

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
            <motion.button
              onClick={() => navigate('/auth?role=collector')}
              className="group w-full flex items-center justify-between bg-gradient-to-r from-success-600 to-success-700 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-success-400 to-success-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex items-center gap-3 relative z-10">
                <span className="text-2xl">🚚</span>
                <div className="text-left">
                  <div className="font-semibold">Devenez collecteur</div>
                  <div className="text-xs text-white/80">Livrez et gagnez</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0 relative z-10" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
