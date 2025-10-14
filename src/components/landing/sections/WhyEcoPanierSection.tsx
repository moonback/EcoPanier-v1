import { motion } from 'framer-motion';
import { whyPillars } from '../../../data/landingData';
import { Package, Users, Leaf, DollarSign } from 'lucide-react';

export const WhyEcoPanierSection = () => {
  const globalStats = [
    { icon: Package, value: '12,540', label: 'repas sauvés', color: 'text-success-600' },
    { icon: Leaf, value: '4.2T', label: 'de CO₂ évitées', color: 'text-primary-600' },
    { icon: Users, value: '1,980', label: 'bénéficiaires aidés', color: 'text-accent-600' },
    { icon: DollarSign, value: '52,800€', label: 'de dons solidaires', color: 'text-warning-600' }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Une solution concrète,
            <br />
            <span className="text-primary-600">locale et solidaire</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Tech et humanité réunies pour un impact mesurable
          </p>
        </motion.div>

        {/* Les 3 piliers */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {whyPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const colorClasses = {
              success: { bg: 'from-success-500 to-success-600', border: 'border-success-200', iconBg: 'bg-success-100', iconText: 'text-success-600' },
              accent: { bg: 'from-accent-500 to-accent-600', border: 'border-accent-200', iconBg: 'bg-accent-100', iconText: 'text-accent-600' },
              primary: { bg: 'from-primary-500 to-primary-600', border: 'border-primary-200', iconBg: 'bg-primary-100', iconText: 'text-primary-600' }
            };
            const colors = colorClasses[pillar.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group"
              >
                <div className={`h-full bg-white rounded-3xl border-2 ${colors.border} p-8 hover:shadow-2xl transition-all`}>
                  {/* Icône */}
                  <div className={`inline-flex p-4 rounded-2xl ${colors.iconBg} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-10 h-10 ${colors.iconText}`} strokeWidth={2} />
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-bold text-black mb-4">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 font-light leading-relaxed text-lg">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Statistiques dynamiques globales */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-black rounded-3xl p-12 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-3">Notre impact collectif</h3>
            <p className="text-white/70 text-lg font-light">En temps réel, l'impact de notre communauté</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {globalStats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <StatIcon className="w-10 h-10 mx-auto mb-4 text-white/60" strokeWidth={1.5} />
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/70 font-light">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

