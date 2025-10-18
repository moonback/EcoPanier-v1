import { SkeletonLotCard } from './SkeletonLotCard';

interface SkeletonGridProps {
  count?: number;
}

/**
 * Composant grille de skeleton loaders
 * Affiche une grille de cartes skeleton pendant le chargement
 */
export function SkeletonGrid({ count = 12 }: SkeletonGridProps) {
  return (
    <div className="grid gap-3
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLotCard key={index} />
      ))}
    </div>
  );
}

