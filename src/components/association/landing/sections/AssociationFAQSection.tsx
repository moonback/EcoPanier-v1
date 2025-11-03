import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const faqItems = [
  {
    question: 'Quels documents sont nécessaires pour inscrire mon association ?',
    answer: 'Vous aurez besoin de votre numéro RNA (Répertoire National des Associations) ou SIRET si vous avez une activité économique. La validation de votre compte se fait sous 48h maximum.',
  },
  {
    question: 'Comment enregistrer un nouveau bénéficiaire ?',
    answer: 'Depuis votre dashboard, cliquez sur "Nouveau bénéficiaire" et remplissez le formulaire en ligne. Un identifiant unique au format YYYY-BEN-XXXXX sera généré automatiquement avec un QR code pour le retrait.',
  },
  {
    question: 'Les bénéficiaires doivent-ils payer quelque chose ?',
    answer: "Non, l'accès aux lots solidaires est 100% gratuit pour les bénéficiaires. Les commerçants participent volontairement au programme d'aide alimentaire.",
  },
  {
    question: 'Combien de lots un bénéficiaire peut-il récupérer ?',
    answer: "Chaque bénéficiaire peut récupérer jusqu'à 2 lots par jour maximum. Cette limite est automatiquement appliquée par la plateforme pour garantir une distribution équitable.",
  },
  {
    question: "Comment générer un rapport d'activité ?",
    answer: 'Depuis la section "Export de données", vous pouvez générer des rapports en CSV ou JSON avec toutes les statistiques : nombre de bénéficiaires, lots distribués, activité par période, etc.',
  },
  {
    question: 'Les données des bénéficiaires sont-elles sécurisées ?',
    answer: "Oui, toutes les données sont cryptées et hébergées en France. Nous sommes 100% conformes au RGPD. Les bénéficiaires peuvent exercer leur droit d'accès, de rectification et de suppression à tout moment.",
  },
  {
    question: 'Puis-je modifier ou supprimer un bénéficiaire ?',
    answer: "Oui, vous pouvez modifier les informations d'un bénéficiaire ou le supprimer complètement de la plateforme à tout moment depuis votre interface de gestion.",
  },
  {
    question: "Y a-t-il un coût pour notre association ?",
    answer: "Non, l'utilisation de la plateforme est 100% gratuite pour les associations. Il n'y a aucun frais d'inscription, d'abonnement ou de commission.",
  },
];

export const AssociationFAQSection = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <PageSection background="muted" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Questions fréquentes"
          description="Tout ce que vous devez savoir pour démarrer"
        />

        <div className="mx-auto w-full max-w-4xl space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="surface overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left group hover:bg-neutral-50 transition-colors"
              >
                <h3 className="text-base font-semibold text-neutral-900 pr-8 group-hover:text-secondary-600 transition-colors">
                  {item.question}
                </h3>
                <Plus
                  className={`h-5 w-5 flex-shrink-0 text-secondary-600 transition-transform duration-300 ${
                    openFaqIndex === index ? 'rotate-45' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-6 text-sm text-neutral-600 leading-relaxed">{item.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-muted mx-auto w-full max-w-4xl p-8 text-center"
        >
          <h3 className="mb-3 text-xl font-semibold text-neutral-900">Besoin d'aide supplémentaire ?</h3>
          <p className="mb-6 text-sm text-neutral-600">Notre équipe est là pour vous accompagner dans votre inscription</p>
          <button onClick={() => navigate('/help')} className="btn-primary">
            Contactez-nous
          </button>
        </motion.div>
      </div>
    </PageSection>
  );
};

