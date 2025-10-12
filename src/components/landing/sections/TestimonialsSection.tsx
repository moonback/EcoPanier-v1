import { AnimatedSection } from './AnimatedSection';
import { testimonials } from '../../../data/landingData';

export const TestimonialsSection = () => {
  return (
    <AnimatedSection className="py-20 section-gradient">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Ils témoignent
          </h2>
          <p className="text-xl text-neutral-600 font-medium">
            Des milliers d'utilisateurs nous font confiance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card p-8 hover-lift"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-600 font-medium">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-neutral-700 italic font-medium">"{testimonial.text}"</p>
              <div className="mt-4 flex text-warning-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

