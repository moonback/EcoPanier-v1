import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Euro } from 'lucide-react';

export const RestaurantProblemSection = () => {
  const problems = [
    {
      icon: TrendingDown,
      stat: '30%',
      label: 'De gaspillage alimentaire',
      description: 'En restauration, 30% de la nourriture préparée finit à la poubelle'
    },
    {
      icon: Euro,
      stat: '10k€',
      label: 'Perdus par an',
      description: 'Un restaurant perd en moyenne 10 000€ par an en invendus'
    },
    {
      icon: AlertTriangle,
      stat: '1.6M',
      label: 'Tonnes gaspillées',
      description: 'La restauration française jette 1.6 million de tonnes par an'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Le gaspillage coûte cher,
            <br />
            <span className="text-red-600">à vous et à la planète</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Chaque jour, des tonnes de nourriture parfaitement consommable finissent à la poubelle
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-red-100 mb-6">
                  <Icon className="w-10 h-10 text-red-600" strokeWidth={2} />
                </div>
                <div className="text-5xl font-bold text-red-600 mb-2">
                  {problem.stat}
                </div>
                <div className="text-xl font-semibold text-black mb-3">
                  {problem.label}
                </div>
                <p className="text-gray-600 font-light">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Message fort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-red-50 rounded-3xl p-12 text-center border-2 border-red-200"
        >
          <p className="text-2xl font-light text-gray-800 leading-relaxed">
            <strong className="font-bold text-red-600">La bonne nouvelle ?</strong> Ce gaspillage peut devenir un{' '}
            <strong className="font-bold text-success-600">impact positif</strong> pour votre quartier
          </p>
        </motion.div>
      </div>
    </section>
  );
};

