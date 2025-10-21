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
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-5 py-2.5 rounded-full font-bold border border-purple-200 mb-6 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Fonctionnalités</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 animate-gradient">
              Tous les outils
            </span>
            <br />
            pour gérer efficacement
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Une plateforme complète pensée pour les besoins des associations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                whileHover={{ y: -8 }}
                className="group h-full"
              >
                <div className="relative h-full p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  />

                  {/* Icône avec dégradé et animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-xl relative z-10`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 group-hover:text-purple-600 transition-colors relative z-10 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed relative z-10">
                    {feature.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

