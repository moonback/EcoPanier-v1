import { 
  Heart, 
  Users, 
  ShoppingBag, 
  Leaf, 
  HandHeart,
  Package,
  MapPin,
  DollarSign
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export interface UserProfile {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  color: string;
  emoji: string;
}

export interface WhyReason {
  icon: LucideIcon;
  title: string;
  description: string;
  stats: string;
  color: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const stats: Stat[] = [
  { value: '-70%', label: 'Réduction max clients', icon: DollarSign, color: 'blue' },
  { value: '2/jour', label: 'Aide alimentaire solidaire', icon: Heart, color: 'red' },
  { value: '10k+', label: 'Repas sauvés', icon: Package, color: 'green' },
  { value: '15T', label: 'CO₂ économisé', icon: Leaf, color: 'pink' },
];

export const features: Feature[] = [
  {
    icon: ShoppingBag,
    title: 'Économisez jusqu\'à -70%',
    description: 'Achetez des invendus à prix réduits et donnez une seconde chance aux aliments de qualité.',
    color: 'blue',
  },
  {
    icon: HandHeart,
    title: 'Programme d\'aide alimentaire',
    description: 'Les commerçants participent à un programme solidaire d\'aide alimentaire pour les personnes en précarité (2 lots/jour max).',
    color: 'pink',
  },
  {
    icon: Leaf,
    title: 'Impact environnemental',
    description: 'Réduisez votre empreinte carbone : chaque repas sauvé évite 0.9kg de CO₂.',
    color: 'green',
  },
  {
    icon: Users,
    title: 'Solidarité locale',
    description: 'Soutenez les commerçants engagés et aidez les personnes dans le besoin de votre quartier.',
    color: 'purple',
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Découvrez les lots d\'invendus',
    description: 'Parcourez les invendus disponibles près de chez vous',
    icon: MapPin,
  },
  {
    step: 2,
    title: 'Réservez votre lot en ligne',
    description: 'Choisissez votre lot et payez en ligne de manière sécurisée',
    icon: ShoppingBag,
  },
  {
    step: 3,
    title: 'Récupérez votre lot',
    description: 'Présentez votre QR code au point de retrait',
    icon: Package,
  },
  {
    step: 4,
    title: 'Partagez la solidarité avec les commerçants',
    description: 'Les commerçants participent au programme d\'aide alimentaire solidaire',
    icon: Heart,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Marie Laurent',
    role: 'Cliente depuis 6 mois • Nantes',
    text: 'Chaque semaine, je récupère 2-3 paniers surprises de ma boulangerie préférée. J\'ai économisé plus de 300€ en 6 mois et je mange mieux ! En plus, je sais que j\'aide des familles du quartier. C\'est devenu un réflexe pour moi.',
    avatar: '/testimonial/testimonials-1.png',
  },
  {
    name: 'Pierre Dubois',
    role: 'Boulanger-Pâtissier • Lyon',
    text: 'Avant, je jetais 10-15kg de pain et viennoiseries par jour. Ça me brisait le cœur. Aujourd\'hui, tout est valorisé via ÉcoPanier. Mes clients adorent l\'initiative et je touche un nouveau public. C\'est gagnant-gagnant !',
    avatar: '/testimonial/testimonials-2.png',
  },
  {
    name: 'Sophie Martin',
    role: 'Coordinatrice • Association Entraide Paris 18',
    text: 'Le programme solidaire d\'ÉcoPanier a changé la donne pour nos bénéficiaires. Ils accèdent à des produits frais de qualité, pas à des restes. Le système de QR code préserve leur dignité. C\'est de l\'aide alimentaire réinventée.',
    avatar: '/testimonial/testimonials-3.png',
  },
];

export const userProfiles: UserProfile[] = [
  {
    icon: ShoppingBag,
    title: 'Clients',
    subtitle: 'Consommateurs responsables',
    description: 'Faites vos courses autrement : des produits frais de qualité jusqu\'à -70%, tout en sauvant la planète, un panier à la fois.',
    benefits: [
      '💰 Jusqu\'à 70% d\'économies sur vos courses quotidiennes',
      '✨ Produits frais et de qualité, sélectionnés par vos commerçants',
      '🌍 Réduisez votre empreinte carbone : 0.9kg CO₂ évité par repas',
      '📱 Récupération ultra-simple avec votre QR code',
      '📊 Suivez votre impact réel sur l\'environnement'
    ],
    color: 'primary',
    emoji: '🛒'
  },
  {
    icon: Package,
    title: 'Commerçants',
    subtitle: 'Artisans & Commerces locaux',
    description: 'Transformez vos invendus en revenus et en fierté. Valorisez votre engagement local tout en réduisant vos pertes.',
    benefits: [
      '💵 Récupérez jusqu\'à 30% du prix initial de vos invendus',
      '🤝 Renforcez votre ancrage local et votre image responsable',
      '⚡ Gestion simplifiée : créez un lot en 2 minutes',
      '📈 Tableau de bord avec statistiques en temps réel',
      '❤️ Participez au programme solidaire de votre quartier'
    ],
    color: 'secondary',
    emoji: '🏪'
  },
  {
    icon: Heart,
    title: 'Bénéficiaires',
    subtitle: 'Personnes en situation de précarité',
    description: 'Accédez à de bons produits frais chaque jour, gratuitement et en toute dignité, grâce à la solidarité de votre quartier.',
    benefits: [
      '🎁 Jusqu\'à 2 paniers gratuits par jour de produits frais',
      '🏪 Soutenus par les commerçants de votre quartier',
      '✨ Produits de qualité, même fraîcheur que pour tous',
      '📱 Retrait simple et discret avec votre QR code',
      '🤗 Accompagnement bienveillant par les associations'
    ],
    color: 'accent',
    emoji: '🤝'
  },
  {
    icon: MapPin,
    title: 'Collecteurs',
    subtitle: 'Livreurs solidaires',
    description: 'Gagnez un complément de revenu flexible tout en participant à une mission solidaire qui a du sens.',
    benefits: [
      '💸 Rémunération immédiate après chaque mission',
      '📍 Missions proches de chez vous, choisissez votre zone',
      '⏰ Planning 100% flexible, vous décidez quand',
      '🌱 Agissez concrètement contre le gaspillage',
      '📲 Application simple pour gérer vos livraisons'
    ],
    color: 'success',
    emoji: '🚴'
  }
];

export const whyReasons: WhyReason[] = [
  {
    icon: Leaf,
    title: 'Pour la Planète',
    description: 'Chaque année, un tiers de la production alimentaire mondiale finit à la poubelle. C\'est un non-sens écologique et économique. Avec ÉcoPanier, chaque repas sauvé évite 0.9kg de CO₂ dans l\'atmosphère. Ensemble, nous avons déjà sauvé l\'équivalent de 15 tonnes de CO₂.',
    stats: '15 tonnes de CO₂ évitées',
    color: 'success'
  },
  {
    icon: Heart,
    title: 'Pour Nos Voisins',
    description: 'En France, 1 personne sur 10 dépend de l\'aide alimentaire. Notre mission : créer un cercle vertueux où chaque panier vendu finance un panier solidaire. Les bénéficiaires accèdent à de bons produits frais, en toute dignité, jusqu\'à 2 fois par jour.',
    stats: '5,000+ personnes aidées',
    color: 'accent'
  },
  {
    icon: DollarSign,
    title: 'Pour Votre Portefeuille',
    description: 'Manger mieux sans se ruiner, c\'est possible. Nos utilisateurs économisent en moyenne 100€ par mois sur leurs courses alimentaires, tout en découvrant de nouveaux produits et commerces de leur quartier. Le tout sans compromis sur la qualité.',
    stats: '100,000€+ économisés collectivement',
    color: 'warning'
  },
  {
    icon: Users,
    title: 'Pour Nos Commerçants',
    description: 'Derrière chaque commerce, il y a une passion, un savoir-faire, des emplois. En valorisant les invendus plutôt que de les jeter, nous aidons nos artisans à limiter leurs pertes tout en renforçant leur ancrage local. C\'est bon pour eux, c\'est bon pour le quartier.',
    stats: '200+ commerces partenaires',
    color: 'primary'
  }
];

export const faqItems: FAQItem[] = [
  {
    question: 'Comment garantissez-vous la fraîcheur des produits ?',
    answer: 'Les lots sont créés le jour même et doivent être récupérés dans les 24h. Les commerçants sont responsables de la qualité des produits proposés.'
  },
  {
    question: 'Que contient un panier type ?',
    answer: 'Le contenu varie selon le commerçant : fruits et légumes, produits de boulangerie, plats préparés, produits laitiers... Vous découvrez le contenu exact lors de la réservation.'
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer: 'Le paiement est sécurisé et s\'effectue en ligne lors de la réservation. Vous recevez immédiatement un QR code pour retirer votre lot.'
  },
  {
    question: 'Puis-je choisir mon commerçant ?',
    answer: 'Oui ! Vous pouvez filtrer les lots par commerçant, localisation, catégorie de produits et prix pour trouver exactement ce que vous cherchez.'
  },
  {
    question: 'Comment fonctionne le programme d\'aide alimentaire solidaire ?',
    answer: 'Les commerçants partenaires participent à un programme d\'aide alimentaire en proposant des lots aux personnes en précarité. Les bénéficiaires peuvent accéder à 2 lots par jour maximum via ce programme solidaire et les récupérer avec leur QR code en toute dignité.'
  },
  {
    question: 'Comment devenir commerçant partenaire ?',
    answer: 'Créez un compte commerçant, remplissez vos informations (SIRET, coordonnées bancaires) et commencez à créer vos premiers lots. C\'est gratuit et sans engagement.'
  }
];

