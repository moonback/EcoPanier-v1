import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const StickyCTA = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  // 🎯 Gère la visibilité selon le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // vérifie au chargement
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⏱️ Alterne entre les deux CTA toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setShowDonation((prev) => !prev);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const springTransition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={springTransition}
          className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <AnimatePresence mode="wait">
              {!showDonation ? (
                <motion.button
                  key="join"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => navigate("/dashboard")}
                  aria-label="Rejoindre le mouvement ÉcoPanier"
                  role="button"
                  tabIndex={0}
                  className="w-full py-4 rounded-full text-lg font-semibold text-white shadow-xl hover:shadow-2xl backdrop-blur-md 
                            bg-gradient-to-r from-green-600 to-green-700 border border-green-400
                            transition-all duration-300 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="font-bold">🌍 Rejoindre le mouvement</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <div className="text-xs mt-1 text-green-100 font-medium">
                    +10 000 repas déjà sauvés 🍽️
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  key="donate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => navigate("/dashboard")}
                  aria-label="Offrir un panier suspendu"
                  role="button"
                  tabIndex={0}
                  className="w-full py-4 rounded-full text-lg font-semibold text-white shadow-xl hover:shadow-2xl backdrop-blur-md 
                            bg-gradient-to-r from-pink-600 to-rose-600 border border-pink-400
                            transition-all duration-300 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Heart
                      size={20}
                      fill="currentColor"
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>🎁 Offrir un panier suspendu</span>
                  </span>
                  <div className="text-xs mt-1 text-pink-100 font-medium">
                    1 clic = 1 repas offert ❤️
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
