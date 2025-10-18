import { motion } from 'framer-motion';

export const SuspendedBasketsSection = () => {
  const features = [
    {
      title: 'Pour Vous',
      description: 'Économisez jusqu\'à 70% sur des produits de qualité de tous types de commerces près de chez vous',
      stats: 'Jusqu\'à -70% d\'économies'
    },
    {
      title: 'Pour la Planète',
      description: 'Chaque panier sauvé évite 0.9kg de CO₂ et combat le gaspillage alimentaire',
      stats: '0.9kg de CO₂ évité / panier'
    },
    {
      title: 'Pour les Autres',
      description: 'Accès gratuit à 2 paniers alimentaires par jour pour les personnes en situation de précarité',
      stats: '2 paniers solidaires / jour'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-50">
      <div className="absolute inset-0">
        <img 
          src="/slide-1.png" 
          alt="Mission sociale" 
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight max-w-4xl">
            Un geste simple.
            <br />
            <span className="text-primary-600">Un triple impact.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl font-light">
            En récupérant un panier, vous agissez pour votre porte-monnaie, pour la planète et pour votre quartier
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-2xl p-10"
            >
              <h3 className="text-3xl font-bold text-black mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-700 mb-6 font-light leading-relaxed">
                {feature.description}
              </p>
              <div className="text-2xl font-bold text-black">
                {feature.stats}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-black rounded-3xl p-12 md:p-16 text-white text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Votre impact, multiplié par trois
          </h3>
          <p className="text-lg text-white/70 font-light max-w-2xl mx-auto">
            Chaque panier que vous récupérez crée un effet domino positif : vous économisez, la planète respire, et votre quartier se solidarise
          </p>
        </motion.div>
      </div>
    </section>
  );
};

