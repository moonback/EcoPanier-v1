import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, Heart } from 'lucide-react';

const reasons = [
  {
    icon: Users,
    title: 'Gestion simplifiée',
    description: 'Enregistrez et gérez vos bénéficiaires en quelques clics. Fini les fichiers Excel et les papiers perdus. Tout est centralisé et sécurisé.',
    stats: 'Gain de temps : 70%',
    color: 'from-primary-500 to-primary-600'
  },
  {
    icon: BarChart3,
    title: 'Suivi en temps réel',
    description: 'Suivez l\'activité de chaque bénéficiaire, les lots récupérés, et générez des rapports détaillés pour vos financeurs en un clic.',
    stats: '+500 données suivies',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: FileText,
    title: 'Rapports automatiques',
    description: 'Exportez vos données au format CSV ou JSON pour vos rapports d\'activité. Conformité RGPD garantie.',
    stats: 'Export en 1 clic',
    color: 'from-success-500 to-success-600'
  },
  {
    icon: Heart,
    title: 'Dignité préservée',
    description: 'Les bénéficiaires utilisent un QR code comme tous les clients. Pas de stigmatisation, juste de l\'aide alimentaire moderne et digne.',
    stats: '100% dignité',
    color: 'from-accent-500 to-accent-600'
  }
];

export const AssociationWhySection = () => {
  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">🏛️</span>
            <span>Plateforme pour associations</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Pourquoi rejoindre
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              ÉcoPanier ?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Une plateforme moderne pour une aide alimentaire plus efficace et digne
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all">
                  {/* Icône avec dégradé */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${reason.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-4">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed mb-6">
                    {reason.description}
                  </p>

                  {/* Stats */}
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-lg">📊</span>
                    {reason.stats}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

