import type { ReactNode } from 'react';

import { cn } from '../../../utils/cn';

type SectionPadding = 'sm' | 'md' | 'lg';
type SectionBackground = 'default' | 'muted' | 'subtle' | 'surface' | 'contrast';

interface PageSectionProps {
  id?: string;
  className?: string;
  padding?: SectionPadding;
  background?: SectionBackground;
  children: ReactNode;
}

const paddingStyles: Record<SectionPadding, string> = {
  sm: 'py-12 md:py-14',
  md: 'py-16 md:py-20',
  lg: 'py-20 md:py-24',
};

const backgroundStyles: Record<SectionBackground, string> = {
  default: 'bg-white',
  muted: 'bg-neutral-50',
  subtle: 'bg-gradient-to-b from-neutral-50 via-white to-neutral-50',
  surface: 'bg-white shadow-[inset_0_-1px_0_rgba(15,23,42,0.04)]',
  contrast: 'bg-neutral-900 text-white',
};

export function PageSection({
  id,
  className,
  padding = 'md',
  background = 'default',
  children,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative',
        paddingStyles[padding],
        backgroundStyles[background],
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

