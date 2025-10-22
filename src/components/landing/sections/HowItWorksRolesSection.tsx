import { motion } from 'framer-motion';
import { actorRoles } from '../../../data/landingData';

export const HowItWorksRolesSection = () => {
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
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">🤝</span>
            <span>5 acteurs, 1 mission</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Ensemble, chaque geste
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              compte
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            5 acteurs, 1 mission commune : combattre le gaspillage alimentaire et renforcer la solidarité locale
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {actorRoles.map((actor, index) => {
            const Icon = actor.icon;
            const colorClasses = {
              primary: { bg: 'from-primary-500 to-primary-600', border: 'border-primary-200', text: 'text-primary-600' },
              secondary: { bg: 'from-secondary-500 to-secondary-600', border: 'border-secondary-200', text: 'text-secondary-600' },
              accent: { bg: 'from-accent-500 to-accent-600', border: 'border-accent-200', text: 'text-accent-600' },
              success: { bg: 'from-success-500 to-success-600', border: 'border-success-200', text: 'text-success-600' },
              purple: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-200', text: 'text-purple-600' }
            };
            const colors = colorClasses[actor.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className={`h-full bg-white rounded-2xl border-2 ${colors.border} p-6 hover:shadow-xl transition-all`}>
                  {/* Emoji en arrière-plan */}
                  <div className="text-6xl opacity-10 absolute top-4 right-4 pointer-events-none">
                    {actor.emoji}
                  </div>

                  {/* Icône */}
                  <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${colors.bg} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  {/* Contenu */}
                  <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                    {actor.title}
                  </h3>
                  <div className="text-sm font-medium text-gray-500 mb-3">
                    {actor.role}
                  </div>
                  <p className="text-gray-600 text-sm font-light leading-relaxed">
                    {actor.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => window.location.href = '/how-it-works'}
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-primary-500/50"
            type="button"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">Découvrir les rôles en détail</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

