import type { ReactNode } from 'react';

import { cn } from '../../../utils/cn';

type HeaderAlign = 'start' | 'center';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: HeaderAlign;
  actions?: ReactNode;
}

const alignmentStyles: Record<HeaderAlign, string> = {
  start: 'items-start text-left',
  center: 'items-center text-center',
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'start',
  actions,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-5', alignmentStyles[align])}>
      <div className={cn('flex w-full flex-col gap-3', alignmentStyles[align])}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className={cn('flex flex-wrap gap-3', align === 'center' ? 'justify-center' : '')}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

