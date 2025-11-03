import { motion } from 'framer-motion';
import { UserPlus, Users, BarChart3, Download } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const steps = [
  {
    step: 1,
    title: 'Créez votre compte association',
    description: "Inscrivez-vous en tant qu'association. Renseignez vos informations (RNA, SIRET) et créez votre espace de gestion.",
    icon: UserPlus,
    details: ['Inscription gratuite', 'Validation sous 48h', 'Interface dédiée'],
  },
  {
    step: 2,
    title: 'Enregistrez vos bénéficiaires',
    description: 'Ajoutez vos bénéficiaires en quelques clics. Chacun reçoit un identifiant unique et un QR code pour récupérer ses lots.',
    icon: Users,
    details: ['Formulaire simple', 'QR code automatique', 'ID unique généré'],
  },
  {
    step: 3,
    title: "Suivez l'activité en temps réel",
    description: "Consultez le tableau de bord pour voir les retraits, l'activité des bénéficiaires et les statistiques globales.",
    icon: BarChart3,
    details: ['Dashboard complet', 'Alertes automatiques', 'Historique détaillé'],
  },
  {
    step: 4,
    title: 'Générez vos rapports',
    description: 'Exportez vos données au format CSV ou JSON pour vos rapports d\'activité et justifications auprès de vos financeurs.',
    icon: Download,
    details: ['Export en 1 clic', 'Plusieurs formats', 'Conforme RGPD'],
  },
];

export const AssociationHowItWorksSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-12">
        <SectionHeader
          align="center"
          title="Comment ça marche ?"
          description="4 étapes simples pour gérer votre programme d'aide alimentaire"
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface flex flex-col items-center gap-4 p-6 text-center"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary-600 text-xl font-bold text-white shadow-md">
                  {step.step}
                </div>
                <Icon className="h-8 w-8 text-secondary-600" strokeWidth={1.5} />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-secondary-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

