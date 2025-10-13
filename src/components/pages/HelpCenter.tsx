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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />

      {/* Hero */}
      <section className="py-16 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <HelpCircle size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>
          
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 text-lg focus:ring-4 focus:ring-purple-300 outline-none shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-8 bg-white">
        <div className="max-w-12xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-3xl font-black text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Questions répondues</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-3xl font-black text-pink-600">24h</div>
              <div className="text-sm text-gray-600">Temps de réponse moyen</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <div className="text-3xl font-black text-purple-600">98%</div>
              <div className="text-sm text-gray-600">Satisfaction client</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
              <div className="text-3xl font-black text-blue-600">7j/7</div>
              <div className="text-sm text-gray-600">Support disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="max-w-12xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:shadow-md'
                  }`}
                >
                  <Icon size={20} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
            Questions fréquentes
          </h2>
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={64} className="text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Aucune question trouvée</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 text-purple-600 font-semibold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const Icon = faq.icon;
                const isExpanded = expandedFaq === index;
                
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon size={24} className="text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={24} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={24} className="text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <div className="pl-16 text-gray-700 leading-relaxed">
                          {faq.answer}
                        </div>
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
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-12xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Toujours besoin d'aide ?
            </h2>
            <p className="text-xl text-gray-600">
              Notre équipe est là pour vous accompagner
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <button
                  key={index}
                  onClick={method.action}
                  className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-purple-600 font-semibold mb-2">
                    {method.value}
                  </p>
                  <p className="text-sm text-gray-600">
                    {method.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guides section */}
      <section className="py-16">
        <div className="max-w-12xl mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
            Guides pratiques
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div
              onClick={() => navigate('/how-it-works')}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-transform shadow-xl"
            >
              <CheckCircle size={48} className="mb-4" />
              <h3 className="text-2xl font-bold mb-3">Comment ça marche ?</h3>
              <p className="text-blue-100 mb-4">
                Guide complet étape par étape pour utiliser la plateforme
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Voir le guide <ArrowLeft size={16} className="rotate-180" />
              </div>
            </div>
            
            <div
              onClick={() => navigate('/pickup')}
              className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-transform shadow-xl"
            >
              <QrCode size={48} className="mb-4" />
              <h3 className="text-2xl font-bold mb-3">Station de retrait</h3>
              <p className="text-pink-100 mb-4">
                Découvrez comment fonctionne le retrait avec QR code
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Voir la station <ArrowLeft size={16} className="rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-black mb-6">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Contactez-nous directement, nous sommes là pour vous aider
          </p>
          <button
            onClick={() => window.location.href = 'mailto:support@EcoPanier.com'}
            className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Mail size={24} />
            Nous contacter
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

