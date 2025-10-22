// 1. Imports externes
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// Icône 'ArrowDown' ajoutée pour la cohérence
import { ArrowRight, Sparkles, Users, ArrowDown } from 'lucide-react';

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
export function HeroSection() {
  // B. Hooks (stores, contexts, router)
  const navigate = useNavigate();

  // D. Handlers
  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };
  
  // F. Render principal
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image avec overlay */}
      <div 
        // ❌ SUPPRESSION du style inline
        // ✅ UTILISATION de la classe Tailwind personnalisée (Layout -> Sizing -> Image)
        className="absolute inset-0 bg-hero-background bg-cover bg-center bg-no-repeat"
      >
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
          {/* Badge animé (Ordre des classes vérifié) */}
          <motion.div variants={badgeVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/15 px-6 py-3 font-semibold text-white shadow-2xl backdrop-blur-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <span>Plateforme Anti-Gaspillage & Solidaire</span>
            </div>
          </motion.div>
          
          {/* Titre principal avec gradient */}
          <motion.h1 
            variants={itemVariants}
            className="mb-6 text-5xl font-black leading-tight text-white md:text-7xl lg:text-8xl"
          >
            Ensemble contre le
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              gaspillage alimentaire
            </span>
          </motion.h1>
          
          {/* Sous-titre */}
          <motion.p 
            variants={itemVariants}
            className="mx-auto mb-12 max-w-3xl text-xl font-light leading-relaxed text-white/95 md:text-2xl"
          >
            Sauvez des invendus à <strong className="text-accent-400">prix réduits</strong>, 
            soutenez les <strong className="text-primary-400">commerçants locaux</strong> et 
            aidez les <strong className="text-secondary-400">personnes en précarité</strong>
          </motion.p>

          {/* Boutons CTA */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
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
              <span className="relative z-10">Découvrir la plateforme</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/commercants')}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/15 px-10 py-5 text-lg font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/25"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="mr-2 h-5 w-5" />
              <span>Je suis commerçant</span>
            </motion.button>
          </motion.div>

          {/* ✅ AMÉLIORATION ACCESSIBILITÉ & COHÉRENCE
            Remplacement du 'div' par un 'button' sémantique et focusable.
            Remplacement du SVG par l'icône Lucide 'ArrowDown'.
          */}
          <motion.button
            variants={itemVariants}
            className="mt-16 inline-flex flex-col items-center gap-2 text-white/70"
            onClick={handleScrollDown}
            aria-label="Faire défiler vers le bas pour découvrir plus"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex flex-col items-center gap-2"
            >
              <span className="text-sm font-medium">Découvrir plus</span>
              <ArrowDown className="h-6 w-6" />
            </motion.div>
          </motion.button>
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