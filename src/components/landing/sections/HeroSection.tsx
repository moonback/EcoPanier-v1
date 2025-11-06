import { motion, Variants } from 'framer-motion';
import { ArrowRight, Zap, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../shared/layout/PageSection';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatVariants: Variants = {
  animate: {
    scale: [1, 1.15, 1],
    rotate: [0, 8, -8, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="muted" padding="lg" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: 'url(/slide-7.png)' }}
      />

      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-10 right-10 hidden lg:block text-6xl"
      >
        ✨
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <div className="space-y-6">
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl"
            >
              <motion.span
                variants={itemVariants}
                className="block"
              >
                Économisez jusqu'à 70%
              </motion.span>
              <motion.span
                variants={itemVariants}
                className="block text-primary-600"
              >
                sur vos courses
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block ml-2"
                >
                  <Sparkles className="inline-block h-8 w-8 text-accent-500" />
                </motion.span>
              </motion.span>
              <motion.span
                variants={itemVariants}
                className="block"
              >
                tout en aidant la planète
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-xl text-xl leading-relaxed text-neutral-700 sm:text-2xl"
            >
              <strong className="text-neutral-900">Produits frais à prix réduits</strong> près de chez vous.{' '}
              <strong className="text-primary-600">Gratuit</strong> et{' '}
              <strong className="text-accent-600">sans engagement</strong>.
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="group btn-primary relative w-full overflow-hidden text-lg font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" />
                Voir les paniers
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/how-it-works')}
              className="btn-secondary w-full border-2 text-base font-semibold sm:w-auto"
            >
              <Clock className="mr-2 inline-block h-4 w-4" />
              Comment ça marche ?
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </PageSection>
  );
};

