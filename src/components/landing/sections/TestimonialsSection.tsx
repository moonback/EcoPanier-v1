import { motion } from 'framer-motion';
import { testimonials } from '../../../data/landingData';
import { Quote, Star } from 'lucide-react';

export const TestimonialsSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Motif décoratif de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-5 py-2.5 rounded-full font-bold border border-yellow-200 mb-6 shadow-sm"
          >
            <Star className="w-4 h-4 fill-yellow-500" />
            Témoignages
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
            Ce{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 animate-gradient">
              qu'ils en disent
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            Des milliers d'utilisateurs nous font confiance chaque jour
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
              <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-primary-200 overflow-hidden">
                {/* Icône de citation en arrière-plan */}
                <motion.div
                  className="absolute top-4 right-4 text-primary-100 opacity-50 group-hover:opacity-100 transition-opacity"
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
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Texte du témoignage */}
                <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed mb-8 relative z-10 italic">
                  "{testimonial.text}"
                </p>

                {/* Profil utilisateur */}
                <div className="flex items-center gap-4 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-gray-100 shadow-lg ring-2 ring-primary-100"
                      loading="lazy"
                    />
                    {/* Badge vérifié */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                  <div>
                    <div className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 font-medium">{testimonial.role}</div>
                  </div>
                </div>

                {/* Ligne décorative en bas */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 origin-left"
                />

                {/* Effet de brillance au hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-accent-50/0 group-hover:to-accent-50/30 transition-all duration-500 rounded-3xl pointer-events-none"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA supplémentaire */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 px-8 py-6 rounded-3xl shadow-xl">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold"
                >
                  {i === 3 ? '+5K' : '👤'}
                </motion.div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                Rejoignez plus de 5 000 utilisateurs satisfaits
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Note moyenne : 4.9/5 ⭐
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

