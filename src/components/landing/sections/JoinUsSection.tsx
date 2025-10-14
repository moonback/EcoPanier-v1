import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, Building2 } from 'lucide-react';

const profiles = [
  {
    emoji: '🏪',
    title: 'Commerçants',
    description: 'Transformez vos invendus en revenus',
    benefits: ['Valorisez jusqu\'à 30%', 'Gratuit et sans engagement', '2 min pour créer un lot'],
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-50',
    path: '/commercants',
    icon: Store
  },
  {
    emoji: '🏛️',
    title: 'Associations',
    description: 'Simplifiez votre aide alimentaire',
    benefits: ['Gestion moderne', 'Export de données', '100% gratuit'],
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    path: '/associations',
    icon: Building2
  }
];

export const JoinUsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Vous êtes commerçant ou association ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Rejoignez notre mouvement et participez à la lutte contre le gaspillage alimentaire
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {profiles.map((profile, index) => {
            const Icon = profile.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`h-full ${profile.bgColor} rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all`}>
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black group-hover:text-gray-700 transition-colors">
                        {profile.title}
                      </h3>
                      <p className="text-gray-600 font-light">
                        {profile.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-8">
                    {profile.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${profile.color}`} />
                        <span className="text-gray-700 font-light">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(profile.path)}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${profile.color} text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all group-hover:gap-3`}
                  >
                    <span>En savoir plus</span>
                    <ArrowRight className="w-5 h-5 transition-transform" />
                  </button>

                  {/* Emoji background decoratif */}
                  <div className="absolute top-8 right-8 text-6xl opacity-10 pointer-events-none">
                    {profile.emoji}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Bénéficiaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-white rounded-2xl p-8 border border-gray-200 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🤝</span>
              <h3 className="text-2xl font-bold text-black">Bénéficiaires</h3>
            </div>
            <p className="text-gray-600 font-light mb-6">
              Vous êtes en situation de précarité ? Contactez une association partenaire près de chez vous pour accéder gratuitement à nos paniers solidaires.
            </p>
            <button
              onClick={() => navigate('/help')}
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              <span>Trouver une association</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

