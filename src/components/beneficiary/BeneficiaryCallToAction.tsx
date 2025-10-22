// Imports externes
import { Search, ArrowRight } from 'lucide-react';

interface BeneficiaryCallToActionProps {
  count: number;
  maxCount: number;
  hasActiveReservation: boolean;
  onNavigateToBrowse: () => void;
}

/**
 * Widget d'action principale pour le bénéficiaire
 * CTA ultra-visible pour trouver un lot gratuit
 * Ne s'affiche que si < maxCount et pas de réservation active
 */
export function BeneficiaryCallToAction({
  count,
  maxCount,
  hasActiveReservation,
  onNavigateToBrowse,
}: BeneficiaryCallToActionProps) {
  // Early returns (conditions de sortie)
  
  // Si réservation active, le widget ne s'affiche pas (priorité au QR Code)
  if (hasActiveReservation) {
    return null;
  }

  // Si limite atteinte, le widget ne s'affiche pas (rien à faire)
  if (count >= maxCount) {
    return null;
  }

  // Calcul des paniers restants
  const remaining = maxCount - count;

  // Render principal
  return (
    <div className="card bg-gradient-to-br from-success-50 via-primary-50 to-success-100 rounded-2xl md:rounded-3xl border-4 border-success-300 p-8 md:p-12 shadow-2xl">
      {/* Texte principal */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-bold text-black mb-4 leading-tight">
          {remaining === maxCount ? (
            <>Trouvez vos paniers gratuits ! 🎁</>
          ) : (
            <>Encore {remaining} panier{remaining > 1 ? 's' : ''} à récupérer ! 💚</>
          )}
        </h2>
        <p className="text-lg md:text-2xl text-gray-700 font-light leading-relaxed">
          {remaining === maxCount ? (
            <>
              Découvrez les <strong className="text-success-700">{maxCount} paniers solidaires</strong> qui vous attendent aujourd'hui.
            </>
          ) : (
            <>
              Ne ratez pas {remaining === 1 ? 'votre dernier panier' : `vos ${remaining} paniers restants`} de la journée !
            </>
          )}
        </p>
      </div>

      {/* Bouton CTA principal - TRÈS GRAND */}
      <button
        onClick={onNavigateToBrowse}
        className="w-full py-6 md:py-8 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-2xl md:rounded-3xl hover:from-success-700 hover:to-success-800 transition-all font-bold shadow-2xl hover:shadow-3xl text-xl md:text-3xl flex items-center justify-center gap-4 group animate-pulse-soft"
      >
        <Search size={40} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
        <span>Trouver un lot gratuit</span>
        <ArrowRight size={40} strokeWidth={2.5} className="group-hover:translate-x-2 transition-transform" />
      </button>

      {/* Message d'encouragement */}
      <div className="mt-8 p-6 bg-white rounded-xl md:rounded-2xl border-2 border-success-200 shadow-md">
        <p className="text-base md:text-xl text-center font-semibold text-gray-800">
          💡 <strong className="text-success-700">C'est gratuit</strong> et c'est pour vous ! Profitez-en dès maintenant.
        </p>
      </div>

      {/* Compteur visuel */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: maxCount }).map((_, index) => (
          <div
            key={index}
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center text-2xl md:text-3xl font-bold transition-all ${
              index < count
                ? 'bg-success-100 border-success-500 text-success-700'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {index < count ? '✓' : '🎁'}
          </div>
        ))}
      </div>
      <p className="text-sm md:text-base text-center text-gray-600 mt-4 font-medium">
        {count} panier{count > 1 ? 's' : ''} réservé{count > 1 ? 's' : ''} • {remaining} restant{remaining > 1 ? 's' : ''}
      </p>
    </div>
  );
}

