import { motion } from 'framer-motion';
import { Package, Users, Leaf, DollarSign } from 'lucide-react';

export const ImpactStatsSection = () => {
  const stats = [
    { icon: Package, value: '10,247', label: 'Repas sauvés' },
    { icon: Users, value: '5,423', label: 'Personnes aidées' },
    { icon: Leaf, value: '15.2T', label: 'CO₂ évitées' },
    { icon: DollarSign, value: '52,800€', label: 'De dons' },
  ];

  return (
    <section className="relative py-32 bg-white overflow-hidden rounded-none">
      {/* Image de fond slide-4.png */}
      {/* <img
        src="/slide-4.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none"
        draggable={false}
      /> */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Ensemble, on change la donne
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Rejoignez des milliers de personnes qui agissent concrètement pour un monde meilleur
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <Icon className="w-10 h-10 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
                <div className="text-4xl md:text-5xl font-bold text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-light">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

