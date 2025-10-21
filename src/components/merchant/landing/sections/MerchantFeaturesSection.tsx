import { motion } from 'framer-motion';
import { BarChart3, Camera, Smartphone, Clock, Bell, Shield, MapPin, Download, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Interface intuitive',
    description: 'Créez et gérez vos lots en quelques clics depuis votre smartphone ou ordinateur.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: Camera,
    title: 'IA d\'analyse d\'image',
    description: 'Prenez une photo de vos produits et l\'IA génère automatiquement la description et le prix.',
    color: 'from-secondary-500 to-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Statistiques en temps réel',
    description: 'Suivez vos ventes, revenus et impact environnemental avec des graphiques détaillés.',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Clock,
    title: 'Horaires flexibles',
    description: 'Définissez vos propres horaires de retrait selon votre disponibilité.',
    color: 'from-warning-500 to-warning-600'
  },
  {
    icon: Bell,
    title: 'Notifications instantanées',
    description: 'Recevez une notification pour chaque nouvelle réservation en temps réel.',
    color: 'from-accent-500 to-pink-600'
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description: 'Les clients paient en ligne. Vous recevez vos revenus automatiquement chaque semaine.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: MapPin,
    title: 'Géolocalisation',
    description: 'Votre commerce est visible sur la carte pour attirer les clients à proximité.',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Download,
    title: 'Export de données',
    description: 'Exportez vos statistiques et rapports pour votre comptabilité.',
    color: 'from-secondary-500 to-purple-600'
  }
];

export const MerchantFeaturesSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400 rounded-full"
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
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>Fonctionnalités</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-600 to-purple-600 animate-gradient">
              Tous les outils
            </span>
            <br />
            pour réussir
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Une plateforme complète pensée pour simplifier votre quotidien
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
                <div className="relative h-full p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  />

                  {/* Icône avec dégradé et animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-xl relative z-10`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 group-hover:text-secondary-600 transition-colors relative z-10 leading-tight">
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

