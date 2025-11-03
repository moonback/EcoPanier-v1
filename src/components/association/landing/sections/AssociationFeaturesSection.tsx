import { motion } from 'framer-motion';
import { Users, BarChart3, Download, Shield, Bell, Search, Clock, FileText } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const features = [
  {
    icon: Users,
    title: 'Gestion des bénéficiaires',
    description: 'Enregistrez et gérez vos bénéficiaires avec un formulaire simple et intuitif.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques détaillées',
    description: 'Dashboard complet avec graphiques, tendances et indicateurs clés en temps réel.',
  },
  {
    icon: Download,
    title: 'Export de données',
    description: 'Exportez vos données en CSV ou JSON pour vos rapports et analyses.',
  },
  {
    icon: Shield,
    title: 'Conformité RGPD',
    description: 'Données cryptées, hébergement sécurisé en France, conformité totale.',
  },
  {
    icon: Bell,
    title: 'Alertes automatiques',
    description: 'Recevez des notifications quand un bénéficiaire atteint sa limite quotidienne.',
  },
  {
    icon: Search,
    title: 'Recherche avancée',
    description: 'Trouvez rapidement un bénéficiaire par nom, prénom ou identifiant.',
  },
  {
    icon: Clock,
    title: 'Historique complet',
    description: "Consultez l'historique de tous les retraits pour chaque bénéficiaire.",
  },
  {
    icon: FileText,
    title: 'Rapports automatiques',
    description: "Générez des rapports d'activité mensuels en un clic.",
  },
];

export const AssociationFeaturesSection = () => {
  return (
    <PageSection background="default" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Tous les outils pour gérer efficacement"
          description="Une plateforme complète pensée pour les besoins des associations"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="surface h-full space-y-4 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

