import { motion } from 'framer-motion';
import { Smartphone, MapPin, Clock, Shield, DollarSign, Heart } from 'lucide-react';

export const CollectorFeaturesSection = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'App mobile intuitive',
      description: 'Interface simple et rapide pour gérer vos livraisons en quelques clics',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: MapPin,
      title: 'Géolocalisation précise',
      description: 'Navigation optimisée et suivi GPS pour des livraisons efficaces',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: Clock,
      title: 'Horaires flexibles',
      description: 'Travaillez quand vous voulez : matin, midi, soir ou week-end',
      color: 'from-warning-500 to-warning-600',
    },
    {
      icon: Shield,
      title: 'Assurance incluse',
      description: 'Protection complète pendant vos livraisons, sans frais supplémentaires',
      color: 'from-accent-500 to-accent-600',
    },
    {
      icon: DollarSign,
      title: 'Paiements rapides',
      description: 'Virements hebdomadaires automatiques, suivi des gains en temps réel',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: Heart,
      title: 'Impact social',
      description: 'Chaque livraison aide une personne en précarité dans votre quartier',
      color: 'from-accent-500 to-accent-600',
    },
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
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">🛠️</span>
            <span>Fonctionnalités avancées</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Une plateforme pensée
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              pour vous
            </span>
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Des outils modernes pour optimiser vos livraisons et maximiser vos gains
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 text-center bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <Icon size={32} className="text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-light">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
