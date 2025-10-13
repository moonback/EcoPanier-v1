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
    { id: 'customer', name: 'Je suis Client', icon: ShoppingCart },
    { id: 'merchant', name: 'Je suis Commerçant', icon: Store },
    { id: 'beneficiary', name: 'Je suis Bénéficiaire', icon: Users },
  ];

  const customerSteps = [
    {
      number: 1,
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en quelques clics',
      icon: UserPlus,
      details: [
        'Renseignez vos informations de base',
        'Ajoutez votre adresse',
        'Vérifiez votre email',
        'Votre compte est prêt !',
      ],
    },
    {
      number: 2,
      title: 'Explorez les lots',
      description: 'Découvrez les invendus près de chez vous',
      icon: Search,
      details: [
        'Filtrez par catégorie',
        'Consultez les horaires',
        'Vérifiez les prix (jusqu\'à -70%)',
        'Lisez les descriptions',
      ],
    },
    {
      number: 3,
      title: 'Réservez et payez',
      description: 'Sécurisez votre lot en ligne',
      icon: CreditCard,
      details: [
        'Choisissez la quantité',
        'Payez en ligne',
        'Recevez votre QR code',
      ],
    },
    {
      number: 4,
      title: 'Récupérez vos courses',
      description: 'Présentez votre QR code',
      icon: QrCode,
      details: [
        'Rendez-vous au point de retrait',
        'Montrez votre QR code',
        'Communiquez votre PIN',
        'Repartez avec vos courses',
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
        'Renseignez vos informations',
        'Ajoutez adresse et horaires',
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
        'Définissez le prix réduit',
        'Publiez votre lot',
      ],
    },
    {
      number: 3,
      title: 'Gérez les réservations',
      description: 'Suivez vos ventes en temps réel',
      icon: Smartphone,
      details: [
        'Recevez des notifications',
        'Consultez les réservations',
        'Préparez les commandes',
      ],
    },
    {
      number: 4,
      title: 'Validez les retraits',
      description: 'Utilisez la station de retrait',
      icon: QrCode,
      details: [
        'Scannez le QR code client',
        'Vérifiez le code PIN',
        'Remettez le colis',
      ],
    },
  ];

  const beneficiarySteps = [
    {
      number: 1,
      title: 'Contactez une association',
      description: 'Obtenez votre identifiant',
      icon: Users,
      details: [
        'Rapprochez-vous d\'une association',
        'Recevez votre identifiant unique',
        'Créez votre compte',
      ],
    },
    {
      number: 2,
      title: 'Accédez aux lots gratuits',
      description: 'Consultez les lots exclusifs',
      icon: Gift,
      details: [
        'Connectez-vous',
        'Parcourez les lots gratuits',
        'Limite : 2 lots par jour',
      ],
    },
    {
      number: 3,
      title: 'Réservez gratuitement',
      description: '100% gratuit',
      icon: Heart,
      details: [
        'Sélectionnez votre lot',
        'Réservez sans paiement',
        'Recevez votre QR code',
      ],
    },
    {
      number: 4,
      title: 'Retirez en toute dignité',
      description: 'Comme tous les clients',
      icon: Package,
      details: [
        'Présentez votre QR code',
        'Communiquez votre PIN',
        'Aucune distinction',
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
      description: 'Paiements sécurisés',
    },
    {
      icon: Zap,
      title: 'Rapide',
      description: 'Réservation en 2 min',
    },
    {
      icon: Leaf,
      title: 'Écologique',
      description: 'Réduisez votre impact',
    },
    {
      icon: TrendingDown,
      title: 'Économique',
      description: 'Jusqu\'à -70%',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="py-32 text-center bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            Comment ça marche
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Découvrez comment utiliser notre plateforme
          </p>
        </div>
      </section>

      {/* Role selector */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as 'customer' | 'merchant' | 'beneficiary')}
                  className={`p-8 rounded-2xl font-medium text-lg transition-all ${
                    activeRole === role.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={32} className="mx-auto mb-4" strokeWidth={1.5} />
                  {role.name}
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
                    <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center">
                      <Icon size={96} className="text-gray-300" strokeWidth={1} />
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="flex-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full font-bold text-xl mb-6">
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
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-black flex-shrink-0 mt-0.5" strokeWidth={2} />
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
          <h2 className="text-4xl font-bold text-black text-center mb-16">
            Pourquoi choisir notre plateforme
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 text-center"
                >
                  <Icon size={32} className="text-black mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-xl font-bold text-black mb-2">
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
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Rejoignez des milliers d'utilisateurs qui font la différence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-900 transition-all"
            >
              Créer mon compte
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gray-100 text-black rounded-lg font-medium text-lg hover:bg-gray-200 transition-all"
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
