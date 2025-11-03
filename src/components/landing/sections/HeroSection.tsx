import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../shared/layout/PageSection';

const heroHighlights = [
  {
    icon: Sparkles,
    label: 'Plateforme solidaire anti-gaspi',
  },
  {
    icon: Users,
    label: '5 rôles connectés en temps réel',
  },
  {
    icon: Leaf,
    label: '0,9 kg de CO₂ évité par panier sauvé',
  },
];

const heroStats = [
  { value: '-70%', label: 'd’économies en moyenne' },
  { value: '15T', label: 'de CO₂ évitées' },
  { value: '1 980', label: 'bénéficiaires accompagnés' },
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="muted" padding="lg">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-wrap gap-3">
            {heroHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <span
                  key={highlight.label}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600"
                >
                  <Icon className="h-4 w-4 text-primary-500" />
                  {highlight.label}
                </span>
              );
            })}
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
              Sauvez des repas, soutenez votre quartier et renforcez la solidarité locale.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-600">
              ÉcoPanier connecte commerçants, clients, associations, collecteurs et bénéficiaires autour d’une plateforme unique pour valoriser les invendus et offrir des paniers solidaires.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="btn-secondary w-full sm:w-auto"
            >
              Découvrir le fonctionnement
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span>Inscription gratuite, sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-500" />
              <span>Interface dédiée pour chaque acteur</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="surface flex flex-col gap-8 p-8"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
              En chiffres
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              Un impact mesurable pour l’écologie et la solidarité, partout en France.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Données issues des tests avec nos premiers partenaires pilotes en 2025.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-neutral-900">
                  {stat.value}
                </span>
                <span className="text-sm text-neutral-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageSection>
  );
};

