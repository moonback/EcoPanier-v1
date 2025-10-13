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
            Un impact qui compte
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl font-light">
            Chaque achat crée un cercle vertueux pour la planète et les personnes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {whyReasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-10">
                  <Icon className="w-12 h-12 mb-6 text-black" strokeWidth={1.5} />
                  <h3 className="text-3xl font-bold text-black mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-lg text-gray-900 font-medium mb-4">
                    {reason.stats}
                  </p>
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
          className="bg-black rounded-3xl p-12 md:p-16 text-white"
        >
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
        </motion.div>
      </div>
    </section>
  );
};

