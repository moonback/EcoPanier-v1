import { motion } from 'framer-motion';
import { Users, BarChart3, Download, Shield, Bell, Search, Clock, FileText } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestion des bénéficiaires',
    description: 'Enregistrez et gérez vos bénéficiaires avec un formulaire simple et intuitif.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: BarChart3,
    title: 'Statistiques détaillées',
    description: 'Dashboard complet avec graphiques, tendances et indicateurs clés en temps réel.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Download,
    title: 'Export de données',
    description: 'Exportez vos données en CSV ou JSON pour vos rapports et analyses.',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Shield,
    title: 'Conformité RGPD',
    description: 'Données cryptées, hébergement sécurisé en France, conformité totale.',
    color: 'from-accent-500 to-pink-600'
  },
  {
    icon: Bell,
    title: 'Alertes automatiques',
    description: 'Recevez des notifications quand un bénéficiaire atteint sa limite quotidienne.',
    color: 'from-warning-500 to-warning-600'
  },
  {
    icon: Search,
    title: 'Recherche avancée',
    description: 'Trouvez rapidement un bénéficiaire par nom, prénom ou identifiant.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: Clock,
    title: 'Historique complet',
    description: 'Consultez l\'historique de tous les retraits pour chaque bénéficiaire.',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: FileText,
    title: 'Rapports automatiques',
    description: 'Générez des rapports d\'activité mensuels en un clic.',
    color: 'from-purple-500 to-purple-600'
  }
];

export const AssociationFeaturesSection = () => {
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
            Tous les outils pour gérer efficacement
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Une plateforme complète pensée pour les besoins des associations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <div className="relative h-full p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
                  {/* Icône avec dégradé */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-black mb-3 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed text-sm">
                    {feature.description}
                  </p>

                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-purple-50/0 group-hover:to-purple-50/20 rounded-2xl transition-all pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

