import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Coordinatrice',
    association: 'Entraide Paris 18',
    text: 'Le programme solidaire d\'ÉcoPanier a changé la donne pour nos bénéficiaires. Ils accèdent à des produits frais de qualité, pas à des restes. Le système de QR code préserve leur dignité. C\'est de l\'aide alimentaire réinventée. La plateforme de gestion nous a fait gagner un temps précieux.',
    avatar: '/testimonial/testimonials-3.png',
    stats: { beneficiaries: '120', lotsDistributed: '2400+' }
  },
  {
    name: 'Jean Dupont',
    role: 'Directeur',
    association: 'Solidarité Lyon',
    text: 'Nous avons pu digitaliser complètement notre processus d\'inscription et de suivi. Les rapports automatiques nous permettent de justifier facilement nos activités auprès de nos financeurs. L\'équipe ÉcoPanier a été très réactive pour nous accompagner.',
    avatar: '/testimonial/testimonials-2.png',
    stats: { beneficiaries: '85', lotsDistributed: '1700+' }
  },
  {
    name: 'Marie Lefevre',
    role: 'Responsable Aide Alimentaire',
    association: 'Secours Populaire Nantes',
    text: 'Interface simple et intuitive. Même nos bénévoles seniors l\'utilisent sans problème. Les bénéficiaires apprécient la discrétion du système. Plus besoin de tickets papier, tout est digital et sécurisé. Un vrai progrès pour l\'aide alimentaire moderne.',
    avatar: '/testimonial/testimonials-1.png',
    stats: { beneficiaries: '150', lotsDistributed: '3000+' }
  }
];

export const AssociationTestimonialsSection = () => {
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
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Elles nous font confiance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Découvrez les témoignages d'associations qui ont rejoint la plateforme
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all">
                {/* Quote icon */}
                <div className="inline-flex p-3 rounded-xl bg-purple-100 mb-6">
                  <Quote className="w-6 h-6 text-purple-600" />
                </div>

                {/* Testimonial text */}
                <p className="text-gray-700 font-light leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Stats */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {testimonial.stats.beneficiaries}
                    </div>
                    <div className="text-xs text-gray-500">Bénéficiaires</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-success-600 mb-1">
                      {testimonial.stats.lotsDistributed}
                    </div>
                    <div className="text-xs text-gray-500">Lots distribués</div>
                  </div>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div>
                    <div className="font-semibold text-black">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-gray-400">{testimonial.association}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

