import { motion } from 'framer-motion';
import { Quote, Star, MapPin } from 'lucide-react';

export const RestaurantTestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Marc Dubois',
      role: 'Chef & Propriétaire',
      restaurant: 'Restaurant Le Jardin',
      location: 'Lyon',
      text: 'Chaque soir, on sauvait déjà nos invendus pour le personnel. Maintenant avec EcoPanier, on aide 15-20 familles par semaine. C\'est devenu une fierté pour toute l\'équipe.',
      avatar: '👨‍🍳',
      impact: '15-20 familles/semaine'
    },
    {
      name: 'Sophie Leclerc',
      role: 'Traiteur événementiel',
      restaurant: 'Délices & Réceptions',
      location: 'Paris',
      text: 'Après un mariage de 200 personnes, il reste toujours des quantités importantes. EcoPanier transforme ce qu\'on jetait en 50-60 repas distribués. C\'est un service parfait.',
      avatar: '👩‍🍳',
      impact: '50-60 repas/événement'
    },
    {
      name: 'Ahmed Ziani',
      role: 'Restaurateur',
      restaurant: 'Chez Ahmed',
      location: 'Marseille',
      text: 'La plateforme est super simple. Je prends une photo, ça remplit tout automatiquement. En 2 minutes c\'est fait et je sais que mes plats vont nourrir des gens qui en ont besoin.',
      avatar: '🧑‍🍳',
      impact: '10-15 repas/jour'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Motif décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 px-5 py-2.5 rounded-full font-bold border border-orange-200 mb-6 shadow-sm"
          >
            <Star className="w-4 h-4 fill-orange-600" />
            <span>Témoignages</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Ils ont{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient">
              rejoint EcoPanier
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Des restaurateurs et traiteurs engagés qui font la différence chaque jour
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] as const
              }}
              whileHover={{ y: -8 }}
              className="group h-full"
            >
              <div className="h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 overflow-hidden relative">
                {/* Icône de citation en arrière-plan */}
                <motion.div
                  className="absolute top-4 right-4 text-orange-100 opacity-50 group-hover:opacity-100 transition-opacity"
                  whileHover={{ rotate: 180, scale: 1.2 }}
                  transition={{ duration: 0.4 }}
                >
                  <Quote className="w-16 h-16" />
                </motion.div>

                {/* Étoiles */}
                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
                    >
                      <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Texte du témoignage */}
                <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed mb-8 relative z-10 italic">
                  "{testimonial.text}"
                </p>

                {/* Profil utilisateur */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl shadow-lg ring-2 ring-orange-100">
                        {testimonial.avatar}
                      </div>
                      {/* Badge vérifié */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                    <div>
                      <div className="font-black text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 font-medium">{testimonial.role}</div>
                      <div className="text-sm text-orange-600 font-bold">{testimonial.restaurant}</div>
                    </div>
                  </div>
                </div>

                {/* Localisation et impact */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{testimonial.location}</span>
                  </div>
                  <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    {testimonial.impact}
                  </div>
                </div>

                {/* Ligne décorative */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 origin-left"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

