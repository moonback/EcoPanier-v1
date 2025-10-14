import { motion } from 'framer-motion';
import { MapPin, Award, TrendingUp } from 'lucide-react';

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
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-medium mb-6">
            <Award className="w-5 h-5" />
            <span>Commerçants du mois</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Nos Commerçants Héros
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Chaque mois, nous mettons en lumière les commerçants qui font une différence 
            dans leur quartier en luttant contre le gaspillage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {merchantHeroes.map((merchant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              {/* Badge "Héros du mois" */}
              <div className="absolute top-6 right-6 z-10">
                <div className="bg-gradient-to-r from-warning-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>Héros</span>
                </div>
              </div>

              {/* Image / Emoji du commerce */}
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-8xl"
                >
                  {merchant.image}
                </motion.div>
              </div>

              {/* Contenu */}
              <div className="p-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-black mb-1">{merchant.name}</h3>
                  <div className="text-primary-600 font-medium mb-2">{merchant.business}</div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{merchant.location}</span>
                  </div>
                </div>

                <blockquote className="text-gray-600 italic mb-6 leading-relaxed">
                  "{merchant.quote}"
                </blockquote>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {merchant.stats.mealsSaved}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Repas sauvés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {merchant.stats.co2Saved}kg
                    </div>
                    <div className="text-xs text-gray-500 mt-1">CO₂ évité</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-600">
                      {merchant.stats.monthsActive}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Mois actifs</div>
                  </div>
                </div>

                {/* Indicateur de progression */}
                <div className="mt-6 flex items-center gap-2 text-sm text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Impact en hausse ce mois-ci</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA pour devenir commerçant partenaire */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-black mb-4">
              Vous aussi, devenez un héros anti-gaspi !
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez notre réseau de commerçants engagés et valorisez vos invendus 
              tout en renforçant votre image locale.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all"
            >
              <span>Devenir commerçant partenaire</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

