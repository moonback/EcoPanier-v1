import { motion } from 'framer-motion';
import { ArrowRight, Heart, ShieldCheck, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../shared/layout/PageSection';

const heroHighlights = [
  {
    icon: TrendingDown,
    label: 'Jusqu\'à -70% sur vos courses',
  },
  
];

const heroStats = [
  { value: '100€', label: 'économisés en moyenne par mois' },
  { value: '-70%', label: 'de réduction sur vos courses' },
  { value: '0.9kg', label: 'de CO₂ évité par panier' },
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="muted" padding="lg" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url(/slide-7.png)' }}
      />
      <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
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
            <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl lg:text-6xl">
              Économisez jusqu'à <span className="text-primary-600">-70%</span> sur vos courses tout en agissant pour la planète.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
              Découvrez des paniers surprises de qualité à prix réduits chez vos commerçants locaux. <strong className="text-neutral-900">Économisez intelligemment</strong>, <strong className="text-neutral-900">sauvez des repas du gaspillage</strong>, et <strong className="text-primary-600">offrez des paniers suspendus</strong> aux personnes dans le besoin. Chaque achat compte pour votre portefeuille et pour la planète.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                Trouver mon premier panier
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="btn-secondary w-full sm:w-auto"
            >
              Comment ça marche ?
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary-500" />
              <span><strong className="text-neutral-900">Inscription gratuite</strong>, sans engagement ni frais cachés</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary-500" />
              <span><strong className="text-neutral-900">Chaque achat</strong> soutient directement un bénéficiaire</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary-500" />
              <span><strong className="text-neutral-900">Suivez votre impact</strong> : économies réalisées, repas sauvés, CO₂ évité</span>
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
              Vos bénéfices concrets
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              Des économies réelles et un impact positif mesurable à chaque achat.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Rejoignez des milliers de clients qui économisent tout en agissant pour l'environnement et la solidarité.
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

