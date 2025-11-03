import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';

const ctaFeatures = [
  { icon: '✨', label: '100% gratuit' },
  { icon: '⚡', label: 'Configuration en 5 min' },
  { icon: '🚀', label: 'Impact immédiat' },
];

export const RestaurantFinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="contrast" padding="lg" className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col gap-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">Transformez vos invendus</span>
            <span className="block text-primary-400">en impact solidaire</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-white/90">
            Rejoignez gratuitement EcoPanier et donnez une seconde vie à vos repas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {ctaFeatures.map((feature) => (
            <div
              key={feature.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
            >
              <span>{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button onClick={() => navigate('/dashboard')} className="btn bg-white text-neutral-900 hover:bg-neutral-100">
            <span>Rejoindre EcoPanier</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => navigate('/help')}
            className="btn-secondary border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <span>Nous contacter</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <p className="text-sm text-white/60">Sans engagement • Accompagnement personnalisé • Support dédié</p>
      </div>
    </PageSection>
  );
};

