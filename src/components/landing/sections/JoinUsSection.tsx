import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, Building2, Check, Users } from 'lucide-react';

const profiles = [
  {
    emoji: '🏪',
    title: 'Commerçants',
    description: 'Transformez vos invendus en revenus',
    benefits: ['Valorisez jusqu\'à 30%', 'Gratuit et sans engagement', '2 min pour créer un lot'],
    color: 'from-secondary-500 via-purple-500 to-purple-600',
    bgColor: 'bg-secondary-50',
    borderColor: 'border-secondary-200',
    path: '/commercants',
    icon: Store
  },
  {
    emoji: '🏛️',
    title: 'Associations',
    description: 'Simplifiez votre aide alimentaire',
    benefits: ['Gestion moderne', 'Export de données', '100% gratuit'],
    color: 'from-purple-500 via-purple-600 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    path: '/associations',
    icon: Building2
  }
];

export const JoinUsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
      {/* Motif de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(45deg, #3b82f6 25%, transparent 25%), linear-gradient(-45deg, #3b82f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3b82f6 75%), linear-gradient(-45deg, transparent 75%, #3b82f6 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
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
            className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-5 py-2.5 rounded-full font-bold border border-purple-200 mb-6 shadow-sm"
          >
            <Users className="w-4 h-4" />
            Rejoignez-nous
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Vous êtes{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-600 via-purple-600 to-pink-600 animate-gradient">
              commerçant
            </span>
            {' '}ou{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 animate-gradient">
              association
            </span>
            {' '}?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Rejoignez notre mouvement et participez à la lutte contre le gaspillage alimentaire
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto mb-16 md:mb-20">
          {profiles.map((profile, index) => {
            const Icon = profile.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className={`h-full ${profile.bgColor} rounded-3xl p-8 md:p-10 border-2 ${profile.borderColor} hover:border-opacity-100 hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                  {/* Effet de gradient au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-8 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-xl`}
                    >
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
                        {profile.title}
                      </h3>
                      <p className="text-base sm:text-lg text-gray-600 font-medium">
                        {profile.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-4 mb-8 relative z-10">
                    {profile.benefits.map((benefit, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.15 + idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-lg`}>
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-base sm:text-lg text-gray-700 font-medium">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    onClick={() => navigate(profile.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r ${profile.color} text-white px-6 py-5 rounded-2xl text-lg font-bold hover:shadow-xl transition-all group relative z-10 overflow-hidden`}
                    type="button"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: '-100%', opacity: 0 }}
                      whileHover={{ x: 0, opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">En savoir plus</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                  </motion.button>

                  {/* Emoji background decoratif animé */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-4 -right-4 text-8xl opacity-10 pointer-events-none"
                  >
                    {profile.emoji}
                  </motion.div>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${profile.color} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Bénéficiaires modernisée */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 border-2 border-green-200 shadow-xl max-w-3xl mx-auto overflow-hidden group hover:shadow-2xl transition-all duration-300">
            {/* Orb décoratif */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl mb-6"
              >
                <span className="text-4xl">🤝</span>
              </motion.div>

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                  Bénéficiaires
                </span>
              </h3>
              
              <p className="text-base sm:text-lg text-gray-700 font-light mb-8 leading-relaxed max-w-2xl mx-auto">
                Vous êtes en situation de précarité ? Contactez une association partenaire près de chez vous pour accéder gratuitement à nos paniers solidaires.
              </p>
              
              <motion.button
                onClick={() => navigate('/help')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-xl transition-all"
                type="button"
              >
                <span>Trouver une association</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

