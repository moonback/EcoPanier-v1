import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, Sparkles } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';

const heroHighlights = [
  {
    icon: ChefHat,
    label: 'Solution dédiée restaurateurs',
  },
  {
    icon: Sparkles,
    label: 'Lots créés en 2 min avec l\'IA',
  },
];

const heroStats = [
  { value: '0 €', label: 'Frais d\'inscription' },
  { value: '15 %', label: 'Commission unique' },
  { value: '100 %', label: 'Invendus valorisés' },
];

export const RestaurantHeroSection = () => {
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

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
              Transformez vos invendus en revenus récurrents et en impact positif.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-600">
              Restaurateurs, traiteurs : transformez vos restes de repas, buffets et événements en aide alimentaire. ÉcoPanier automatise la création de vos lots et vous permet de participer à la solidarité alimentaire locale.
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
              Nos restaurateurs pilotes valorisent 100 % de leurs invendus dès le premier mois.
            </p>
            <p className="text-sm text-neutral-600">
              Chiffres issus des tests 2025 réalisés auprès de restaurants et traiteurs franciliens.
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
