import { motion } from 'framer-motion';
import { DollarSign, Heart, Leaf, TrendingUp } from 'lucide-react';

const reasons = [
  {
    icon: DollarSign,
    title: 'Récupérez vos pertes',
    description: 'Valorisez jusqu\'à 30% du prix initial de vos invendus au lieu de les jeter. Chaque produit sauvé devient un revenu complémentaire pour votre commerce.',
    stats: 'Jusqu\'à 500€/mois récupérés',
    color: 'from-warning-500 to-warning-600'
  },
  {
    icon: TrendingUp,
    title: 'Attirez de nouveaux clients',
    description: 'Touchez une clientèle engagée et fidèle qui découvrira votre commerce via ÉcoPanier. 70% de nos utilisateurs deviennent clients réguliers.',
    stats: '+30% de nouveaux clients',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: Leaf,
    title: 'Impact environnemental',
    description: 'Participez activement à la lutte contre le gaspillage alimentaire. Chaque produit sauvé évite 0.9kg de CO₂ dans l\'atmosphère.',
    stats: '15 tonnes de CO₂ évitées',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Heart,
    title: 'Solidarité locale',
    description: 'Participez au programme d\'aide alimentaire solidaire et soutenez les personnes en précarité de votre quartier. Renforcez votre ancrage local.',
    stats: '5000+ personnes aidées',
    color: 'from-accent-500 to-accent-600'
  }
];

export const MerchantWhySection = () => {
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
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Pourquoi rejoindre ÉcoPanier ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Un triple impact pour votre commerce : économique, écologique et social
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

