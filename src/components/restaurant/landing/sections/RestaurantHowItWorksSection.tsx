import { motion } from 'framer-motion';
import { Camera, Clock, Truck, BarChart } from 'lucide-react';

export const RestaurantHowItWorksSection = () => {
  const steps = [
    { icon: Camera, title: 'Photographiez vos invendus', description: 'L\'IA remplit automatiquement les informations' },
    { icon: Clock, title: 'Définissez l\'heure de récupération', description: 'Choisissez quand les collecteurs passent' },
    { icon: Truck, title: 'On récupère et distribue', description: 'Nos collecteurs s\'occupent de la logistique' },
    { icon: BarChart, title: 'Suivez votre impact', description: 'Dashboard avec statistiques en temps réel' }
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
            Simple et rapide
          </h2>
          <p className="text-xl text-gray-600 font-light">
            4 étapes pour transformer vos invendus en impact solidaire
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-2xl font-bold mb-6 shadow-lg">
                  {index + 1}
                </div>
                <Icon className="w-12 h-12 mx-auto mb-4 text-orange-600" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-600 font-light">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

