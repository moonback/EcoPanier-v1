import { motion, Variants } from 'framer-motion';

import { testimonials } from '../../../data/landingData';
import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const TestimonialsSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-12">
        <SectionHeader
          title="Ils et elles témoignent"
          description="Commerçants, clients et associations partagent leur expérience avec ÉcoPanier."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="surface h-full space-y-5 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <motion.img
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring' }}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageSection>
  );
};

