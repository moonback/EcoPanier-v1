import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../shared/layout/PageSection';

const highlights = ['Inscription gratuite', 'Sans engagement', 'Suivi d’impact intégré'];

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="contrast" padding="lg">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center"
      >
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Prêt·e à rejoindre l’écosystème ÉcoPanier ?
          </h2>
          <p className="text-base text-neutral-100 sm:text-lg">
            Commerce, association, collecteur ou citoyen : sauvegardons ensemble les invendus et soutenons les personnes fragilisées de nos quartiers.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-sm text-neutral-100/80">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
            type="button"
          >
            <span className="flex items-center gap-2">
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
          <button
            onClick={() => navigate('/commercants')}
            className="btn-secondary"
            type="button"
          >
            Devenir partenaire
          </button>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-neutral-100/60">
          Aucun abonnement • Données exportables • Support réactif
        </p>
      </motion.div>
    </PageSection>
  );
};

