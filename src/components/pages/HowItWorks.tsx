import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
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
    { id: 'customer', name: 'Je suis Client', icon: ShoppingCart, color: 'blue' },
    { id: 'merchant', name: 'Je suis Commerçant', icon: Store, color: 'purple' },
    { id: 'beneficiary', name: 'Je suis Bénéficiaire', icon: Users, color: 'pink' },
  ];

  const customerSteps = [
    {
      number: 1,
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en quelques clics',
      icon: UserPlus,
      details: [
        'Renseignez vos informations de base',
        'Ajoutez votre adresse pour voir les offres près de chez vous',
        'Vérifiez votre email',
        'Votre compte est prêt !',
      ],
    },
    {
      number: 2,
      title: 'Explorez les lots disponibles',
      description: 'Découvrez les invendus près de chez vous',
      icon: Search,
      details: [
        'Filtrez par catégorie (fruits, légumes, boulangerie...)',
        'Consultez les horaires de retrait',
        'Vérifiez les prix réduits (jusqu\'à -70%)',
        'Lisez les descriptions détaillées',
      ],
    },
    {
      number: 3,
      title: 'Réservez et payez',
      description: 'Sécurisez votre lot en ligne',
      icon: CreditCard,
      details: [
        'Choisissez la quantité souhaitée',
        'Profitez de réductions jusqu\'à -70%',
        'Payez en ligne de manière sécurisée',
        'Recevez votre QR code de retrait',
      ],
    },
    {
      number: 4,
      title: 'Récupérez vos courses',
      description: 'Présentez votre QR code au point de retrait',
      icon: QrCode,
      details: [
        'Rendez-vous au point de retrait indiqué',
        'Respectez la plage horaire',
        'Montrez votre QR code',
        'Communiquez votre code PIN',
        'Repartez avec vos courses !',
      ],
    },
  ];

  const merchantSteps = [
    {
      number: 1,
      title: 'Inscrivez votre commerce',
      description: 'Créez votre profil commerçant',
      icon: Store,
      details: [
        'Renseignez les informations de votre commerce',
        'Ajoutez votre adresse et horaires',
        'Validez votre inscription',
        'Accédez à votre tableau de bord',
      ],
    },
    {
      number: 2,
      title: 'Créez vos lots',
      description: 'Mettez en vente vos invendus',
      icon: Package,
      details: [
        'Décrivez vos produits',
        'Ajoutez des photos',
        'Définissez le prix réduit (jusqu\'à -70%)',
        'Option : Créez des lots gratuits pour bénéficiaires',
        'Indiquez la plage horaire de retrait',
        'Publiez votre lot',
      ],
    },
    {
      number: 3,
      title: 'Gérez les réservations',
      description: 'Suivez vos ventes en temps réel',
      icon: Smartphone,
      details: [
        'Recevez des notifications pour chaque réservation',
        'Consultez le nombre de réservations',
        'Préparez les commandes',
        'Suivez vos statistiques de vente',
      ],
    },
    {
      number: 4,
      title: 'Validez les retraits',
      description: 'Utilisez la station de retrait',
      icon: QrCode,
      details: [
        'Ouvrez la station de retrait sur tablette',
        'Scannez le QR code du client',
        'Vérifiez le code PIN',
        'Remettez le colis',
        'Le statut est mis à jour automatiquement',
      ],
    },
  ];

  const beneficiarySteps = [
    {
      number: 1,
      title: 'Contactez une association',
      description: 'Obtenez votre identifiant bénéficiaire',
      icon: Users,
      details: [
        'Rapprochez-vous d\'une association partenaire',
        'Présentez votre situation',
        'Recevez votre identifiant unique (format: YYYY-BEN-XXXXX)',
        'Créez votre compte sur la plateforme',
      ],
    },
    {
      number: 2,
      title: 'Accédez aux lots gratuits',
      description: 'Consultez les lots gratuits créés par les commerçants',
      icon: Gift,
      details: [
        'Connectez-vous à votre espace',
        'Parcourez les lots gratuits exclusifs',
        'Limite : 2 lots gratuits par jour maximum',
        'Choisissez selon vos besoins',
      ],
    },
    {
      number: 3,
      title: 'Réservez votre lot gratuit',
      description: 'Sécurisez votre lot gratuitement',
      icon: Heart,
      details: [
        'Sélectionnez votre lot gratuit',
        'Réservez sans paiement (100% gratuit)',
        'Recevez votre QR code',
        'Notez votre code PIN',
      ],
    },
    {
      number: 4,
      title: 'Retirez en toute dignité',
      description: 'Récupérez votre lot comme tous les clients',
      icon: Package,
      details: [
        'Rendez-vous au point de retrait',
        'Présentez votre QR code',
        'Communiquez votre code PIN',
        'Aucune distinction avec les autres clients',
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
      title: 'Sécurisé',
      description: 'Paiements sécurisés et données protégées',
    },
    {
      icon: Zap,
      title: 'Rapide',
      description: 'Réservation en moins de 2 minutes',
    },
    {
      icon: Leaf,
      title: 'Écologique',
      description: 'Réduisez votre empreinte carbone',
    },
    {
      icon: TrendingDown,
      title: 'Économique',
      description: 'Jusqu\'à -70% sur vos courses',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <CheckCircle size={20} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Guide complet</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Simple, rapide et solidaire
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Découvrez comment utiliser notre plateforme en quelques étapes simples
          </p>
        </div>
      </section>

      {/* Role selector */}
      <section className="py-8">
        <div className="max-w-12xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as 'customer' | 'merchant' | 'beneficiary')}
                  className={`p-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    activeRole === role.id
                      ? `bg-gradient-to-r from-${role.color}-600 to-${role.color}-500 text-white shadow-xl`
                      : 'bg-white text-gray-700 hover:shadow-lg'
                  }`}
                >
                  <Icon size={32} className="mx-auto mb-3" />
                  {role.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="max-w-12xl mx-auto px-4">
          <div className="space-y-16">
            {getSteps().map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={step.number}
                  className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
                >
                  {/* Image/Icon side */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl transform rotate-3 opacity-20" />
                      <div className="relative bg-white rounded-3xl p-12 shadow-2xl">
                        <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Icon size={64} className="text-white" />
                        </div>
                        <div className="text-center">
                          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-xl mb-4">
                            Étape {step.number}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-xl text-gray-600 mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-lg">{detail}</span>
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
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-12xl mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
            Pourquoi choisir notre plateforme ?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-xl text-center transform hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video/Tutorial section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Besoin d'une démonstration ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Regardez notre tutoriel vidéo pour mieux comprendre
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-2 shadow-2xl">
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">▶️</span>
                </div>
                <p className="text-white text-lg">Tutoriel vidéo (À venir)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Des questions ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Consultez notre FAQ pour trouver toutes les réponses
          </p>
          <button
            onClick={() => navigate('/help')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Voir la FAQ complète
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-black mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui font déjà la différence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Créer mon compte
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-purple-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

