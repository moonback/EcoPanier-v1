import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqItems = [
  {
    question: 'Quels documents sont nécessaires pour inscrire mon association ?',
    answer: 'Vous aurez besoin de votre numéro RNA (Répertoire National des Associations) ou SIRET si vous avez une activité économique. La validation de votre compte se fait sous 48h maximum.'
  },
  {
    question: 'Comment enregistrer un nouveau bénéficiaire ?',
    answer: 'Depuis votre dashboard, cliquez sur "Nouveau bénéficiaire" et remplissez le formulaire en ligne. Un identifiant unique au format YYYY-BEN-XXXXX sera généré automatiquement avec un QR code pour le retrait.'
  },
  {
    question: 'Les bénéficiaires doivent-ils payer quelque chose ?',
    answer: 'Non, l\'accès aux lots solidaires est 100% gratuit pour les bénéficiaires. Les commerçants participent volontairement au programme d\'aide alimentaire.'
  },
  {
    question: 'Combien de lots un bénéficiaire peut-il récupérer ?',
    answer: 'Chaque bénéficiaire peut récupérer jusqu\'à 2 lots par jour maximum. Cette limite est automatiquement appliquée par la plateforme pour garantir une distribution équitable.'
  },
  {
    question: 'Comment générer un rapport d\'activité ?',
    answer: 'Depuis la section "Export de données", vous pouvez générer des rapports en CSV ou JSON avec toutes les statistiques : nombre de bénéficiaires, lots distribués, activité par période, etc.'
  },
  {
    question: 'Les données des bénéficiaires sont-elles sécurisées ?',
    answer: 'Oui, toutes les données sont cryptées et hébergées en France. Nous sommes 100% conformes au RGPD. Les bénéficiaires peuvent exercer leur droit d\'accès, de rectification et de suppression à tout moment.'
  },
  {
    question: 'Puis-je modifier ou supprimer un bénéficiaire ?',
    answer: 'Oui, vous pouvez modifier les informations d\'un bénéficiaire ou le supprimer complètement de la plateforme à tout moment depuis votre interface de gestion.'
  },
  {
    question: 'Y a-t-il un coût pour notre association ?',
    answer: 'Non, l\'utilisation de la plateforme est 100% gratuite pour les associations. Il n\'y a aucun frais d\'inscription, d\'abonnement ou de commission.'
  }
];

export const AssociationFAQSection = () => {
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
                <h3 className="text-lg font-semibold text-black pr-8 group-hover:text-purple-600 transition-colors">
                  {item.question}
                </h3>
                <Plus 
                  className={`w-6 h-6 text-purple-600 flex-shrink-0 transition-transform duration-300 ${
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
            className="inline-flex items-center justify-center bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-purple-700 transition-all"
          >
            Contactez-nous
          </button>
        </motion.div>
      </div>
    </section>
  );
};

