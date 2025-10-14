import { motion } from 'framer-motion';
import { features } from '../../../data/landingData';

export const FeaturesSection = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight max-w-3xl">
            Une plateforme, un impact collectif
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl font-light">
            Tout ce qu'il faut pour transformer vos habitudes alimentaires et agir concrètement pour la planète
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'from-primary-500 to-primary-600',
              pink: 'from-accent-500 to-pink-600',
              green: 'from-success-500 to-success-600',
              purple: 'from-secondary-500 to-purple-600'
            };
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-8 h-full bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
                  {/* Icône avec dégradé */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} mb-6`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-black mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-primary-50/0 group-hover:to-primary-50/20 rounded-2xl transition-all pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

