import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqItems = [
  {
    question: 'Quels documents sont nécessaires pour l\'inscription ?',
    answer: 'Vous aurez besoin de votre SIRET, vos coordonnées bancaires (IBAN), et une pièce d\'identité. La validation de votre compte se fait sous 24h maximum.'
  },
  {
    question: 'Comment fixe-t-on les prix des lots ?',
    answer: 'Vous êtes libre de fixer vos prix ! En général, les commerçants proposent des réductions de 30 à 70% par rapport au prix initial. L\'IA peut vous suggérer un prix optimal basé sur le contenu du lot.'
  },
  {
    question: 'Quand et comment suis-je payé ?',
    answer: 'Les paiements sont effectués automatiquement chaque semaine par virement bancaire. Vous recevez 85% du montant de chaque vente (commission de 15% pour ÉcoPanier).'
  },
  {
    question: 'Puis-je annuler un lot après l\'avoir créé ?',
    answer: 'Oui, vous pouvez modifier ou annuler un lot tant qu\'il n\'a pas été réservé. Si un client a déjà réservé, vous devez le contacter via la plateforme pour annuler.'
  },
  {
    question: 'Que se passe-t-il si un client ne vient pas récupérer son lot ?',
    answer: 'Si le client ne se présente pas dans le créneau horaire prévu, vous pouvez marquer le lot comme "non récupéré". Le client ne sera pas remboursé et vous recevrez quand même le paiement.'
  },
  {
    question: 'Comment fonctionne le programme solidaire ?',
    answer: 'En tant que commerçant partenaire, vous pouvez proposer des lots aux bénéficiaires du programme d\'aide alimentaire. Ces lots sont financés par la plateforme et vous êtes rémunéré normalement. C\'est un engagement volontaire qui renforce votre image locale.'
  },
  {
    question: 'Y a-t-il un nombre minimum de lots à créer ?',
    answer: 'Non, aucune obligation ! Vous créez des lots quand vous le souhaitez, selon vos invendus. Certains commerçants créent 2-3 lots par jour, d\'autres seulement en fin de semaine.'
  },
  {
    question: 'Puis-je gérer plusieurs points de vente ?',
    answer: 'Oui ! Si vous avez plusieurs boutiques, vous pouvez les ajouter à votre compte et gérer les lots de chaque point de vente séparément.'
  }
];

export const MerchantFAQSection = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Tout ce que vous devez savoir pour démarrer
          </p>
        </motion.div>

        <div className="space-y-4 mb-16">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full py-6 px-8 flex items-center justify-between text-left group hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-black pr-8 group-hover:text-secondary-600 transition-colors">
                  {item.question}
                </h3>
                <Plus 
                  className={`w-6 h-6 text-secondary-600 flex-shrink-0 transition-transform duration-300 ${
                    openFaqIndex === index ? 'rotate-45' : ''
                  }`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-8 pb-6 text-gray-700 font-light leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-10 text-center border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-black mb-4">
            Besoin d'aide supplémentaire ?
          </h3>
          <p className="text-gray-700 font-light mb-6 text-lg">
            Notre équipe est là pour vous accompagner dans votre inscription
          </p>
          <button
            onClick={() => navigate('/help')}
            className="inline-flex items-center justify-center bg-secondary-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-secondary-700 transition-all"
          >
            Contactez-nous
          </button>
        </motion.div>
      </div>
    </section>
  );
};

