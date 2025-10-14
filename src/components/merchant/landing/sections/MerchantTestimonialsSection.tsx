import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Pierre Dubois',
    role: 'Boulanger-Pâtissier',
    location: 'Lyon 3ème',
    text: 'Avant, je jetais 10-15kg de pain et viennoiseries par jour. Ça me brisait le cœur. Aujourd\'hui, tout est valorisé via ÉcoPanier. Mes clients adorent l\'initiative et je touche un nouveau public. Je récupère environ 400€ par mois. C\'est gagnant-gagnant !',
    avatar: '/testimonial/testimonials-2.png',
    stats: { revenue: '400€/mois', waste: '-95%' }
  },
  {
    name: 'Marie Legrand',
    role: 'Primeur Bio',
    location: 'Paris 11ème',
    text: 'L\'inscription est ultra-simple et la plateforme est intuitive. En 2 minutes, je crée mes lots de fruits et légumes. Les clients viennent chercher leurs paniers et découvrent ma boutique. 60% reviennent pour acheter d\'autres produits. C\'est parfait pour ma visibilité !',
    avatar: '/testimonial/testimonials-1.png',
    stats: { revenue: '350€/mois', newClients: '+40' }
  },
  {
    name: 'Thomas Mercier',
    role: 'Restaurateur',
    location: 'Nantes',
    text: 'J\'avais beaucoup de plats préparés invendus en fin de service. ÉcoPanier m\'a permis de les valoriser tout en participant à une démarche solidaire. L\'équipe est super réactive et m\'a accompagné dès le début. Je recommande à tous mes collègues restaurateurs !',
    avatar: '/testimonial/testimonials-2.png',
    stats: { revenue: '500€/mois', waste: '-80%' }
  }
];

export const MerchantTestimonialsSection = () => {
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
            Ils nous font confiance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Découvrez les témoignages de commerçants qui ont rejoint le mouvement
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
              <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 hover:border-secondary-200 hover:shadow-xl transition-all">
                {/* Quote icon */}
                <div className="inline-flex p-3 rounded-xl bg-secondary-100 mb-6">
                  <Quote className="w-6 h-6 text-secondary-600" />
                </div>

                {/* Testimonial text */}
                <p className="text-gray-700 font-light leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Stats */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-secondary-600 mb-1">
                      {testimonial.stats.revenue}
                    </div>
                    <div className="text-xs text-gray-500">Revenus récupérés</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-success-600 mb-1">
                      {testimonial.stats.waste || testimonial.stats.newClients}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.stats.waste ? 'Gaspillage' : 'Nouveaux clients'}
                    </div>
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
                    <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</div>
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

