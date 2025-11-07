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
    { id: 'customer', name: 'Parcours client', icon: ShoppingCart },
    { id: 'beneficiary', name: 'Parcours solidaire', icon: Users },
  ];

  const customerSteps = [
    {
      number: 1,
      title: 'Créez votre compte en quelques instants',
      description: 'Activez votre profil sécurisé et personnalisez vos préférences locales.',
      icon: UserPlus,
      details: [
        'Inscription par email avec vérification instantanée',
        'Préférences géographiques pour des recommandations pertinentes',
        'Validation du consentement RGPD et notifications ciblées',
        'Accès direct à votre espace personnalisé',
      ],
    },
    {
      number: 2,
      title: 'Explorez les paniers disponibles',
      description: 'Cartographie en temps réel des invendus près de chez vous.',
      icon: Search,
      details: [
        'Recherche intelligente par commerce, catégorie ou régime alimentaire',
        'Visualisation des stocks en direct et des créneaux de retrait',
        'Indicateurs d’impact environnemental et d’économies générées',
        'Notifications proactives sur vos commerces favoris',
      ],
    },
    {
      number: 3,
      title: 'Réservez et payez en toute confiance',
      description: 'Transaction sécurisée, confirmation immédiate, QR code unique.',
      icon: CreditCard,
      details: [
        'Sélection en un clic avec affichage des conditions de retrait',
        'Paiement sécurisé via PSP conforme PCI-DSS',
        'Envoi automatisé du QR code et du PIN par email et SMS',
        'Traçabilité complète accessible depuis votre tableau de bord',
      ],
    },
    {
      number: 4,
      title: 'Récupérez votre panier en station',
      description: 'Retrait fluide accompagné d’un contrôle d’identité numérique.',
      icon: QrCode,
      details: [
        'Arrivée sur créneau confirmé auprès du commerçant partenaire',
        'Scan du QR code depuis votre app ou votre wallet Apple/Google',
        'Double validation PIN + identifiant réservation',
        'Confirmation automatique et suivi post-retrait',
      ],
    },
  ];


  const beneficiarySteps = [
    {
      number: 1,
      title: 'Activez votre accès solidaire',
      description: 'Éligibilité vérifiée par une association partenaire certifiée.',
      icon: Users,
      details: [
        'Orientation via un réseau d’associations habilitées',
        'Attribution d’un identifiant bénéficiaire sécurisé',
        'Création de compte confidentielle et conforme RGPD',
        'Activation du portefeuille solidaire et des quotas associés',
      ],
    },
    {
      number: 2,
      title: 'Choisissez vos paniers solidaires',
      description: 'Sélection quotidienne dans la limite de deux paniers par bénéficiaire.',
      icon: Gift,
      details: [
        'Accès au catalogue solidaire depuis votre tableau de bord',
        'Filtrage par besoin alimentaire et disponibilité horaire',
        'Visibilité des commerçants engagés à proximité',
        'Gestion automatique du quota journalier de paniers',
      ],
    },
    {
      number: 3,
      title: 'Réservez sans avance de frais',
      description: 'Validation instantanée, suivi transparent de vos réservations.',
      icon: Heart,
      details: [
        'Confirmation en un clic via votre crédit solidaire',
        'Notification sécurisée à l’association référente',
        'Réception du QR code de retrait et du PIN dédié',
        'Accès aux mêmes standards qualité que les clients payants',
      ],
    },
    {
      number: 4,
      title: 'Retirez votre panier en toute discrétion',
      description: 'Processus unifié, sans différenciation côté commerçant.',
      icon: Package,
      details: [
        'Retrait sur le même parcours client que les réservations payantes',
        'Scan du QR code et validation PIN sur terminal sécurisé',
        'Suivi temps réel côté association et commerce',
        'Expérience confidentielle et respectueuse de votre situation',
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
            ÉcoPanier orchestre un parcours utilisateur premium : une plateforme fiable, sécurisée et pensée pour maximiser l’impact économique, social et environnemental de chaque panier sauvé.
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
            description="Deux expériences dédiées, unifiées par la même exigence de qualité de service et de performance opérationnelle."
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
            title="Votre parcours simplifié"
            description="Quatre séquences fluides orchestrées par notre plateforme pour garantir fiabilité, rapidité et inclusion."
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
            description="Nous combinons sécurité, vitesse d’exécution, pilotage d’impact et économies mesurables pour chaque acteur."
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
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-100/70">Activation compte</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">-70 %</p>
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-100/70">Économies moyennes</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">6 rôles</p>
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-100/70">Écosystème complet</p>
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
