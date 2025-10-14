import { motion } from 'framer-motion';
import { Check, Heart, Shield, Users, QrCode } from 'lucide-react';

export const SolidarityModelSection = () => {
  const solidarityFeatures = [
    {
      icon: Users,
      title: 'Maximum 2 lots gratuits par jour',
      description: 'Pour garantir un accès équitable à tous les bénéficiaires'
    },
    {
      icon: QrCode,
      title: 'Retrait identique aux autres clients',
      description: 'Même processus QR code + PIN, sans distinction visible'
    },
    {
      icon: Shield,
      title: 'Aucun marquage "spécial bénéficiaire"',
      description: 'Préservation totale de la dignité et de la confidentialité'
    },
    {
      icon: Heart,
      title: 'Suivi en toute transparence',
      description: 'Associations et commerçants suivent l\'impact en temps réel'
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-br from-accent-50 via-pink-50 to-accent-50 overflow-hidden">
      {/* Image de fond */}
      <img
        src="/slide-2.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none"
        draggable={false}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full font-medium mb-6">
            <Heart className="w-5 h-5" />
            <span>Solidarité intégrée</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Un modèle de solidarité unique
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Les lots gratuits : une aide digne et transparente pour les personnes en situation de précarité
          </p>
        </motion.div>

        {/* Section explicative */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl p-10 shadow-xl">
              <h3 className="text-3xl font-bold text-black mb-6">
                Comment ça marche ?
              </h3>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
                Les commerçants peuvent créer des lots <strong className="font-semibold text-black">100% gratuits</strong> réservés 
                aux bénéficiaires vérifiés par les associations partenaires.
              </p>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
                Le système garantit <strong className="font-semibold text-black">dignité</strong> et <strong className="font-semibold text-black">confidentialité</strong> : 
                aucune différence visible entre un client payant et un bénéficiaire lors du retrait.
              </p>

              <div className="inline-flex items-center gap-3 bg-success-100 text-success-700 px-6 py-3 rounded-xl font-medium">
                <Check className="w-5 h-5" />
                <span>Système déjà actif sur la plateforme</span>
              </div>
            </div>
          </motion.div>

          {/* Caractéristiques */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {solidarityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                      <Icon className="w-6 h-6 text-accent-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-black mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 font-light">
                        {feature.description}
                      </p>
                    </div>
                    <div className="text-2xl opacity-30">✓</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => window.location.href = '/help'}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Comprendre le programme solidaire
          </button>
        </motion.div>
      </div>
    </section>
  );
};

