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
          className="fixed bottom-6 left-0 right-0 z-50 px-6"
        >
          <div className="max-w-2xl mx-auto">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="group w-full flex items-center justify-between bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 text-white px-6 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02] relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🛒</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Trouvez votre premier panier</div>
                  <div className="text-sm text-white/90 font-light">
                    Économisez jusqu'à -70% • Repas à partir de 2€
                  </div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform flex-shrink-0 relative z-10" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

