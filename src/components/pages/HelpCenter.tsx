import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { 
  ArrowLeft, 
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
  MapPin,
  AlertCircle,
  CheckCircle,
  Heart,
  Settings,
  Shield
} from 'lucide-react';

export const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'Tout', icon: HelpCircle },
    { id: 'customer', name: 'Clients', icon: ShoppingCart },
    { id: 'merchant', name: 'Commerçants', icon: Store },
    { id: 'beneficiary', name: 'Bénéficiaires', icon: Users },
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
      question: 'Comment créer des lots gratuits pour bénéficiaires ?',
      answer: 'Lors de la création d\'un lot, sélectionnez l\'option "Lot gratuit pour bénéficiaires". Ces lots seront exclusivement accessibles aux personnes en situation de précarité, participant ainsi à la solidarité locale.',
      icon: Heart,
    },
    {
      category: 'beneficiary',
      question: 'Comment devenir bénéficiaire ?',
      answer: 'Rapprochez-vous d\'une association partenaire qui évaluera votre situation et vous délivrera un identifiant bénéficiaire unique. Cet identifiant vous permettra d\'accéder aux lots gratuits.',
      icon: Users,
    },
    {
      category: 'beneficiary',
      question: 'Combien de réservations puis-je faire ?',
      answer: 'Les bénéficiaires peuvent réserver jusqu\'à 2 lots gratuits par jour maximum. Cette limite permet de garantir un accès équitable aux lots gratuits créés par les commerçants pour tous.',
      icon: Package,
    },
    {
      category: 'beneficiary',
      question: 'Le retrait est-il différent pour les bénéficiaires ?',
      answer: 'Non ! Le processus de retrait est identique pour tous : vous présentez votre QR code et votre code PIN. Aucune distinction n\'est faite, dans le respect de la dignité de chacun.',
      icon: Heart,
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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="py-32 text-center bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Trouvez rapidement les réponses à vos questions
          </p>
          
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-black border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none font-light"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-black text-center mb-16">
            Questions fréquentes
          </h2>
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle size={64} className="text-gray-300 mx-auto mb-6" strokeWidth={1} />
              <p className="text-xl text-black font-semibold mb-2">Aucune question trouvée</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 text-black font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                
                return (
                  <div
                    key={index}
                    className="border-b border-gray-200"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full py-6 flex items-center justify-between text-left group"
                    >
                      <h3 className="text-lg font-semibold text-black pr-8 group-hover:text-gray-700 transition-colors">
                        {faq.question}
                      </h3>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-black flex-shrink-0" strokeWidth={1.5} />
                      ) : (
                        <ChevronDown size={20} className="text-black flex-shrink-0" strokeWidth={1.5} />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="pb-6">
                        <p className="text-gray-700 leading-relaxed font-light">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Besoin d'aide ?
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Notre équipe est là pour vous
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <button
                  key={index}
                  onClick={method.action}
                  className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-all border border-gray-200"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">
                    {method.title}
                  </h3>
                  <p className="text-black font-medium mb-2">
                    {method.value}
                  </p>
                  <p className="text-sm text-gray-600 font-light">
                    {method.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            Contactez-nous directement
          </p>
          <button
            onClick={() => window.location.href = 'mailto:support@EcoPanier.com'}
            className="px-8 py-4 bg-white text-black rounded-lg font-medium text-lg hover:bg-gray-100 transition-all inline-flex items-center gap-2"
          >
            <Mail size={24} strokeWidth={1.5} />
            Nous contacter
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

