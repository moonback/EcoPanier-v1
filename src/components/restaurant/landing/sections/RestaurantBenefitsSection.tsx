import { motion } from 'framer-motion';
import { Leaf, Heart, TrendingUp, Shield, Award, Zap } from 'lucide-react';

export const RestaurantBenefitsSection = () => {
  const benefits = [
    { icon: Leaf, title: 'Zéro gaspillage', description: '100% de vos invendus valorisés' },
    { icon: Heart, title: 'Impact solidaire', description: 'Aidez les plus précaires de votre quartier' },
    { icon: TrendingUp, title: 'Image renforcée', description: 'Montrez votre engagement RSE' },
    { icon: Shield, title: 'Conformité légale', description: 'Respectez la loi anti-gaspillage' },
    { icon: Award, title: 'Visibilité locale', description: 'Soyez mis en avant sur notre plateforme' },
    { icon: Zap, title: 'Simple et gratuit', description: 'Aucun coût, aucun engagement' }
  ];

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
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Vos avantages
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Au-delà de l'impact solidaire, rejoignez EcoPanier pour
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all">
                  <Icon className="w-10 h-10 text-orange-600 mb-4" strokeWidth={2} />
                  <h3 className="text-xl font-bold text-black mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 font-light">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

