import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Coordinatrice',
    association: 'Entraide Paris 18',
    text: "Le programme solidaire d'ÉcoPanier a changé la donne pour nos bénéficiaires. Ils accèdent à des produits frais de qualité, pas à des restes. Le système de QR code préserve leur dignité. C'est de l'aide alimentaire réinventée. La plateforme de gestion nous a fait gagner un temps précieux.",
    avatar: '/testimonial/testimonials-3.png',
    stats: { beneficiaries: '120', lotsDistributed: '2400+' },
  },
  {
    name: 'Jean Dupont',
    role: 'Directeur',
    association: 'Solidarité Lyon',
    text: "Nous avons pu digitaliser complètement notre processus d'inscription et de suivi. Les rapports automatiques nous permettent de justifier facilement nos activités auprès de nos financeurs. L'équipe ÉcoPanier a été très réactive pour nous accompagner.",
    avatar: '/testimonial/testimonials-2.png',
    stats: { beneficiaries: '85', lotsDistributed: '1700+' },
  },
  {
    name: 'Marie Lefevre',
    role: 'Responsable Aide Alimentaire',
    association: 'Secours Populaire Nantes',
    text: "Interface simple et intuitive. Même nos bénévoles seniors l'utilisent sans problème. Les bénéficiaires apprécient la discrétion du système. Plus besoin de tickets papier, tout est digital et sécurisé. Un vrai progrès pour l'aide alimentaire moderne.",
    avatar: '/testimonial/testimonials-1.png',
    stats: { beneficiaries: '150', lotsDistributed: '3000+' },
  },
];

export const AssociationTestimonialsSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Elles nous font confiance"
          description="Découvrez les témoignages d'associations qui ont rejoint la plateforme"
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
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600">
                <Quote className="h-5 w-5" />
              </span>

              <p className="text-sm italic text-neutral-600 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex gap-4 border-t border-neutral-200 pt-4">
                <div className="flex-1">
                  <div className="text-xl font-bold text-secondary-600">{testimonial.stats.beneficiaries}</div>
                  <div className="text-xs text-neutral-500">Bénéficiaires</div>
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-success-600">{testimonial.stats.lotsDistributed}</div>
                  <div className="text-xs text-neutral-500">Lots distribués</div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full border-2 border-neutral-200 object-cover"
                />
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-xs text-neutral-600">{testimonial.role}</div>
                  <div className="text-xs text-secondary-600">{testimonial.association}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageSection>
  );
};

