import { motion } from 'framer-motion';
import { ArrowRight, Heart, TrendingDown, Zap, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../shared/layout/PageSection';



const heroStats = [
  { value: '100€+', label: 'économisés en moyenne par mois', icon: TrendingDown },
  { value: '-70%', label: 'de réduction maximale', icon: Zap },
  { value: '0.9kg', label: 'de CO₂ évité par panier', icon: Heart },
];



export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection background="muted" padding="lg" className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: 'url(/slide-7.png)' }}
      />
      
      {/* Élément décoratif animé */}
      <div className="absolute top-10 right-10 hidden lg:block">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>

      <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-8"
        >
          {/* Titre principal accrocheur */}
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-7xl"
            >
              <span className="block">Arrêtez de gaspiller</span>
              <span className="block text-primary-600">
                votre argent
                <Sparkles className="inline-block h-8 w-8 ml-2 text-accent-500 animate-pulse" />
              </span>
              <span className="block">sur vos courses !</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl text-xl leading-relaxed text-neutral-700 sm:text-2xl"
            >
              <strong className="text-neutral-900">Réduisez vos dépenses jusqu'à -70%</strong> tout en{' '}
              <strong className="text-primary-600">sauvant la planète</strong> et{' '}
              <strong className="text-accent-600">aidant les plus démunis</strong>. 
              <span className="block mt-2 text-lg text-neutral-600">
                Des paniers de qualité près de chez vous. <span className="font-semibold text-accent-600">Inscription gratuite en 30 secondes.</span>
              </span>
            </motion.p>
          </div>

          {/* CTAs renforcés */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group btn-primary relative w-full overflow-hidden text-lg font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" />
                Trouver mon premier panier maintenant
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </button>
            
            <button
              onClick={() => navigate('/how-it-works')}
              className="btn-secondary w-full border-2 text-base font-semibold sm:w-auto"
            >
              <Clock className="mr-2 inline-block h-4 w-4" />
              Comment ça marche ?
            </button>
          </motion.div>

          

        </motion.div>

        {/* Carte statistiques améliorée */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="surface group relative flex flex-col gap-8 overflow-hidden rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-white to-primary-50/30 p-8 shadow-xl"
        >
          {/* Badge exclusivité */}
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <Sparkles className="h-3 w-3" />
              Exclusif
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
              Votre impact en temps réel
            </p>
            <p className="text-3xl font-bold leading-tight text-neutral-900">
              Des <span className="text-primary-600">économies massives</span> et un{' '}
              <span className="text-accent-600">impact mesurable</span> dès votre première commande.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              Rejoignez des milliers de personnes qui économisent tout en agissant concrètement pour l'environnement et la solidarité.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {heroStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="group/stat flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
                >
                  <Icon className="h-6 w-6 text-primary-500" />
                  <span className="text-4xl font-bold text-neutral-900">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-neutral-600">{stat.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* CTA secondaire dans la carte */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:shadow-primary-500/30"
          >
            Commencer maintenant →
          </motion.button>
        </motion.div>
      </div>
    </PageSection>
  );
};

