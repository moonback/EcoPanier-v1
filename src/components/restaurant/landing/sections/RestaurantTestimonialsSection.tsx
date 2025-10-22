import { motion } from 'framer-motion';

export const RestaurantTestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Marc Dubois',
      role: 'Chef & Propriétaire',
      restaurant: 'Restaurant Le Jardin • Lyon',
      text: 'Chaque soir, on sauvait déjà nos invendus pour le personnel. Maintenant avec EcoPanier, on aide 15-20 familles par semaine. C\'est devenu une fierté pour toute l\'équipe.',
      avatar: '👨‍🍳'
    },
    {
      name: 'Sophie Leclerc',
      role: 'Traiteur événementiel',
      restaurant: 'Délices & Réceptions • Paris',
      text: 'Après un mariage de 200 personnes, il reste toujours des quantités importantes. EcoPanier transforme ce qu\'on jetait en 50-60 repas distribués. C\'est un service parfait.',
      avatar: '👩‍🍳'
    },
    {
      name: 'Ahmed Ziani',
      role: 'Restaurateur',
      restaurant: 'Chez Ahmed • Marseille',
      text: 'La plateforme est super simple. Je prends une photo, ça remplit tout automatiquement. En 2 minutes c\'est fait et je sais que mes plats vont nourrir des gens qui en ont besoin.',
      avatar: '🧑‍🍳'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">💬</span>
            <span>Témoignages restaurateurs</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Ils ont rejoint EcoPanier
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Des restaurateurs et traiteurs engagés qui font la différence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all h-full border border-orange-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-black">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-xs text-orange-600 font-medium">{testimonial.restaurant}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed font-light">
                  "{testimonial.text}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

