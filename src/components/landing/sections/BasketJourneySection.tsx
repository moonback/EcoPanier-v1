import { motion } from 'framer-motion';
import { Clock, ShoppingCart, Smartphone, Coffee } from 'lucide-react';

export const BasketJourneySection = () => {
  const journeySteps = [
    {
      time: '18h00',
      icon: Clock,
      title: 'Le boulanger ferme sa boutique',
      description: 'Il lui reste 8 croissants et 3 pains aux chocolats invendus. Plutôt que de les jeter, il crée un panier surprise sur ÉcoPanier.',
      image: '🥐',
      color: 'from-orange-500 to-amber-500'
    },
    {
      time: '18h15',
      icon: Smartphone,
      title: 'Léa reçoit une notification',
      description: 'Étudiante dans le quartier, elle cherchait justement son petit-déjeuner de demain. Un panier à 3€ au lieu de 10€, elle réserve immédiatement !',
      image: '📱',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      time: '18h30',
      icon: ShoppingCart,
      title: 'Retrait en 30 secondes',
      description: 'Léa présente son QR code à la boulangerie. Le boulanger scanne, valide, et elle repart avec son panier. Simple et rapide.',
      image: '✅',
      color: 'from-green-500 to-emerald-500'
    },
    {
      time: 'Lendemain',
      icon: Coffee,
      title: 'Un petit-déjeuner sauvé !',
      description: 'Léa déguste ses viennoiseries fraîches. Elle a économisé 7€, évité 720g de CO₂, et aidé son boulanger local. Tout le monde y gagne.',
      image: '☕',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            L'histoire d'un panier sauvé
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Découvrez comment un simple panier devient une victoire pour la planète, 
            votre portefeuille et votre quartier.
          </p>
        </motion.div>

        <div className="relative">
          {/* Ligne de connexion verticale (desktop uniquement) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200 -translate-x-1/2" />

          <div className="space-y-16 lg:space-y-24">
            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Contenu */}
                <div className="flex-1 lg:text-right lg:pr-12" style={{ textAlign: index % 2 === 0 ? 'right' : 'left' }}>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${step.color} text-white font-semibold mb-4`}>
                    <Clock className="w-4 h-4" />
                    <span>{step.time}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Icône centrale */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-5xl shadow-xl`}
                  >
                    {step.image}
                  </motion.div>
                </div>

                {/* Espace vide pour équilibrer (desktop) */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Impact final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-12 text-center"
        >
          <h3 className="text-3xl font-bold text-black mb-6">
            L'impact d'un seul panier
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">7€</div>
              <div className="text-gray-600">Économisés par Léa</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-600 mb-2">720g</div>
              <div className="text-gray-600">de CO₂ évité</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-600 mb-2">8 repas</div>
              <div className="text-gray-600">Sauvés du gaspillage</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

