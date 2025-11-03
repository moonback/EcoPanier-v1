import { motion } from 'framer-motion';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const testimonials = [
  {
    name: 'Marc Dubois',
    role: 'Chef & Propriétaire',
    restaurant: 'Restaurant Le Jardin • Lyon',
    text: "Chaque soir, on sauvait déjà nos invendus pour le personnel. Maintenant avec EcoPanier, on aide 15-20 familles par semaine. C'est devenu une fierté pour toute l'équipe.",
    avatar: '👨‍🍳',
  },
  {
    name: 'Sophie Leclerc',
    role: 'Traiteur événementiel',
    restaurant: 'Délices & Réceptions • Paris',
    text: "Après un mariage de 200 personnes, il reste toujours des quantités importantes. EcoPanier transforme ce qu'on jetait en 50-60 repas distribués. C'est un service parfait.",
    avatar: '👩‍🍳',
  },
  {
    name: 'Ahmed Ziani',
    role: 'Restaurateur',
    restaurant: 'Chez Ahmed • Marseille',
    text: 'La plateforme est super simple. Je prends une photo, ça remplit tout automatiquement. En 2 minutes c\'est fait et je sais que mes plats vont nourrir des gens qui en ont besoin.',
    avatar: '🧑‍🍳',
  },
];

export const RestaurantTestimonialsSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Ils ont rejoint EcoPanier"
          description="Des restaurateurs et traiteurs engagés qui font la différence"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface h-full space-y-4 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-600">{testimonial.role}</div>
                  <div className="text-xs font-medium text-primary-600">{testimonial.restaurant}</div>
                </div>
              </div>
              <p className="text-sm italic text-neutral-600 leading-relaxed">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </PageSection>
  );
};

