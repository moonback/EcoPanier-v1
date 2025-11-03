import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';

const heroStats = [
  { value: '0€', label: 'De coût' },
  { value: '100%', label: 'Valorisé' },
  { value: '2 min', label: 'Pour créer un lot' },
];

export const RestaurantHeroSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="muted" padding="lg" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: 'url(/slide-6.png)' }}
      />
      <div className="relative z-10 flex flex-col gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
            <ChefHat className="h-4 w-4" />
            <span>Solution dédiée aux restaurateurs et traiteurs</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
            Vos invendus ont
            <br />
            une <span className="text-primary-600">seconde vie</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            Restaurateurs, traiteurs : transformez vos restes de repas, buffets et événements en aide alimentaire. Pas
            de place de stockage ? Déposez vos invendus dans le{' '}
            <strong className="font-semibold text-neutral-900">locker EcoPanier le plus proche</strong>, disponible
            24/7.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              <span>Rejoindre EcoPanier</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="surface grid grid-cols-3 gap-4 p-6"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </PageSection>
  );
};
