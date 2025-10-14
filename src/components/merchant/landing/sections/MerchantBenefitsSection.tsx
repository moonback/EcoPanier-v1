import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const benefits = [
  {
    title: 'Gestion simplifiée',
    items: [
      'Créez un lot en moins de 2 minutes',
      'Interface intuitive et rapide',
      'Gestion des stocks en temps réel',
      'QR code pour validation instantanée'
    ]
  },
  {
    title: 'Zéro frais cachés',
    items: [
      'Inscription 100% gratuite',
      'Aucun engagement, aucun abonnement',
      'Commission transparente uniquement sur les ventes',
      'Pas de matériel à acheter'
    ]
  },
  {
    title: 'Visibilité maximale',
    items: [
      'Profil visible sur la carte interactive',
      'Notifications push aux clients à proximité',
      'Communication sur votre engagement',
      'Statistiques détaillées en temps réel'
    ]
  },
  {
    title: 'Support dédié',
    items: [
      'Accompagnement à l\'inscription',
      'Équipe disponible 7j/7',
      'Guides et tutoriels vidéo',
      'Conseils pour optimiser vos ventes'
    ]
  }
];

export const MerchantBenefitsSection = () => {
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
            Des avantages concrets pour votre commerce
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Tout ce dont vous avez besoin pour réussir sur ÉcoPanier
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-gray-50 rounded-2xl p-8 hover:bg-secondary-50 transition-all">
                <h3 className="text-xl font-bold text-black mb-6 group-hover:text-secondary-600 transition-colors">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-success-600" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700 font-light text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

