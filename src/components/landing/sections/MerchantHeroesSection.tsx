import { motion } from 'framer-motion';
import { MapPin, Award, TrendingUp, Star, ArrowRight } from 'lucide-react';

interface MerchantHero {
  name: string;
  business: string;
  location: string;
  image: string;
  quote: string;
  stats: {
    mealsSaved: number;
    co2Saved: number;
    monthsActive: number;
  };
}

const merchantHeroes: MerchantHero[] = [
  {
    name: 'Pierre Dubois',
    business: 'Boulangerie Artisanale',
    location: 'Lyon 2ème',
    image: '🥖',
    quote: 'Chaque jour, je sauve mes viennoiseries et mes pains du gaspillage. Mes clients adorent, et moi aussi !',
    stats: {
      mealsSaved: 1240,
      co2Saved: 1116,
      monthsActive: 8
    }
  },
  {
    name: 'Sophie Chen',
    business: 'Primeur Bio',
    location: 'Nantes Centre',
    image: '🥬',
    quote: 'Les fruits et légumes "moches" trouvent enfin leurs amateurs. Zéro déchet, 100% satisfaction !',
    stats: {
      mealsSaved: 890,
      co2Saved: 801,
      monthsActive: 6
    }
  },
  {
    name: 'Ahmed Rahmani',
    business: 'Traiteur Oriental',
    location: 'Paris 18ème',
    image: '🥘',
    quote: 'Grâce à ÉcoPanier, je partage ma cuisine avec tout le quartier et je réduis mes invendus de 80%.',
    stats: {
      mealsSaved: 2100,
      co2Saved: 1890,
      monthsActive: 12
    }
  }
];

export const MerchantHeroesSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Motif décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 px-5 py-2.5 rounded-full font-bold border border-orange-200 mb-6 shadow-sm"
          >
            <Award className="w-5 h-5" />
            <span>Commerçants du mois</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Découvrez nos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient">
              commerçants
            </span>
            <br />
            engagés
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-4xl mx-auto leading-relaxed">
            Rencontrez les artisans et commerçants passionnés de votre quartier qui luttent 
            contre le gaspillage. Soutenez-les en récupérant leurs paniers surprises !
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {merchantHeroes.map((merchant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] as const
              }}
              whileHover={{ y: -10 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200"
            >
              {/* Badge "Héros du mois" animé */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                className="absolute top-6 right-6 z-10"
              >
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Award className="w-4 h-4" />
                  <span>Héros</span>
                  <Star className="w-4 h-4 fill-white" />
                </div>
              </motion.div>

              {/* Image / Emoji du commerce avec animation */}
              <div className="relative h-56 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {/* Pattern de fond */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.4 }}
                  className="text-9xl drop-shadow-2xl relative z-10"
                >
                  {merchant.image}
                </motion.div>

                {/* Effet de brillance */}
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)',
                  }}
                  animate={{
                    x: [-200, 400],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </div>

              {/* Contenu */}
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight">
                    {merchant.name}
                  </h3>
                  <div className="text-lg text-orange-600 font-bold mb-3">
                    {merchant.business}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    <span>{merchant.location}</span>
                  </div>
                </div>

                <blockquote className="relative text-base text-gray-600 italic mb-8 leading-relaxed pl-4 border-l-4 border-orange-200">
                  "{merchant.quote}"
                </blockquote>

                {/* Statistiques avec hover effects */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-gray-100">
                  {[
                    { value: merchant.stats.mealsSaved, label: 'Repas sauvés', gradient: 'from-green-500 to-emerald-500' },
                    { value: `${merchant.stats.co2Saved}kg`, label: 'CO₂ évité', gradient: 'from-blue-500 to-cyan-500' },
                    { value: merchant.stats.monthsActive, label: 'Mois actifs', gradient: 'from-purple-500 to-pink-500' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center"
                    >
                      <div className={`text-2xl sm:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 font-medium leading-tight">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Indicateur de progression */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="mt-6 flex items-center gap-2 text-sm bg-green-50 text-green-700 px-4 py-3 rounded-xl font-bold"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Impact en hausse ce mois-ci</span>
                </motion.div>
              </div>

              {/* Ligne décorative en bas */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 + 0.4 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 origin-left"
              />
            </motion.div>
          ))}
        </div>

        {/* CTA pour devenir commerçant partenaire - Ultra-moderne */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 md:mt-24"
        >
          <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl">
            {/* Orbs décoratifs */}
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block text-7xl mb-6"
              >
                🏪
              </motion.div>

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Vous êtes commerçant ?
                <br />
                Rejoignez le mouvement !
              </h3>
              
              <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                Transformez vos invendus en revenus et en impact positif. 
                Rejoignez +200 commerçants engagés dans la lutte contre le gaspillage.
              </p>

              {/* Stats rapides */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                {[
                  { icon: '💰', text: 'Gratuit' },
                  { icon: '⚡', text: 'Rapide' },
                  { icon: '🌱', text: 'Impact' }
                ].map((badge, i) => (
                  <motion.div
                    key={badge.text}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl text-white px-5 py-3 rounded-2xl font-bold border border-white/30"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span>{badge.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={() => window.location.href = '/commercants'}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-black hover:bg-gray-50 transition-all shadow-2xl"
                type="button"
              >
                <span>Découvrir l'offre commerçants</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

