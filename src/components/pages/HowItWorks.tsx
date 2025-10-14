import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
import { 
  Search, 
  ShoppingCart, 
  QrCode, 
  Heart,
  UserPlus,
  Store,
  Package,
  Smartphone,
  CreditCard,
  CheckCircle,
  Gift,
  Users,
  Leaf,
  TrendingDown,
  Shield,
  Zap
} from 'lucide-react';

export const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'customer' | 'merchant' | 'beneficiary'>('customer');

  const roles = [
    { id: 'customer', name: 'Je suis Client', icon: ShoppingCart },
    { id: 'merchant', name: 'Je suis Commerçant', icon: Store },
    { id: 'beneficiary', name: 'Je suis Bénéficiaire', icon: Users },
  ];

  const customerSteps = [
    {
      number: 1,
      title: 'Créez votre compte gratuitement',
      description: 'En 2 minutes, vous êtes prêt à sauver vos premiers paniers',
      icon: UserPlus,
      details: [
        '✉️ Inscription rapide avec votre email',
        '📍 Indiquez votre adresse pour les paniers à proximité',
        '✅ Validation en un clic',
        '🎉 C\'est parti, explorez les paniers !',
      ],
    },
    {
      number: 2,
      title: 'Découvrez les paniers surprises',
      description: 'Des produits frais de qualité jusqu\'à -70% près de chez vous',
      icon: Search,
      details: [
        '🔍 Parcourez les paniers disponibles sur la carte',
        '🏪 Filtrez par type de commerce ou catégorie',
        '⏰ Vérifiez les horaires de retrait flexibles',
        '💰 Comparez les économies réalisées',
      ],
    },
    {
      number: 3,
      title: 'Réservez votre panier en un clic',
      description: 'Paiement 100% sécurisé, QR code envoyé instantanément',
      icon: CreditCard,
      details: [
        '🛒 Sélectionnez votre panier préféré',
        '💳 Payez de manière sécurisée en ligne',
        '📱 Recevez votre QR code par email et SMS',
        '🔒 Votre panier est réservé, garanti !',
      ],
    },
    {
      number: 4,
      title: 'Récupérez et savourez !',
      description: 'Retrait ultra-simple avec votre QR code en 30 secondes',
      icon: QrCode,
      details: [
        '🚶 Rendez-vous au commerce à l\'heure indiquée',
        '📲 Présentez votre QR code depuis votre téléphone',
        '🔑 Validez avec votre code PIN à 6 chiffres',
        '🎊 Profitez de vos économies et de votre impact !',
      ],
    },
  ];

  const merchantSteps = [
    {
      number: 1,
      title: 'Rejoignez la communauté',
      description: 'Inscription gratuite et sans engagement pour votre commerce',
      icon: Store,
      details: [
        '🏪 Créez votre profil commerçant en 5 minutes',
        '📍 Configurez votre point de retrait et horaires',
        '💼 Accédez à votre tableau de bord professionnel',
        '🎯 Définissez vos catégories de produits',
      ],
    },
    {
      number: 2,
      title: 'Créez vos lots en 2 minutes',
      description: 'Valorisez vos invendus plutôt que de les jeter',
      icon: Package,
      details: [
        '📝 Décrivez rapidement vos produits invendus',
        '📸 Ajoutez des photos ou utilisez l\'IA pour analyser',
        '💵 Fixez votre prix (récupérez jusqu\'à 30% du prix initial)',
        '🚀 Publiez et touchez des clients instantanément',
      ],
    },
    {
      number: 3,
      title: 'Suivez vos ventes en direct',
      description: 'Tableau de bord avec statistiques en temps réel',
      icon: Smartphone,
      details: [
        '🔔 Notifications instantanées pour chaque réservation',
        '📊 Consultez vos statistiques de vente et d\'impact',
        '📦 Préparez les commandes à l\'avance',
        '💰 Suivez vos revenus récupérés',
      ],
    },
    {
      number: 4,
      title: 'Validez les retraits simplement',
      description: 'Station de retrait intégrée ultra-simple',
      icon: QrCode,
      details: [
        '📱 Scannez le QR code du client en un clic',
        '✅ Vérification automatique du code PIN',
        '🤝 Remettez le panier avec le sourire',
        '⭐ Collectez des avis positifs de vos clients',
      ],
    },
  ];

  const beneficiarySteps = [
    {
      number: 1,
      title: 'Obtenez votre accès solidaire',
      description: 'Via une association partenaire de votre quartier',
      icon: Users,
      details: [
        '🤝 Rapprochez-vous d\'une association partenaire',
        '🎫 Recevez votre identifiant bénéficiaire unique',
        '✅ Créez votre compte en toute confidentialité',
        '💚 Accédez au programme solidaire',
      ],
    },
    {
      number: 2,
      title: 'Découvrez les paniers gratuits',
      description: 'Jusqu\'à 2 paniers par jour de produits frais et de qualité',
      icon: Gift,
      details: [
        '🔐 Connectez-vous à votre espace personnel',
        '🎁 Parcourez les paniers solidaires disponibles',
        '🏪 Choisissez parmi les commerces de votre quartier',
        '📅 Maximum 2 paniers par jour pour vous aider',
      ],
    },
    {
      number: 3,
      title: 'Réservez gratuitement',
      description: 'Aucun paiement requis, c\'est solidaire',
      icon: Heart,
      details: [
        '❤️ Sélectionnez votre panier sans frais',
        '🆓 Réservation 100% gratuite via le programme',
        '📱 Recevez votre QR code de retrait',
        '✨ Même qualité que pour tous les clients',
      ],
    },
    {
      number: 4,
      title: 'Retirez avec dignité',
      description: 'Exactement le même processus que tous les autres clients',
      icon: Package,
      details: [
        '🚶 Rendez-vous au commerce à l\'heure choisie',
        '📲 Présentez votre QR code comme tout le monde',
        '🔑 Validez avec votre code PIN',
        '🤗 Pas de distinction, juste de la solidarité',
      ],
    },
  ];

  const getSteps = () => {
    switch (activeRole) {
      case 'merchant':
        return merchantSteps;
      case 'beneficiary':
        return beneficiarySteps;
      default:
        return customerSteps;
    }
  };

  const features = [
    {
      icon: Shield,
      title: '100% Sécurisé',
      description: 'Paiements cryptés, données protégées',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: Zap,
      title: 'Ultra-Rapide',
      description: 'Réservation en 2 min, retrait en 30s',
      color: 'from-warning-500 to-warning-600',
    },
    {
      icon: Leaf,
      title: 'Éco-Responsable',
      description: '0.9kg CO₂ évité par panier',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: TrendingDown,
      title: 'Super Économique',
      description: 'Économisez jusqu\'à 70% sur vos courses',
      color: 'from-accent-500 to-accent-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Comment Ça Marche ? Simple, Rapide, Efficace | ÉcoPanier"
        description="Sauvez des paniers en 4 étapes : inscrivez-vous, explorez les invendus près de chez vous, réservez en 2 min et récupérez avec votre QR code. Rejoignez le mouvement anti-gaspi !"
        keywords="comment ça marche, guide ecopanier, réservation panier, QR code retrait, anti-gaspillage simple, économies courses, solidarité alimentaire"
        url="https://ecopanier.fr/how-it-works"
      />
      <Header />

      {/* Hero */}
      <section className="py-32 text-center bg-gray-50 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/slide-7.png)' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium mb-6 border border-white/20">
            <Zap className="w-5 h-5" />
            <span>Simple, Rapide, Efficace</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Votre parcours anti-gaspi
            <br />
            <span className="text-primary-400">en 4 étapes</span>
          </h1>
          <p className="text-xl text-white/90 font-light max-w-2xl mx-auto">
            De la découverte à l'impact : rejoignez des milliers de personnes qui font leurs courses autrement
          </p>
        </div>
      </section>

      {/* Role selector */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-8">
            Choisissez votre profil
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as 'customer' | 'merchant' | 'beneficiary')}
                  className={`p-8 rounded-2xl font-medium text-lg transition-all shadow-sm hover:shadow-lg ${
                    activeRole === role.id
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <Icon size={32} className="mx-auto mb-4" strokeWidth={1.5} />
                  {role.name}
                  {activeRole === role.id && (
                    <div className="mt-2 text-sm text-white/80">👇 Votre parcours</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-24">
            {getSteps().map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={step.number}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}
                >
                  {/* Icon side */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                      <div className="relative w-64 h-64 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Icon size={96} className="text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl font-bold text-2xl mb-6 shadow-lg">
                      {step.number}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 font-light">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 group">
                          <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" strokeWidth={2} />
                          <span className="text-gray-700 font-light">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-black text-center mb-4">
            Pourquoi des milliers d'utilisateurs nous font confiance
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 font-light">
            Une expérience pensée pour vous
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 text-center bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon size={32} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-light">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-success-500 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="bg-white rounded-3xl p-12 md:p-16 shadow-2xl border border-gray-100">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              C'est simple, non ? 
              <br />
              <span className="text-primary-600">Lancez-vous maintenant !</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 font-light max-w-2xl mx-auto">
              Rejoignez des milliers de personnes qui économisent sur leurs courses 
              tout en sauvant la planète. Votre premier panier vous attend ! 
            </p>
            
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-6 mb-10 py-6 border-y border-gray-100">
              <div>
                <div className="text-3xl font-bold text-primary-600">2min</div>
                <div className="text-sm text-gray-600">pour s'inscrire</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-success-600">-70%</div>
                <div className="text-sm text-gray-600">d'économies max</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-warning-600">10k+</div>
                <div className="text-sm text-gray-600">repas sauvés</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Je crée mon compte gratuitement</span>
                <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-gray-100 text-black rounded-xl font-medium text-lg hover:bg-gray-200 transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
