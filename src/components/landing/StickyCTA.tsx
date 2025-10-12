import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, X, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StickyCTA = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [stats, setStats] = useState({
    meals: 10247,
    people: 5423,
    todayMeals: 127
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé le CTA
    const dismissed = sessionStorage.getItem('ctaDismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    const handleScroll = () => {
      // Afficher après avoir scrollé 800px (après le hero)
      const shouldShow = window.scrollY > 800 && !isDismissed;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    // Alterner entre les deux CTA toutes les 8 secondes
    intervalRef.current = setInterval(() => {
      setShowDonation(prev => !prev);
    }, 8000);

    // Simuler l'incrémentation des stats en temps réel
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        meals: prev.meals + Math.floor(Math.random() * 3),
        people: prev.people + Math.floor(Math.random() * 2),
        todayMeals: prev.todayMeals + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(statsInterval);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('ctaDismissed', 'true');
  };

  const handleCTAClick = (type: 'join' | 'donate') => {
    // Track analytics (si vous avez un système d'analytics)
    console.log(`CTA clicked: ${type}`);
    navigate('/dashboard', { state: { action: type } });
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <>
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-40"
          />

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed bottom-6 left-0 right-0 z-50 px-4"
          >
            <div className="max-w-2xl mx-auto relative">
              {/* Bouton de fermeture */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                className="absolute -top-3 -right-3 w-8 h-8 bg-neutral-800 hover:bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-colors"
                aria-label="Fermer"
              >
                <X size={16} />
              </motion.button>

              <AnimatePresence mode="wait">
                {!showDonation ? (
                  // CTA Rejoindre le mouvement
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    
                    <button
                      onClick={() => handleCTAClick('join')}
                      className="relative w-full backdrop-blur-lg bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 hover:from-primary-700 hover:via-primary-800 hover:to-secondary-700 py-5 px-6 rounded-2xl text-white shadow-2xl border-2 border-primary-400/50 hover:border-primary-300 transition-all duration-300 group overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={20} className="text-warning-300 animate-pulse" />
                            <span className="text-xl font-black tracking-tight">
                              Rejoignez le mouvement
                            </span>
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              <TrendingUp size={14} className="text-success-300" />
                              <span className="font-bold text-white">
                                {stats.meals.toLocaleString()} repas sauvés
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              <span className="text-2xl leading-none">👥</span>
                              <span className="font-bold text-white">
                                {stats.people.toLocaleString()}+ membres
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <div className="text-xs text-primary-100 font-semibold uppercase tracking-wide mb-0.5">
                              Aujourd'hui
                            </div>
                            <div className="text-2xl font-black text-white">
                              +{stats.todayMeals}
                            </div>
                            <div className="text-xs text-primary-100 font-bold">
                              repas 🔥
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-3 text-xs text-primary-100 font-semibold flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-success-500/30 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-success-300 rounded-full animate-pulse" />
                          Gratuit
                        </span>
                        <span>•</span>
                        <span>Sans engagement</span>
                        <span>•</span>
                        <span>Impact immédiat</span>
                      </div>
                    </button>
                  </motion.div>
                ) : (
                  // CTA Panier suspendu
                  <motion.div
                    key="donate"
                    initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    
                    <button
                      onClick={() => handleCTAClick('donate')}
                      className="relative w-full backdrop-blur-lg bg-gradient-to-r from-accent-600 via-pink-600 to-accent-600 hover:from-accent-700 hover:via-pink-700 hover:to-accent-700 py-5 px-6 rounded-2xl text-white shadow-2xl border-2 border-accent-400/50 hover:border-accent-300 transition-all duration-300 group overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="relative">
                              <Heart 
                                size={24} 
                                fill="currentColor" 
                                className="text-white group-hover:scale-110 transition-transform animate-pulse" 
                              />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning-400 rounded-full animate-ping" />
                            </div>
                            <span className="text-xl font-black tracking-tight">
                              Offrir un panier suspendu
                            </span>
                          </div>
                          
                          <div className="text-sm text-accent-100 font-semibold mb-2">
                            Nourrissez l'espoir : 1 clic = 1 repas offert à une personne dans le besoin
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                              <span className="text-lg leading-none">🎁</span>
                              <span className="font-bold">À partir de 5€</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                              <span className="text-lg leading-none">💚</span>
                              <span className="font-bold">66% déductibles</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-center">
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30">
                            <div className="text-4xl mb-1 animate-bounce-slow">❤️</div>
                            <div className="text-xs text-accent-100 font-bold">
                              Solidarité
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Indicateur de progression */}
              <div className="mt-3 flex justify-center gap-2">
                <motion.div
                  animate={{
                    scale: !showDonation ? 1.2 : 1,
                    opacity: !showDonation ? 1 : 0.5
                  }}
                  className="w-2 h-2 rounded-full bg-white shadow-soft-md"
                />
                <motion.div
                  animate={{
                    scale: showDonation ? 1.2 : 1,
                    opacity: showDonation ? 1 : 0.5
                  }}
                  className="w-2 h-2 rounded-full bg-white shadow-soft-md"
                />
              </div>
            </div>
          </motion.div>

          <style>{`
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            .animate-bounce-slow {
              animation: bounce-slow 2s ease-in-out infinite;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};