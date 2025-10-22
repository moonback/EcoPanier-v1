import { motion } from 'framer-motion';
import { Brain, Trash2, BarChart3, Shield, Download } from 'lucide-react';

const advancedFeatures = [
  {
    icon: Brain,
    title: 'IA Gemini 2.0 Flash',
    description: 'Analyse automatique de vos photos d\'invendus pour extraire toutes les informations nécessaires.',
    details: [
      'Reconnaissance automatique des produits',
      'Extraction du titre et description',
      'Détection de la catégorie',
      'Estimation du prix avec niveau de confiance'
    ],
    color: 'from-secondary-500 to-purple-600'
  },
  {
    icon: Trash2,
    title: 'Nettoyage automatique',
    description: 'Suppression automatique des lots expirés et obsolètes pour maintenir votre espace propre.',
    details: [
      'Lots épuisés après 24h',
      'Lots avec date de retrait dépassée',
      'Archivage des statistiques',
      'Notification des suppressions'
    ],
    color: 'from-warning-500 to-warning-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics avancés',
    description: 'Tableaux de bord complets avec métriques détaillées et tendances sur 6 mois.',
    details: [
      'Évolution des ventes mensuelles',
      'Catégories les plus vendues',
      'Heures de retrait préférées',
      'Impact environnemental (CO₂ évité)'
    ],
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Shield,
    title: 'Sécurité RGPD',
    description: 'Conformité totale avec le RGPD et sécurité des données garantie.',
    details: [
      'Chiffrement des données sensibles',
      'Consentement explicite des utilisateurs',
      'Droit à l\'oubli respecté',
      'Audit de sécurité régulier'
    ],
    color: 'from-accent-500 to-pink-600'
  },
  {
    icon: Download,
    title: 'Export complet',
    description: 'Exportez toutes vos données en CSV ou JSON pour votre comptabilité et analyses.',
    details: [
      'Statistiques de vente détaillées',
      'Historique des réservations',
      'Données d\'impact environnemental',
      'Rapports personnalisables'
    ],
    color: 'from-secondary-500 to-purple-600'
  }
];

export const MerchantAdvancedFeaturesSection = () => {
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
            Fonctionnalités avancées
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Des outils professionnels pour optimiser votre gestion des invendus
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {advancedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
                  {/* Icône avec dégradé */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-4 group-hover:text-secondary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Détails */}
                  <ul className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-br ${feature.color} mt-2`} />
                        <span className="text-gray-700 font-light text-sm leading-relaxed">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
