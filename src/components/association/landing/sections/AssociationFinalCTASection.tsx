import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';

const ctaFeatures = [
  { icon: '⚡', label: 'Installation en 10 minutes' },
  { icon: '📊', label: 'Premiers bénéficiaires dès aujourd\'hui' },
  { icon: '🤝', label: 'Support dédié à votre disposition' },
];

const finalStats = [
  { value: '50+', label: 'Associations partenaires' },
  { value: '5k+', label: 'Bénéficiaires aidés' },
  { value: '100k+', label: 'Lots distribués' },
  { value: '4.9/5', label: 'Satisfaction' },
];

export const AssociationFinalCTASection = () => {
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
            Prêt à moderniser votre aide alimentaire ?
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-white/90">
            Rejoignez les associations qui ont choisi une gestion moderne et digne de l'aide alimentaire
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {ctaFeatures.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2">
              <span className="text-4xl">{feature.icon}</span>
              <span className="text-sm text-white/90">{feature.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => navigate('/auth?role=association')}
            className="btn bg-white text-neutral-900 hover:bg-neutral-100"
          >
            <span>Rejoindre la plateforme</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
          {['100% gratuit', 'Conforme RGPD', 'Support 7j/7'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/20 pt-12"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {finalStats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageSection>
  );
};

