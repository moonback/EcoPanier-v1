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
            Simple, rapide, efficace
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl font-light">
            Commencez à sauver de la nourriture en quelques clics
          </p>
        </motion.div>

        <div className="space-y-24">
          {howItWorks.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;
            
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black text-white text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Icon className="w-32 h-32 text-gray-400" strokeWidth={1} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

