import { motion } from 'framer-motion';
import { keyFeatures } from '../../../data/landingData';

export const KeyFeaturesSection = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">⚙️</span>
            <span>Technologie</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Une technologie simple
            <br />
            au service du bien
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Des outils puissants et intuitifs pour faciliter la vie de tous les acteurs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              primary: { bg: 'from-primary-500 to-primary-600', text: 'text-primary-600', bgLight: 'bg-primary-50' },
              secondary: { bg: 'from-secondary-500 to-secondary-600', text: 'text-secondary-600', bgLight: 'bg-secondary-50' },
              accent: { bg: 'from-accent-500 to-accent-600', text: 'text-accent-600', bgLight: 'bg-accent-50' },
              success: { bg: 'from-success-500 to-success-600', text: 'text-success-600', bgLight: 'bg-success-50' },
              warning: { bg: 'from-warning-500 to-warning-600', text: 'text-warning-600', bgLight: 'bg-warning-50' },
              purple: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-50' }
            };
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className={`h-full ${colors.bgLight} rounded-2xl p-8 border-2 border-transparent hover:border-gray-200 hover:shadow-xl transition-all`}>
                  {/* Icône */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors.bg} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>

                  {/* Titre */}
                  <h3 className={`text-xl font-bold mb-3 ${colors.text} group-hover:text-black transition-colors`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-medium hover:shadow-xl transition-all"
          >
            Explorer les fonctionnalités
          </button>
        </motion.div>
      </div>
    </section>
  );
};

