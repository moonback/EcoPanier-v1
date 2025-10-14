import { motion } from 'framer-motion';
import { UserPlus, Users, BarChart3, Download } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Créez votre compte association',
    description: 'Inscrivez-vous en tant qu\'association. Renseignez vos informations (RNA, SIRET) et créez votre espace de gestion.',
    icon: UserPlus,
    details: ['Inscription gratuite', 'Validation sous 48h', 'Interface dédiée']
  },
  {
    step: 2,
    title: 'Enregistrez vos bénéficiaires',
    description: 'Ajoutez vos bénéficiaires en quelques clics. Chacun reçoit un identifiant unique et un QR code pour récupérer ses lots.',
    icon: Users,
    details: ['Formulaire simple', 'QR code automatique', 'ID unique généré']
  },
  {
    step: 3,
    title: 'Suivez l\'activité en temps réel',
    description: 'Consultez le tableau de bord pour voir les retraits, l\'activité des bénéficiaires et les statistiques globales.',
    icon: BarChart3,
    details: ['Dashboard complet', 'Alertes automatiques', 'Historique détaillé']
  },
  {
    step: 4,
    title: 'Générez vos rapports',
    description: 'Exportez vos données au format CSV ou JSON pour vos rapports d\'activité et justifications auprès de vos financeurs.',
    icon: Download,
    details: ['Export en 1 clic', 'Plusieurs formats', 'Conforme RGPD']
  }
];

export const AssociationHowItWorksSection = () => {
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
            4 étapes simples pour gérer votre programme d'aide alimentaire
          </p>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            const gradients = [
              'from-primary-500 to-primary-600',
              'from-purple-500 to-purple-600',
              'from-success-500 to-success-600',
              'from-warning-500 to-warning-600'
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

