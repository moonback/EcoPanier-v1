// 1. Imports externes
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Sparkles } from 'lucide-react';

// 2. Imports internes (stores, contexts, components)
// (aucun dans cet exemple)

// 3. Imports types
// (aucun dans cet exemple)

// 4. Définition des types/interfaces
// (aucun dans cet exemple)

// --- Constantes du composant (bon pour les performances de F-Motion) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15
    }
  }
};

// 5. Composant
export const CollectorHeroSection = () => {
  // B. Hooks (stores, contexts, router)
  const navigate = useNavigate();

  // F. Render principal
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image avec overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/slide-4.png)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
        
        {/* Effet de lumière animé */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-secondary-500/20"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge animé */}
          <motion.div variants={badgeVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/15 px-6 py-3 font-semibold text-white shadow-2xl backdrop-blur-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Truck className="h-5 w-5" />
              </motion.div>
              <span>Réseau de collecteurs solidaires</span>
            </div>
          </motion.div>
          
          {/* Titre principal avec gradient */}
          <motion.h1 
            variants={itemVariants}
            className="mb-6 text-5xl font-black leading-tight text-white md:text-7xl lg:text-8xl"
          >
            Transformez vos trajets
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              en revenus solidaires
            </span>
          </motion.h1>
          
          {/* Sous-titre */}
          <motion.p 
            variants={itemVariants}
            className="mx-auto mb-12 max-w-3xl text-xl font-light leading-relaxed text-white/95 md:text-2xl"
          >
            Rejoignez notre réseau de collecteurs et livrez des <strong className="text-accent-400">repas solidaires</strong> 
            tout en <strong className="text-primary-400">gagnant de l'argent</strong> et en participant à la 
            <strong className="text-secondary-400"> lutte contre le gaspillage</strong>
          </motion.p>

          {/* Boutons CTA */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-16"
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-primary-500/50"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Devenir collecteur</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/collecteurs')}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/15 px-10 py-5 text-lg font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/25"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Truck className="mr-2 h-5 w-5" />
              <span>En savoir plus</span>
            </motion.button>
          </motion.div>

          {/* Stats rapides */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl font-bold text-white mb-2">7€</div>
              <div className="text-sm text-white/70">Par livraison</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl font-bold text-white mb-2">Flexible</div>
              <div className="text-sm text-white/70">Horaires libres</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-white/70">Solidaire</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Particules flottantes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </section>
  );
};
