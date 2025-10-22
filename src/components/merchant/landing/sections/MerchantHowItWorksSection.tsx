import { motion } from 'framer-motion';
import { UserPlus, Package, Smartphone, TrendingUp, Camera, QrCode } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Inscrivez-vous gratuitement',
    description: 'Créez votre compte commerçant en 5 minutes. Renseignez vos informations professionnelles (SIRET, nom du commerce, adresse) et configurez votre profil.',
    icon: UserPlus,
    details: ['Inscription 100% gratuite', 'Validation sous 24h', 'Pas de matériel requis', 'Configuration en quelques clics']
  },
  {
    step: 2,
    title: 'Créez vos lots avec l\'IA',
    description: 'Prenez une photo de vos invendus et l\'IA Gemini analyse automatiquement le produit pour générer titre, description, catégorie et prix estimé.',
    icon: Camera,
    details: ['Analyse IA en 30 secondes', 'Extraction automatique des données', 'Niveau de confiance affiché', 'Gain de temps considérable']
  },
  {
    step: 3,
    title: 'Les clients réservent en ligne',
    description: 'Recevez des notifications instantanées pour chaque réservation. Les clients paient en ligne et reçoivent un QR code avec PIN pour le retrait.',
    icon: Smartphone,
    details: ['Paiement sécurisé automatique', 'QR code + PIN à 6 chiffres', 'Notifications temps réel', 'Suivi des réservations']
  },
  {
    step: 4,
    title: 'Validez les retraits facilement',
    description: 'Scannez le QR code du client via la station de retrait intégrée, vérifiez le PIN et validez. Vos revenus sont versés automatiquement chaque semaine.',
    icon: QrCode,
    details: ['Station de retrait intégrée', 'Validation en 30 secondes', 'Virement automatique hebdomadaire', 'Statistiques détaillées']
  }
];

export const MerchantHowItWorksSection = () => {
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
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            4 étapes simples pour valoriser vos invendus
          </p>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            const gradients = [
              'from-primary-500 to-primary-600',
              'from-success-500 to-success-600',
              'from-warning-500 to-warning-600',
              'from-secondary-500 to-secondary-600'
            ];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
              >
                <div className="flex-1">
                  {/* Numéro de l'étape */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${gradients[index]} text-white text-2xl font-bold mb-6 shadow-lg`}
                  >
                    {step.step}
                  </motion.div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Détails */}
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${gradients[index]}`} />
                        <span className="font-light">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
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

