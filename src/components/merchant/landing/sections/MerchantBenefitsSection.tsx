import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const benefits = [
  {
    title: 'Création ultra-rapide',
    items: [
      'IA Gemini : analyse automatique en 30s',
      'Formulaire en 5 étapes guidées',
      'Interface mobile et desktop optimisée',
      'Validation en temps réel'
    ]
  },
  {
    title: 'Gestion simplifiée',
    items: [
      'Station de retrait intégrée',
      'QR code + PIN pour validation',
      'Notifications temps réel',
      'Suivi des réservations en direct'
    ]
  },
  {
    title: 'Modèle économique transparent',
    items: [
      'Inscription 100% gratuite',
      'Commission unique de 15%',
      'Virement automatique hebdomadaire',
      'Aucun frais caché ni abonnement'
    ]
  },
  {
    title: 'Impact et visibilité',
    items: [
      'Profil visible sur la carte interactive',
      'Statistiques d\'impact environnemental',
      'Participation à la solidarité alimentaire',
      'Communication sur votre engagement'
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

