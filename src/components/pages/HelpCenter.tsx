import { useState } from 'react';

import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
import { PageSection } from '../shared/layout/PageSection';
import { SectionHeader } from '../shared/layout/SectionHeader';
import { cn } from '../../utils/cn';
import {
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Store,
  Users,
  CreditCard,
  Package,
  QrCode,
  Clock,
  AlertCircle,
  Heart,
  Settings,
  Shield,
} from 'lucide-react';

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Tout', icon: HelpCircle },
    { id: 'customer', name: 'Clients', icon: ShoppingCart },
    { id: 'merchant', name: 'Commerçants', icon: Store },
    { id: 'beneficiary', name: 'Bénéficiaires', icon: Users },
    { id: 'association', name: 'Associations', icon: Heart },
    { id: 'payment', name: 'Paiements', icon: CreditCard },
    { id: 'technical', name: 'Technique', icon: Settings },
  ];

  const faqs = [
    {
      category: 'customer',
      question: 'Comment réserver un lot ?',
      answer: 'Pour réserver un lot, parcourez les offres disponibles, cliquez sur le lot qui vous intéresse, sélectionnez la quantité souhaitée et procédez au paiement. Vous recevrez immédiatement un QR code pour le retrait.',
      icon: ShoppingCart,
    },
    {
      category: 'customer',
      question: 'Puis-je annuler ma réservation ?',
      answer: 'Oui, vous pouvez annuler votre réservation tant qu\'elle n\'a pas été récupérée. Rendez-vous dans "Mes réservations" et cliquez sur le bouton d\'annulation. Le remboursement sera effectué sous 3-5 jours ouvrés.',
      icon: AlertCircle,
    },
    {
      category: 'customer',
      question: 'Quelle est la réduction maximale disponible ?',
      answer: 'Les lots peuvent être proposés jusqu\'à -70% de réduction par rapport au prix initial. Les commerçants fixent librement leurs prix réduits pour valoriser leurs invendus tout en offrant des économies attractives.',
      icon: Heart,
    },
    {
      category: 'customer',
      question: 'Comment fonctionne le retrait ?',
      answer: 'Rendez-vous au point de retrait indiqué pendant la plage horaire. Présentez votre QR code au commerçant, communiquez votre code PIN à 6 chiffres, et récupérez votre colis. Simple et rapide !',
      icon: QrCode,
    },
    {
      category: 'customer',
      question: 'Que se passe-t-il si j\'arrive en retard ?',
      answer: 'Il est important de respecter les horaires de retrait. Si vous arrivez en retard, le commerçant peut avoir disposé du lot. Contactez-le directement si vous avez un empêchement.',
      icon: Clock,
    },
    {
      category: 'merchant',
      question: 'Comment créer un lot ?',
      answer: 'Dans votre espace commerçant, cliquez sur "Créer un lot", renseignez les informations (titre, description, prix, quantité), ajoutez des photos, définissez l\'horaire de retrait et publiez. Votre lot sera visible immédiatement.',
      icon: Package,
    },
    {
      category: 'merchant',
      question: 'Quels sont les frais de la plateforme ?',
      answer: 'La plateforme prélève une commission de 15% sur chaque vente pour couvrir les frais de fonctionnement et financer les actions solidaires. Le paiement vous est versé sous 48h après le retrait.',
      icon: CreditCard,
    },
    {
      category: 'merchant',
      question: 'Comment gérer les retraits ?',
      answer: 'Utilisez la "Station de retrait" accessible depuis votre dashboard. Scannez le QR code du client, vérifiez son code PIN, remettez le colis et validez. Le système met à jour automatiquement le statut.',
      icon: Store,
    },
    {
      category: 'merchant',
      question: 'Puis-je modifier un lot après publication ?',
      answer: 'Oui, vous pouvez modifier les informations d\'un lot tant qu\'il n\'y a pas de réservation. Si des réservations existent, seules certaines informations (description, photos) peuvent être modifiées.',
      icon: Settings,
    },
    {
      category: 'merchant',
      question: 'Comment participer au programme d\'aide alimentaire solidaire ?',
      answer: 'Lors de la création d\'un lot, sélectionnez l\'option "Programme d\'aide alimentaire". Ces lots seront exclusivement accessibles aux personnes en situation de précarité via le programme solidaire.',
      icon: Heart,
    },
    {
      category: 'beneficiary',
      question: 'Comment devenir bénéficiaire ?',
      answer: 'Rapprochez-vous d\'une association partenaire qui évaluera votre situation et vous délivrera un identifiant bénéficiaire unique. Cet identifiant vous permettra d\'accéder au programme d\'aide alimentaire solidaire.',
      icon: Users,
    },
    {
      category: 'beneficiary',
      question: 'Combien de réservations puis-je faire ?',
      answer: 'Les bénéficiaires peuvent accéder à 2 lots par jour maximum via le programme d\'aide alimentaire. Cette limite permet de garantir un accès équitable aux lots proposés par les commerçants partenaires pour tous.',
      icon: Package,
    },
    {
      category: 'beneficiary',
      question: 'Le retrait est-il différent pour les bénéficiaires ?',
      answer: 'Non ! Le processus de retrait est identique pour tous : vous présentez votre QR code et votre code PIN. Aucune distinction n\'est faite, dans le respect de la dignité de chacun.',
      icon: Heart,
    },
    {
      category: 'association',
      question: 'Comment devenir association partenaire ?',
      answer: 'Créez un compte en sélectionnant le rôle "Association" lors de l\'inscription. Renseignez les informations de votre organisation (nom, adresse, responsable). Une fois validé, vous accédez immédiatement à votre espace de gestion.',
      icon: Users,
    },
    {
      category: 'association',
      question: 'Comment enregistrer un bénéficiaire ?',
      answer: 'Dans votre espace association, allez dans l\'onglet "Enregistrer". Remplissez le formulaire avec les informations du bénéficiaire. Un ID unique sera automatiquement généré et un email de confirmation sera envoyé au bénéficiaire.',
      icon: Users,
    },
    {
      category: 'association',
      question: 'Puis-je suivre l\'activité de mes bénéficiaires ?',
      answer: 'Oui ! L\'onglet "Activité" vous permet de visualiser l\'historique complet des réservations de chaque bénéficiaire. Vous pouvez voir le nombre de lots récupérés, les dates et les commerces visités.',
      icon: Package,
    },
    {
      category: 'association',
      question: 'Comment exporter les données de mes bénéficiaires ?',
      answer: 'L\'onglet "Export" vous permet de télécharger toutes les données de vos bénéficiaires au format CSV ou JSON. Cela inclut les informations personnelles, les statistiques d\'activité et les dates d\'enregistrement. Utile pour vos rapports et conformité RGPD.',
      icon: Settings,
    },
    {
      category: 'association',
      question: 'Que signifie "bénéficiaire vérifié" ?',
      answer: 'Le statut "vérifié" indique que vous avez validé l\'identité et l\'éligibilité du bénéficiaire selon vos critères internes. Vous pouvez basculer ce statut à tout moment depuis la liste de vos bénéficiaires.',
      icon: Shield,
    },
    {
      category: 'association',
      question: 'Combien de bénéficiaires puis-je enregistrer ?',
      answer: 'Il n\'y a pas de limite au nombre de bénéficiaires que vous pouvez enregistrer. Votre espace association s\'adapte à la taille de votre organisation, que vous gériez 10 ou 1000 bénéficiaires.',
      icon: Users,
    },
    {
      category: 'payment',
      question: 'Quels modes de paiement sont acceptés ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), les cartes de débit et certains portefeuilles électroniques. Tous les paiements sont sécurisés par notre partenaire de paiement.',
      icon: CreditCard,
    },
    {
      category: 'payment',
      question: 'Mes données bancaires sont-elles sécurisées ?',
      answer: 'Absolument ! Nous utilisons un système de paiement certifié PCI-DSS. Vos données bancaires sont chiffrées et ne sont jamais stockées sur nos serveurs.',
      icon: Shield,
    },
    {
      category: 'payment',
      question: 'Comment obtenir ma facture ?',
      answer: 'Votre facture est automatiquement envoyée par email après chaque achat. Vous pouvez également la télécharger depuis votre espace personnel, section "Mes réservations".',
      icon: Mail,
    },
    {
      category: 'technical',
      question: 'Le QR code ne se scanne pas, que faire ?',
      answer: 'Assurez-vous d\'avoir autorisé l\'accès à la caméra, que l\'éclairage est suffisant et que le QR code est net. Si le problème persiste, vous pouvez communiquer votre code PIN directement au commerçant.',
      icon: QrCode,
    },
    {
      category: 'technical',
      question: 'L\'application est-elle disponible sur mobile ?',
      answer: 'Actuellement, la plateforme est accessible via votre navigateur web mobile. Une application native iOS et Android est en développement et sera disponible prochainement.',
      icon: Settings,
    },
    {
      category: 'technical',
      question: 'Comment réinitialiser mon mot de passe ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre email, et vous recevrez un lien de réinitialisation. Suivez les instructions pour créer un nouveau mot de passe.',
      icon: Shield,
    },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@EcoPanier.com',
      description: 'Réponse sous 24h',
      action: () => window.location.href = 'mailto:support@EcoPanier.com',
    },
    {
      icon: Phone,
      title: 'Téléphone',
      value: '01 23 45 67 89',
      description: 'Lun-Ven 9h-18h',
      action: () => window.location.href = 'tel:0123456789',
    },
    {
      icon: MessageCircle,
      title: 'Chat en direct',
      value: 'Disponible',
      description: 'Réponse immédiate',
      action: () => alert('Chat à venir'),
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-100">
      <SEOHead
        title="Centre d'Aide ÉcoPanier - Toutes vos Réponses en Un Clic | FAQ & Support"
        description="Questions sur les réservations, retraits, paniers solidaires ou paiements ? Trouvez instantanément vos réponses dans notre FAQ complète. Support réactif 24/7."
        keywords="centre aide ecopanier, FAQ anti-gaspillage, support client, questions réponses, aide réservation panier, retrait QR code, paniers solidaires, service client"
        url="https://ecopanier.fr/help"
      />
      <Header />

      <PageSection background="muted" padding="lg">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">
            <HelpCircle className="h-4 w-4 text-primary-500" />
            Support & assistance
          </span>
          <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
            Nous sommes là pour répondre à toutes vos questions
          </h1>
          <p className="text-lg text-neutral-600">
            Explorez notre FAQ, filtrez par rôle ou contactez directement notre équipe. Nous vous répondons rapidement et avec précision.
          </p>
          <div className="surface mx-auto w-full max-w-2xl space-y-2 p-6">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Posez votre question (ex : Comment réserver un panier ?)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            <p className="text-left text-xs text-neutral-500">
              💡 Tapez quelques mots-clés pour trouver instantanément la bonne réponse.
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection background="default">
        <div className="flex flex-col gap-6">
          <SectionHeader
            align="center"
            eyebrow="Filtrer par rôle"
            title="Un centre d’aide pensé pour chaque acteur"
            description="Clients, commerçants, bénéficiaires, associations ou questions techniques : sélectionnez votre catégorie pour des réponses ciblées."
          />
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    'surface flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'border-primary-300 bg-primary-50 text-primary-700 shadow-sm'
                      : 'hover:border-primary-200 hover:text-primary-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          {activeCategory !== 'all' ? (
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mx-auto text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Voir toutes les questions
            </button>
          ) : null}
        </div>
      </PageSection>

      <PageSection background="subtle" padding="lg">
        <div className="flex flex-col gap-8">
          <SectionHeader
            align="center"
            eyebrow="FAQ"
            title="Les réponses les plus fréquentes"
            description={`${filteredFaqs.length} ${filteredFaqs.length > 1 ? 'questions' : 'question'} correspondante${
              filteredFaqs.length > 1 ? 's' : ''
            }${
              activeCategory !== 'all'
                ? ` dans la catégorie ${categories.find((c) => c.id === activeCategory)?.name}`
                : ''
            }.`}
          />

          {filteredFaqs.length === 0 ? (
            <div className="surface flex flex-col items-center gap-4 p-10 text-center">
              <AlertCircle className="h-10 w-10 text-neutral-400" />
              <h3 className="text-lg font-semibold text-neutral-900">Aucune question trouvée</h3>
              <p className="text-sm text-neutral-600">Essayez avec d’autres mots-clés ou réinitialisez les filtres.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="btn-secondary"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const Icon = faq.icon;
                const isExpanded = expandedFaq === faq.question;

                return (
                  <div key={faq.question} className="surface overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.question)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl border bg-neutral-50 text-neutral-500',
                            isExpanded && 'border-primary-300 bg-primary-50 text-primary-600'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3
                          className={cn(
                            'text-sm font-semibold text-neutral-900',
                            isExpanded && 'text-primary-700'
                          )}
                        >
                          {faq.question}
                        </h3>
                      </div>
                      <span className="rounded-full border border-neutral-200 p-1 text-neutral-500">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>
                    {isExpanded ? (
                      <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-4">
                        <p className="text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageSection>

      <PageSection background="default">
        <div className="flex flex-col gap-10">
          <SectionHeader
            align="center"
            eyebrow="Contact"
            title="Toujours besoin d’aide ?"
            description="Notre équipe est disponible par email, téléphone ou chat pour vous accompagner."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.title}
                  type="button"
                  onClick={method.action}
                  className="surface flex flex-col gap-3 rounded-2xl p-6 text-left transition-transform hover:-translate-y-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-900">{method.title}</p>
                    <p className="text-sm text-primary-600">{method.value}</p>
                    <p className="text-xs text-neutral-500">{method.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary-600">Cliquer pour contacter →</span>
                </button>
              );
            })}
          </div>
        </div>
      </PageSection>

      <PageSection background="contrast" padding="lg">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-100">
            Support personnalisé
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Une équipe dédiée répond en moins de deux heures
          </h2>
          <p className="text-base text-neutral-100/80">
            Besoin d’une assistance plus précise ? Envoyez-nous un message ou appelez-nous : nous sommes disponibles 7j/7 pour accompagner la communauté ÉcoPanier.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-2xl font-semibold text-white">{"< 2 h"}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-100/70">Temps de réponse moyen</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-2xl font-semibold text-white">98 %</p>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-100/70">Satisfaction client</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-2xl font-semibold text-white">7 j/7</p>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-100/70">Disponibilité</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.href = 'mailto:support@EcoPanier.com'}
              className="btn-primary"
            >
              <span className="flex items-center gap-2">
                Envoyer un email
                <Mail className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => window.location.href = 'tel:0123456789'}
              className="btn-secondary"
            >
              <span className="flex items-center gap-2">
                Nous appeler
                <Phone className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </PageSection>

      <Footer />
    </div>
  );
};

