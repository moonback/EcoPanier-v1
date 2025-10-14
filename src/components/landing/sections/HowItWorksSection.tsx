import { motion } from 'framer-motion';
import { howItWorks } from '../../../data/landingData';

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight max-w-3xl">
            4 étapes pour faire la différence
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl font-light">
            De la découverte à l'impact : votre parcours anti-gaspi en toute simplicité
          </p>
        </motion.div>

        <div className="space-y-24">
          {howItWorks.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;
            const gradients = [
              'from-primary-500 to-primary-600',
              'from-success-500 to-success-600',
              'from-warning-500 to-warning-600',
              'from-accent-500 to-accent-600'
            ];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
              >
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${gradients[index]} text-white text-2xl font-bold mb-6 shadow-lg`}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600 font-light leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Badge indicatif */}
                  <div className="mt-6 inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    {index === 0 && "🔍 Découverte"}
                    {index === 1 && "🛒 Réservation"}
                    {index === 2 && "📦 Récupération"}
                    {index === 3 && "❤️ Impact"}
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-2xl`}
                  >
                    <Icon className="w-32 h-32 text-white" strokeWidth={1.5} />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

