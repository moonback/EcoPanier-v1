import { motion } from 'framer-motion';
import { DollarSign, Clock, MapPin, Heart } from 'lucide-react';

const reasons = [
  {
    icon: DollarSign,
    title: 'Revenus complémentaires',
    description: 'Gagnez 7€ par livraison effectuée. Avec 2-3 livraisons par jour, vous pouvez générer 300-450€ supplémentaires par mois.',
    stats: '300-450€/mois',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Clock,
    title: 'Horaires flexibles',
    description: 'Travaillez quand vous voulez : matin, midi, soir ou week-end. Adaptez vos livraisons à votre emploi du temps.',
    stats: '100% flexible',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: MapPin,
    title: 'Zones proches de chez vous',
    description: 'Livrez uniquement dans votre secteur géographique. Pas de longs trajets, optimisez votre temps et vos coûts.',
    stats: 'Rayon de 5km',
    color: 'from-warning-500 to-warning-600'
  },
  {
    icon: Heart,
    title: 'Impact social positif',
    description: 'Chaque livraison aide une personne en précarité. Vous participez concrètement à la lutte contre le gaspillage alimentaire.',
    stats: 'Impact mesurable',
    color: 'from-accent-500 to-accent-600'
  }
];

export const CollectorWhySection = () => {
  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-success-50 text-success-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">💰</span>
            <span>Revenus + Impact social</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Pourquoi devenir
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              collecteur ?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Une activité rémunérée qui a du sens : gagnez de l'argent tout en aidant les plus précaires
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
                  {/* Icône avec dégradé */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${reason.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-4">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed mb-6">
                    {reason.description}
                  </p>

                  {/* Stats */}
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-lg">📊</span>
                    {reason.stats}
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
