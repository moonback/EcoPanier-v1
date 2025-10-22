import { motion } from 'framer-motion';
import { BarChart3, Camera, Smartphone, Clock, Bell, Shield, MapPin, Download, Brain, QrCode } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'IA Gemini intégrée',
    description: 'Analyse automatique de vos photos pour extraire titre, description, catégorie et prix estimé avec un niveau de confiance.',
    color: 'from-secondary-500 to-purple-600'
  },
  {
    icon: Camera,
    title: 'Création en 5 étapes',
    description: 'Formulaire progressif guidé : IA → Infos → Prix → Horaires → Options. Interface intuitive et rapide.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: QrCode,
    title: 'Station de retrait',
    description: 'Scanner QR code intégré avec validation PIN. Interface dédiée pour valider les retraits en 30 secondes.',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: BarChart3,
    title: 'Statistiques avancées',
    description: 'Dashboard complet : lots créés, CA généré, articles vendus, impact environnemental et tendances.',
    color: 'from-warning-500 to-warning-600'
  },
  {
    icon: Bell,
    title: 'Notifications temps réel',
    description: 'Alertes instantanées pour chaque réservation, changement de statut et activité sur vos lots.',
    color: 'from-accent-500 to-pink-600'
  },
  {
    icon: Shield,
    title: 'Paiements sécurisés',
    description: 'Clients paient en ligne, vous recevez vos revenus automatiquement chaque semaine. Commission transparente.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: MapPin,
    title: 'Géolocalisation',
    description: 'Votre commerce visible sur la carte interactive pour attirer les clients à proximité.',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Download,
    title: 'Export de données',
    description: 'Exportez vos statistiques et rapports en CSV/JSON pour votre comptabilité et analyses.',
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

