import { motion } from 'framer-motion';
import { BarChart3, Camera, Smartphone, Clock, Bell, Shield, MapPin, Download } from 'lucide-react';

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
            Tous les outils pour réussir
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Une plateforme complète pensée pour simplifier votre quotidien
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
                  
                  <h3 className="text-xl font-semibold text-black mb-3 group-hover:text-secondary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed text-sm">
                    {feature.description}
                  </p>

                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-secondary-50/0 group-hover:to-secondary-50/20 rounded-2xl transition-all pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

