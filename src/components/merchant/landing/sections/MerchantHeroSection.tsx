import { motion } from 'framer-motion';
import { ArrowRight, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../../shared/layout/PageSection';

const heroHighlights = [
  {
    icon: Sparkles,
    label: 'Lots publiés en 2 minutes',
  },
  {
    icon: Crown,
    label: 'Option Premium illimitée',
  },
];

const heroStats = [
  { value: '0 €', label: "Frais d'inscription" },
  { value: '8 %', label: 'Commission sur les ventes' },
  { value: '20 lots', label: 'par jour inclus dans le plan gratuit' },
];

export const MerchantHeroSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="muted" padding="lg">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
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
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600"
                >
                  <Icon className="h-4 w-4 text-primary-500" />
                  {highlight.label}
                </span>
              );
            })}
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
              Transformez vos invendus en chiffre d’affaires récurrent, sans complexité.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-600">
              ÉcoPanier digitalise vos paniers anti-gaspi, automatise la mise en vente et fidélise une clientèle locale engagée.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate('/auth?role=merchant')}
              className="btn-primary w-full sm:w-auto"
              type="button"
            >
              <span className="flex items-center gap-2">
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="btn-secondary w-full sm:w-auto"
              type="button"
            >
              Découvrir le fonctionnement
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="surface flex flex-col gap-8 p-8"
        >
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              Des résultats mesurables
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              Nos commerçants valorisent jusqu’à 30 % de leurs invendus dès le premier mois.
            </p>
            <p className="text-sm text-neutral-600">
              Données 2025 issues de boulangeries, primeurs et traiteurs franciliens partenaires.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-neutral-900">{stat.value}</span>
                <span className="text-sm text-neutral-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageSection>
  );
};

