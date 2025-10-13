import { motion } from 'framer-motion';
import { testimonials } from '../../../data/landingData';

export const TestimonialsSection = () => {
  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight max-w-3xl">
            Ce qu'ils en disent
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Des milliers d'utilisateurs nous font confiance
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
              className="bg-white rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-black">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 font-light">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-700 font-light leading-relaxed">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

