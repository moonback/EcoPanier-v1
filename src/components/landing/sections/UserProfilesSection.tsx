import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Users } from 'lucide-react';
import { userProfiles } from '../../../data/landingData';

export const UserProfilesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center lg:text-left"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Pour tous</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight max-w-5xl leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 animate-gradient">
              Une communauté
            </span>
            {' '}pour tous
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl font-light leading-relaxed">
            Consommateurs, commerçants, bénéficiaires, associations et collecteurs unis contre le gaspillage
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
          {userProfiles.map((profile, index) => {
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
                className="group h-full"
              >
                <div className="h-full bg-white rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-primary-200 overflow-hidden relative">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  />

                  <div className="flex items-start gap-4 mb-6 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="flex-shrink-0 p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-xl"
                    >
                      <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={1.5} />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 leading-tight">
                        {profile.title}
                      </h3>
                      <p className="text-base sm:text-lg text-gray-600 font-medium">
                        {profile.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-base sm:text-lg text-gray-700 mb-6 font-light leading-relaxed relative z-10">
                    {profile.description}
                  </p>
                  
                  <div className="space-y-3 relative z-10">
                    {profile.benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.15 + idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-success-500 to-emerald-500 flex items-center justify-center shadow-lg mt-0.5">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-base text-gray-700 font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 origin-left"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-10 py-6 rounded-2xl text-xl font-bold hover:shadow-2xl transition-all shadow-xl"
            type="button"
          >
            <span>Rejoindre la communauté</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

