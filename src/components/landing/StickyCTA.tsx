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
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-0 right-0 z-50 px-6"
        >
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="group w-full flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <div className="text-left">
                  <div className="font-semibold">Trouvez votre premier panier</div>
                  <div className="text-xs text-white/80">Économisez jusqu'à -70%</div>
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

