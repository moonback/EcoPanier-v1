import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Euro, UtensilsCrossed } from 'lucide-react';

export const ImpactCalculatorSection = () => {
  const [basketsPerMonth, setBasketsPerMonth] = useState(4);
  
  // Calculs
  const basketsPerYear = basketsPerMonth * 12;
  const averageSavingsPerBasket = 7; // €
  const co2PerBasket = 0.9; // kg
  const mealsPerBasket = 2;
  
  const yearlyMoneyWithSaved = basketsPerYear * averageSavingsPerBasket;
  const yearlyCO2Saved = basketsPerYear * co2PerBasket;
  const yearlyMealsSaved = basketsPerYear * mealsPerBasket;

  return (
    <section className="py-32 bg-black text-white relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-success-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Et si vous calculiez votre impact ?
          </h2>
          <p className="text-xl text-white/70 font-light max-w-3xl mx-auto">
            Découvrez combien vous pourriez économiser et quel impact vous auriez sur la planète 
            en sauvant des paniers chaque mois.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Slider interactif */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/10"
          >
            <div className="mb-8">
              <label className="block text-lg font-medium mb-4">
                Combien de paniers par mois souhaitez-vous sauver ?
              </label>
              <div className="flex items-center gap-6">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={basketsPerMonth}
                  onChange={(e) => setBasketsPerMonth(Number(e.target.value))}
                  className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(basketsPerMonth / 30) * 100}%, rgba(255,255,255,0.2) ${(basketsPerMonth / 30) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <motion.div
                  key={basketsPerMonth}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-primary-400 min-w-[80px] text-right"
                >
                  {basketsPerMonth}
                </motion.div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-white/50">
                <span>1 panier</span>
                <span>30 paniers</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl p-6 border border-primary-500/30">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-primary-400" />
                <h3 className="text-xl font-bold">Votre rythme</h3>
              </div>
              <p className="text-white/70 leading-relaxed">
                {basketsPerMonth === 1 && "Un bon début ! Chaque geste compte pour la planète."}
                {basketsPerMonth >= 2 && basketsPerMonth <= 4 && "Super ! Vous adoptez les bons réflexes anti-gaspi."}
                {basketsPerMonth >= 5 && basketsPerMonth <= 10 && "Excellent ! Vous êtes un vrai héros anti-gaspillage."}
                {basketsPerMonth >= 11 && basketsPerMonth <= 20 && "Incroyable ! Votre impact est considérable."}
                {basketsPerMonth > 20 && "Exceptionnel ! Vous êtes un champion de l'anti-gaspi !"}
              </p>
            </div>
          </motion.div>

          {/* Résultats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold mb-8">Votre impact en 1 an :</h3>

            {/* Économies */}
            <motion.div
              key={`money-${yearlyMoneyWithSaved}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-warning-500/20 to-warning-600/20 rounded-2xl p-6 border border-warning-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-warning-500/20 rounded-xl">
                  <Euro className="w-8 h-8 text-warning-400" />
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-bold text-warning-400 mb-2">
                    {yearlyMoneyWithSaved}€
                  </div>
                  <div className="text-white/70">
                    d'économies sur vos courses
                  </div>
                  <div className="text-sm text-white/50 mt-1">
                    Soit environ {Math.round(yearlyMoneyWithSaved / 12)}€ par mois
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CO2 */}
            <motion.div
              key={`co2-${yearlyCO2Saved}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-success-500/20 to-success-600/20 rounded-2xl p-6 border border-success-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-success-500/20 rounded-xl">
                  <Leaf className="w-8 h-8 text-success-400" />
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-bold text-success-400 mb-2">
                    {yearlyCO2Saved.toFixed(1)} kg
                  </div>
                  <div className="text-white/70">
                    de CO₂ évité
                  </div>
                  <div className="text-sm text-white/50 mt-1">
                    L'équivalent de {Math.round(yearlyCO2Saved / 2)} km en voiture
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Repas sauvés */}
            <motion.div
              key={`meals-${yearlyMealsSaved}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl p-6 border border-primary-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <UtensilsCrossed className="w-8 h-8 text-primary-400" />
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-bold text-primary-400 mb-2">
                    {yearlyMealsSaved}
                  </div>
                  <div className="text-white/70">
                    repas sauvés du gaspillage
                  </div>
                  <div className="text-sm text-white/50 mt-1">
                    Et autant de sourires partagés dans votre quartier
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-white/60 text-sm leading-relaxed">
                💡 <strong>Le saviez-vous ?</strong> En sauvant {basketsPerMonth} panier{basketsPerMonth > 1 ? 's' : ''} par mois, 
                vous contribuez activement à la lutte contre le gaspillage alimentaire et aidez les personnes 
                en difficulté de votre quartier grâce au programme solidaire.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

