import { motion } from 'framer-motion';

export const CollectorTestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Étudiante',
      location: 'Lyon',
      text: 'Je fais 2-3 livraisons par jour entre mes cours. Ça me permet de payer mes études tout en aidant des personnes dans le besoin. C\'est parfait !',
      avatar: '👩‍🎓',
      earnings: '350€/mois'
    },
    {
      name: 'Ahmed Benali',
      role: 'Chauffeur Uber',
      location: 'Paris',
      text: 'J\'ai ajouté les livraisons EcoPanier à mes trajets Uber. C\'est un complément de revenus idéal et ça me donne l\'impression d\'être utile.',
      avatar: '🚗',
      earnings: '450€/mois'
    },
    {
      name: 'Sophie Martin',
      role: 'Mère au foyer',
      location: 'Marseille',
      text: 'Pendant que mes enfants sont à l\'école, je fais quelques livraisons. C\'est flexible et ça me permet de contribuer aux revenus du foyer.',
      avatar: '👩‍👧‍👦',
      earnings: '280€/mois'
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
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-success-50 text-success-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">💬</span>
            <span>Témoignages collecteurs</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight max-w-3xl">
            Ils ont rejoint notre réseau
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Des collecteurs satisfaits qui gagnent en livrant avec EcoPanier
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all h-full border border-success-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-black">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-xs text-success-600 font-medium">{testimonial.location}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed font-light mb-6">
                  "{testimonial.text}"
                </p>
                <div className="bg-success-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-success-600">{testimonial.earnings}</div>
                  <div className="text-sm text-success-700">Gains mensuels</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
