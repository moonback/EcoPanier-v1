import { motion } from 'framer-motion';

import { actorRoles } from '../../../data/landingData';
import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const roleAccent: Record<string, { badge: string; icon: string }> = {
  primary: { badge: 'text-primary-600 bg-primary-50', icon: 'text-primary-600 bg-primary-100' },
  secondary: { badge: 'text-secondary-600 bg-secondary-50', icon: 'text-secondary-600 bg-secondary-100' },
  accent: { badge: 'text-accent-600 bg-accent-50', icon: 'text-accent-600 bg-accent-100' },
  success: { badge: 'text-success-600 bg-success-50', icon: 'text-success-600 bg-success-100' },
  purple: { badge: 'text-secondary-600 bg-secondary-50', icon: 'text-secondary-600 bg-secondary-100' },
};

export const HowItWorksRolesSection = () => {
  return (
    <PageSection>
      <div className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Les 4 acteurs d'ÉcoPanier"
          title="Une plateforme, quatre rôles complémentaires"
          description="Chaque rôle dispose d'une interface dédiée mais tous partagent la même mission : éviter le gaspillage alimentaire et soutenir les personnes qui en ont besoin."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {actorRoles.map((actor) => {
            const Icon = actor.icon;
            const accents = roleAccent[actor.color] ?? roleAccent.primary;

            return (
              <div key={actor.title} className="surface h-full p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${accents.icon}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${accents.badge}`}
                  >
                    {actor.role}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-900">{actor.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{actor.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </PageSection>
  );
};

