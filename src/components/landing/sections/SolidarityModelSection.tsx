import { motion } from 'framer-motion';
import { Check, Heart, Shield, Users, QrCode, ArrowRight } from 'lucide-react';

export const SolidarityModelSection = () => {
  const solidarityFeatures = [
    {
      icon: Users,
      title: 'Maximum 2 lots solidaires par jour',
      description: 'Soutenus par la communauté pour garantir un accès équitable à tous les bénéficiaires',
      emoji: '👥'
    },
    {
      icon: QrCode,
      title: 'Retrait identique aux autres clients',
      description: 'Même processus QR code + PIN, sans distinction visible',
      emoji: '📱'
    },
    {
      icon: Shield,
      title: 'Aucun marquage "spécial bénéficiaire"',
      description: 'Préservation totale de la dignité et de la confidentialité',
      emoji: '🛡️'
    },
    {
      icon: Heart,
      title: 'Suivi en toute transparence',
      description: 'Associations et commerçants suivent l\'impact en temps réel',
      emoji: '💖'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-pink-50 via-rose-50 to-accent-50 overflow-hidden">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/slide-2.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-5 pointer-events-none select-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-rose-50/80 to-accent-50/80" />
      </div>

      {/* Orbs décoratifs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-5 py-2.5 rounded-full font-bold border border-accent-200 mb-6 shadow-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 fill-accent-600" />
            </motion.div>
            <span>Solidarité intégrée</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Un modèle de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-pink-600 to-rose-600 animate-gradient">
              solidarité unique
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-light leading-relaxed">
            Les lots solidaires : une aide digne et transparente, soutenue par la communauté, pour les personnes en situation de précarité
          </p>
        </motion.div>

        {/* Section explicative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-20">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative bg-white rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-2 border-accent-100 overflow-hidden group hover:shadow-accent-500/20 transition-all duration-300">
              {/* Orb décoratif */}
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 bg-accent-400/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
              />

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="inline-block text-6xl mb-6"
                >
                  🤝
                </motion.div>

                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">
                  Comment ça marche ?
                </h3>
                
                <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed mb-6">
                  Les commerçants créent des lots <strong className="font-bold text-accent-600">solidaires soutenus par la communauté</strong>, 
                  réservés aux bénéficiaires vérifiés par les associations partenaires. Grâce aux dons et à la solidarité locale, 
                  ces personnes peuvent accéder à de bons produits <strong className="font-bold text-accent-600">sans frais</strong>.
                </p>
                
                <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed mb-8">
                  Le système garantit <strong className="font-bold text-accent-600">dignité</strong> et <strong className="font-bold text-accent-600">confidentialité</strong> : 
                  aucune différence visible entre un client payant et un bénéficiaire lors du retrait.
                </p>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-3 bg-success-50 text-success-700 px-6 py-4 rounded-2xl font-bold border-2 border-success-200 shadow-lg"
                >
                  <Check className="w-6 h-6" strokeWidth={3} />
                  <span>Système déjà actif sur la plateforme</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Caractéristiques */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4 md:space-y-6"
          >
            {solidarityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1] as const
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="group"
                >
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-accent-100 hover:border-accent-200 overflow-hidden relative">
                    {/* Effet de fond au hover */}
                    <motion.div
                      className="absolute inset-0 bg-accent-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                    />

                    <div className="flex items-start gap-4 relative z-10">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="flex-shrink-0 p-4 bg-gradient-to-br from-accent-500 to-pink-500 rounded-2xl shadow-xl"
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                      </motion.div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2 leading-tight">
                          {feature.title}
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="flex-shrink-0 text-3xl"
                      >
                        {feature.emoji}
                      </motion.div>
                    </div>

                    {/* Ligne décorative */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-pink-500 origin-left"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA modernisé */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <motion.button
            onClick={() => window.location.href = '/help'}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-accent-600 via-pink-600 to-rose-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl transition-all shadow-xl"
            type="button"
          >
            <Heart className="w-6 h-6 fill-white" />
            <span>Comprendre le programme solidaire</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

