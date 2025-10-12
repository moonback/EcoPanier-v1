import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StickyCTA = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-0 right-0 z-50 px-4"
        >
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-primary py-4 rounded-full text-lg shadow-2xl hover:shadow-glow-lg backdrop-blur-sm bg-gradient-to-r from-primary-600 to-primary-700 border-2 border-primary-400 group"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="font-bold">🌍 Rejoindre le mouvement</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="text-xs mt-1 text-primary-100 font-semibold">
                +10 000 repas déjà sauvés 🍽️
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

