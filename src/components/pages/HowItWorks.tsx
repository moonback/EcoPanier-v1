import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
import { PageSection } from '../shared/layout/PageSection';
import { SectionHeader } from '../shared/layout/SectionHeader';
import { cn } from '../../utils/cn';
import {
  Search,
  ShoppingCart,
  QrCode,
  Heart,
  UserPlus,
  Package,
  CreditCard,
  CheckCircle,
  Gift,
  Users,
  Leaf,
  TrendingDown,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'customer' | 'beneficiary'>('customer');

  const roles = [
    { id: 'customer', name: 'Je suis client', icon: ShoppingCart },
    { id: 'beneficiary', name: 'Je suis bénéficiaire', icon: Users },
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
      description: 'Des Produits invendus jusqu\'à -70% près de chez vous',
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
      title: 'Découvrez les paniers solidaires',
      description: 'Jusqu\'à 2 paniers par jour de Produits invendus et de qualité',
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
      title: 'Réservez solidairement',
      description: 'Aucun paiement requis, c\'est solidaire',
      icon: Heart,
      details: [
        '❤️ Sélectionnez votre panier sans frais',
        '🆓 Réservation 100% solidaire via le programme',
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
      case 'beneficiary':
        return beneficiarySteps;
      default:
        return customerSteps;
    }
  };

  const features = [
    {
      icon: Shield,
      title: '100% sécurisé',
      description: 'Paiements cryptés, données protégées et vérifiées.',
      accent: 'primary',
    },
    {
      icon: Zap,
      title: 'Ultra rapide',
      description: 'Réservation en moins de 2 minutes, retrait en 30 secondes.',
      accent: 'warning',
    },
    {
      icon: Leaf,
      title: 'Éco-responsable',
      description: '0,9 kg de CO₂ évité par panier sauvé.',
      accent: 'success',
    },
    {
      icon: TrendingDown,
      title: 'Super économique',
      description: 'Jusqu’à 70 % d’économies sur vos courses quotidiennes.',
      accent: 'accent',
    },
  ];

  const featureAccents: Record<string, string> = {
    primary: 'text-primary-600 bg-primary-50',
    warning: 'text-warning-600 bg-warning-50',
    success: 'text-success-600 bg-success-50',
    accent: 'text-accent-600 bg-accent-50',
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <SEOHead
        title="Comment Ça Marche ? Simple, Rapide, Efficace | ÉcoPanier"
        description="Sauvez des paniers en 4 étapes : inscrivez-vous, explorez les invendus près de chez vous, réservez en 2 min et récupérez avec votre QR code. Rejoignez le mouvement anti-gaspi !"
        keywords="comment ça marche, guide ecopanier, réservation panier, QR code retrait, anti-gaspillage simple, économies courses, solidarité alimentaire"
        url="https://ecopanier.fr/how-it-works"
      />
      <Header />

      <PageSection background="muted" padding="lg">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">
            <Zap className="h-4 w-4 text-primary-500" />
            Simple & rapide
          </span>
          <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
            Votre parcours anti-gaspi en quatre étapes
          </h1>
          <p className="text-lg text-neutral-600">
            Que vous soyez client ou bénéficiaire, ÉcoPanier vous guide pas à pas pour sauver des paniers, soutenir vos commerçants et renforcer la solidarité locale.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              <span className="flex items-center gap-2">
                Créer mon compte
                <UserPlus className="h-4 w-4" />
              </span>
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Retour à l’accueil
            </button>
          </div>
        </div>
      </PageSection>

      <PageSection background="default">
        <div className="flex flex-col gap-10">
          <SectionHeader
            align="center"
            eyebrow="Choisissez votre profil"
            title="Un parcours dédié pour chaque rôle"
            description="Les interfaces sont adaptées à vos besoins spécifiques, tout en restant très simples à utiliser."
          />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:max-w-2xl lg:self-center">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveRole(role.id as 'customer' | 'beneficiary')}
                  className={cn(
                    'surface flex flex-col items-center gap-3 rounded-2xl p-6 text-sm font-semibold transition-transform duration-200',
                    isActive
                      ? 'border-primary-200 bg-primary-50/80 text-primary-700 shadow-md'
                      : 'hover:border-primary-200 hover:text-primary-700'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {role.name}
                </button>
              );
            })}
          </div>
        </div>
      </PageSection>

      <PageSection background="subtle" padding="lg">
        <div className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Étapes clés"
            title="Comment ça marche ?"
            description="Quatre étapes suffisent pour récupérer vos paniers ou bénéficier du programme solidaire."
          />
          <div className="space-y-6">
            {getSteps().map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="surface grid gap-6 rounded-2xl p-6 sm:grid-cols-[auto,1fr] sm:items-start">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-lg font-semibold text-primary-600">
                      {step.number}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
                      <p className="text-sm text-neutral-600">{step.description}</p>
                    </div>
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-sm text-neutral-600">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-success-500" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageSection>

      <PageSection background="default">
        <div className="flex flex-col gap-10">
          <SectionHeader
            align="center"
            eyebrow="Pourquoi ÉcoPanier"
            title="Une expérience fiable et transparente"
            description="Nous combinons sécurité, rapidité, impact environnemental et économies concrètes."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-4xl lg:self-center">
            {features.map((feature) => {
              const Icon = feature.icon;
              const accent = featureAccents[feature.accent] ?? featureAccents.primary;

              return (
                <div key={feature.title} className="surface space-y-3 p-6 text-center">
                  <div className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-xl', accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </PageSection>

      <PageSection background="contrast" padding="lg">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Prêt·e à rejoindre ÉcoPanier ?
          </h2>
          <p className="text-base text-neutral-100 sm:text-lg">
            Rejoignez la communauté qui transforme les invendus en repas solidaires, tout en aidant les commerçants locaux.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">2 min</p>
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-100/70">Pour s’inscrire</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">-70 %</p>
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-100/70">D’économies possibles</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">5 rôles</p>
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-100/70">Interconnectés</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              <span className="flex items-center gap-2">
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Explorer la plateforme
            </button>
          </div>
        </div>
      </PageSection>

      <Footer />
    </div>
  );
};
