import { motion } from 'framer-motion';
import { whyReasons } from '../../../data/landingData';

export const WhySection = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight max-w-3xl">
            Notre mission est simple :
            <br />
            <span className="text-primary-600">créer un cercle vertueux</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl font-light">
            Où chaque repas sauvé est une victoire pour la planète, un soutien pour nos commerçants et un coup de pouce pour nos voisins.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {whyReasons.map((reason, index) => {
            const Icon = reason.icon;
            const colorClasses = {
              success: { bg: 'from-success-500 to-success-600', text: 'text-success-600', border: 'border-success-200' },
              accent: { bg: 'from-accent-500 to-accent-600', text: 'text-accent-600', border: 'border-accent-200' },
              warning: { bg: 'from-warning-500 to-warning-600', text: 'text-warning-600', border: 'border-warning-200' },
              primary: { bg: 'from-primary-500 to-primary-600', text: 'text-primary-600', border: 'border-primary-200' }
            };
            const colors = colorClasses[reason.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className={`relative p-10 h-full bg-white rounded-2xl border ${colors.border} hover:shadow-2xl transition-all`}>
                  {/* Icône avec badge */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colors.bg} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className={`text-3xl font-bold mb-3 ${colors.text}`}>
                    {reason.title}
                  </h3>
                  
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colors.bg} text-white font-semibold text-sm mb-4`}>
                    {reason.stats}
                  </div>
                  
                  <p className="text-gray-600 font-light leading-relaxed text-lg">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats en chiffres */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-black rounded-3xl p-12 md:p-16 text-white overflow-hidden"
        >
          {/* Image de fond illustrant l'urgence */}
          <img
            src="/slide-3.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none select-none rounded-3xl"
            draggable={false}
          />
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Le gaspillage en France</h3>
              <p className="text-white/60 text-lg font-light">L'urgence d'agir maintenant</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-6xl font-bold mb-3">10M</div>
                <div className="text-white/70 font-light">Tonnes gaspillées par an</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-3">29kg</div>
                <div className="text-white/70 font-light">Par personne et par an</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-3">16Mds€</div>
                <div className="text-white/70 font-light">Valeur du gaspillage annuel</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

