// Imports externes
import { Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface BeneficiaryDailyLimitProps {
  count: number;
  maxCount: number;
}

/**
 * Widget pour afficher la limite journalière du bénéficiaire
 * PRIORITÉ ABSOLUE : Information la plus visible du dashboard
 * Optimisé pour l'accessibilité (Mode Kiosque)
 */
export function BeneficiaryDailyLimit({ count, maxCount }: BeneficiaryDailyLimitProps) {
  // Calcul de la progression (0 à 100%)
  const progressPercentage = (count / maxCount) * 100;
  const remaining = maxCount - count;
  const hasReachedLimit = count >= maxCount;

  // Données pour le graphique Recharts
  const chartData = [
    {
      name: 'Progression',
      value: progressPercentage,
      fill: hasReachedLimit ? '#10b981' : '#ec4899', // success-500 ou accent-500
    },
  ];

  // Couleurs dynamiques
  const colors = {
    bg: hasReachedLimit ? 'bg-gradient-to-br from-success-50 to-success-100' : 'bg-gradient-to-br from-accent-50 to-pink-100',
    border: hasReachedLimit ? 'border-success-300' : 'border-accent-300',
    text: hasReachedLimit ? 'text-success-700' : 'text-accent-700',
    icon: hasReachedLimit ? 'text-success-600' : 'text-accent-600',
    badge: hasReachedLimit ? 'from-success-500 to-success-600' : 'from-accent-500 to-accent-600',
  };

  // Render principal
  return (
    <div className={`card ${colors.bg} rounded-2xl md:rounded-3xl border-4 ${colors.border} p-6 md:p-8 shadow-2xl`}>
      {/* En-tête avec icône et titre */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 md:p-4 bg-white rounded-xl md:rounded-2xl shadow-lg`}>
            {hasReachedLimit ? (
              <CheckCircle2 size={32} className={colors.icon} strokeWidth={2.5} />
            ) : (
              <Heart size={32} className={colors.icon} strokeWidth={2.5} />
            )}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-black">
              Aujourd'hui
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-light">
              {hasReachedLimit ? 'Limite atteinte !' : 'Vos paniers gratuits'}
            </p>
          </div>
        </div>

        {/* Badge de statut */}
        {hasReachedLimit && (
          <span className={`px-4 py-2 bg-gradient-to-r ${colors.badge} text-white rounded-full text-sm md:text-base font-bold shadow-lg animate-pulse`}>
            ✓ Complet
          </span>
        )}
      </div>

      {/* Contenu principal : Graphique + Compteur */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Graphique RadialBar (Recharts) */}
        <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={12}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background={{ fill: '#f3f4f6' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Chiffres au centre du graphique */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl md:text-5xl font-bold ${colors.text}`}>
              {count}
            </span>
            <span className="text-sm md:text-base text-gray-600 font-medium">
              / {maxCount}
            </span>
          </div>
        </div>

        {/* Texte principal et message */}
        <div className="flex-1 text-center md:text-left">
          {/* Message principal */}
          {hasReachedLimit ? (
            <div>
              <p className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-3">
                Vous avez vos {maxCount} paniers ! 🎉
              </p>
              <p className="text-base md:text-xl text-gray-700 font-light leading-relaxed">
                Vous avez atteint votre limite quotidienne.<br />
                <strong className={`${colors.text} font-semibold`}>Revenez demain</strong> pour de nouveaux paniers solidaires ! 🌅
              </p>
            </div>
          ) : (
            <div>
              <p className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-3">
                {remaining === maxCount ? (
                  <>Vous pouvez réserver {remaining} paniers gratuits !</>
                ) : (
                  <>Encore {remaining} panier{remaining > 1 ? 's' : ''} disponible{remaining > 1 ? 's' : ''} !</>
                )}
              </p>
              <p className="text-base md:text-xl text-gray-700 font-light leading-relaxed">
                {remaining === maxCount ? (
                  <>Profitez de vos <strong className={colors.text}>{maxCount} paniers solidaires gratuits</strong> dès aujourd'hui ! 🎁</>
                ) : (
                  <>Vous avez déjà réservé <strong className={colors.text}>{count} panier{count > 1 ? 's' : ''}</strong>. Ne ratez pas {remaining === 1 ? 'votre dernier panier' : `vos ${remaining} paniers restants`} ! 💚</>
                )}
              </p>
            </div>
          )}

          {/* Barre de progression visuelle (alternative au graphique sur mobile) */}
          <div className="mt-4 md:mt-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-3 md:h-4 bg-white rounded-full overflow-hidden border-2 border-gray-200 shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${colors.badge} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm md:text-base font-bold text-gray-700 whitespace-nowrap">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 font-light">
              {hasReachedLimit ? 'Limite quotidienne atteinte' : `${count} sur ${maxCount} paniers réservés`}
            </p>
          </div>
        </div>
      </div>

      {/* Message motivationnel en bas */}
      {!hasReachedLimit && (
        <div className="mt-6 p-4 md:p-5 bg-white rounded-xl md:rounded-2xl border-2 border-gray-200 shadow-md">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className={colors.icon} strokeWidth={2} />
            <p className="text-sm md:text-base font-semibold text-gray-800">
              💡 <strong className={colors.text}>Astuce :</strong> Les paniers sont mis à jour tout au long de la journée. N'hésitez pas à revenir régulièrement !
            </p>
          </div>
        </div>
      )}

      {/* Message de félicitations si limite atteinte */}
      {hasReachedLimit && (
        <div className="mt-6 p-4 md:p-5 bg-white rounded-xl md:rounded-2xl border-2 border-success-200 shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-success-600" strokeWidth={2} />
            <p className="text-sm md:text-base font-semibold text-gray-800">
              🎊 <strong className="text-success-700">Bravo !</strong> Vous avez profité de tous vos paniers solidaires d'aujourd'hui. À demain !
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

