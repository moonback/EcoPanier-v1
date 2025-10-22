import { useState } from 'react';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
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
  Shield
} from 'lucide-react';

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Centre d'Aide ÉcoPanier - Toutes vos Réponses en Un Clic | FAQ & Support"
        description="Questions sur les réservations, retraits, paniers solidaires ou paiements ? Trouvez instantanément vos réponses dans notre FAQ complète. Support réactif 24/7."
        keywords="centre aide ecopanier, FAQ anti-gaspillage, support client, questions réponses, aide réservation panier, retrait QR code, paniers solidaires, service client"
        url="https://ecopanier.fr/help"
      />
      <Header />

      {/* Hero (design unifié) */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/slide-3.png)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/15 px-6 py-3 font-semibold text-white shadow-2xl backdrop-blur-md mb-6">
              <HelpCircle className="w-5 h-5" />
              <span>Support & Assistance</span>
            </div>
            <h1 className="mb-6 text-5xl font-black leading-tight text-white md:text-7xl lg:text-8xl">
              Nous sommes là pour vous !
              <br />
              <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">Quelle est votre question ?</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl font-light leading-relaxed text-white/95 md:text-2xl">
              Trouvez instantanément les réponses dont vous avez besoin ou contactez notre équipe dédiée
            </p>
            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Posez votre question... (ex: Comment réserver un panier ?)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-5 rounded-xl text-black border-2 border-white/50 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none font-light shadow-2xl placeholder:text-gray-400"
                />
              </div>
              <p className="text-white/70 text-sm mt-3">
                💡 Tapez quelques mots-clés pour trouver rapidement votre réponse
              </p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white/20"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-black mb-6">
            Filtrer par catégorie
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {category.name}
                  {isActive && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          {activeCategory !== 'all' && (
            <div className="text-center mt-4">
              <button
                onClick={() => setActiveCategory('all')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
              >
                Voir toutes les questions
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Les réponses à vos questions
            </h2>
            <p className="text-lg text-gray-600 font-light">
              {filteredFaqs.length} {filteredFaqs.length > 1 ? 'questions' : 'question'} {activeCategory !== 'all' && `dans la catégorie ${categories.find(c => c.id === activeCategory)?.name}`}
            </p>
          </div>
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100">
              <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
                <AlertCircle size={64} className="text-gray-300" strokeWidth={1} />
              </div>
              <p className="text-2xl text-black font-semibold mb-2">Aucune question trouvée</p>
              <p className="text-gray-600 mb-6">Essayez avec d'autres mots-clés ou catégories</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                const Icon = faq.icon;
                
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl border-2 transition-all ${
                      isExpanded 
                        ? 'border-primary-300 shadow-lg' 
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full p-6 flex items-center justify-between text-left group"
                    >
                      <div className="flex items-start gap-4 flex-1 pr-4">
                        <div className={`p-3 rounded-xl flex-shrink-0 transition-all ${
                          isExpanded 
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
                            : 'bg-gray-100 group-hover:bg-primary-50'
                        }`}>
                          <Icon 
                            size={20} 
                            className={isExpanded ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} 
                            strokeWidth={2} 
                          />
                        </div>
                        <h3 className={`text-lg font-semibold transition-colors ${
                          isExpanded ? 'text-primary-700' : 'text-black group-hover:text-primary-600'
                        }`}>
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        isExpanded ? 'bg-primary-100' : 'bg-gray-50 group-hover:bg-gray-100'
                      }`}>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-primary-600" strokeWidth={2} />
                        ) : (
                          <ChevronDown size={20} className="text-gray-600 group-hover:text-primary-600" strokeWidth={2} />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <div className="pl-16 pr-4">
                          <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-primary-500">
                            <p className="text-gray-700 leading-relaxed font-light text-base">
                              {faq.answer}
                            </p>
                          </div>
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
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-success-500 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-medium mb-4">
              <MessageCircle className="w-5 h-5" />
              <span>Contactez-nous</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Vous n'avez pas trouvé ?
              <br />
              <span className="text-primary-600">Parlons-en directement !</span>
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Notre équipe est à votre écoute pour répondre à toutes vos questions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const colors = [
                { bg: 'from-primary-500 to-primary-600', hover: 'hover:from-primary-600 hover:to-primary-700' },
                { bg: 'from-success-500 to-success-600', hover: 'hover:from-success-600 hover:to-success-700' },
                { bg: 'from-secondary-500 to-secondary-600', hover: 'hover:from-secondary-600 hover:to-secondary-700' },
              ];
              
              return (
                <button
                  key={index}
                  onClick={method.action}
                  className="group bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-gray-200"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${colors[index].bg} ${colors[index].hover} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon size={32} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-primary-600 transition-colors">
                    {method.title}
                  </h3>
                  <p className="text-lg text-primary-600 font-semibold mb-2">
                    {method.value}
                  </p>
                  <p className="text-sm text-gray-600 font-light">
                    {method.description}
                  </p>
                  <div className="mt-4 text-sm text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Cliquez pour contacter →
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-success-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-white/10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-medium mb-6">
              <HelpCircle className="w-5 h-5" />
              <span>Support Personnalisé</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Toujours une question ? 
              <br />
              <span className="text-primary-400">On est là pour vous !</span>
            </h2>
            <p className="text-xl text-white/80 mb-10 font-light max-w-2xl mx-auto">
              Notre équipe répond en moyenne en moins de 2 heures. 
              Écrivez-nous, on adore discuter avec notre communauté ! 💬
            </p>
            
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 mb-10 py-6 border-y border-white/10">
              <div>
                <div className="text-3xl font-bold text-primary-400">{"<2h"}</div>
                <div className="text-sm text-white/70">Temps de réponse moyen</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-success-400">98%</div>
                <div className="text-sm text-white/70">Satisfaction client</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-warning-400">7j/7</div>
                <div className="text-sm text-white/70">Support disponible</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = 'mailto:support@EcoPanier.com'}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-medium text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
              >
                <Mail size={24} strokeWidth={2} />
                <span>Envoyer un email</span>
              </button>
              <button
                onClick={() => window.location.href = 'tel:0123456789'}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                <Phone size={24} strokeWidth={2} />
                <span>Nous appeler</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

