import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../shared/layout/PageSection';

const highlights = ['Gratuit', 'Sans engagement', 'Impact mesurable'];

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="contrast" padding="lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Prêt·e à économiser tout en agissant ?
          </h2>
          <p className="text-base text-neutral-100 sm:text-lg">
            Rejoignez des milliers de clients qui économisent jusqu'à 70% sur leurs courses tout en réduisant le gaspillage.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 text-sm text-neutral-100/80"
        >
          {highlights.map((item) => (
            <motion.span
              key={item}
              whileHover={{ scale: 1.05 }}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
            type="button"
          >
            <span className="flex items-center gap-2">
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/how-it-works')}
            className="btn-secondary"
            type="button"
          >
            En savoir plus
          </motion.button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xs uppercase tracking-[0.2em] text-neutral-100/60"
        >
          Aucun abonnement • Données exportables • Support réactif
        </motion.p>
      </motion.div>
    </PageSection>
  );
};

