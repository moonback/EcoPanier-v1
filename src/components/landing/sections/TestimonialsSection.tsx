import { motion } from 'framer-motion';

import { testimonials } from '../../../data/landingData';
import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

export const TestimonialsSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-12">
        <SectionHeader
          title="Ils et elles racontent leur expérience"
          description="Commerçants, clients et associations partagent l’impact concret d’ÉcoPanier sur leur quotidien."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="surface h-full space-y-5 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{testimonial.name}</p>
                  <p className="text-xs text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-neutral-600">
                « {testimonial.text} »
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </PageSection>
  );
};

