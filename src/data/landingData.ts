import { 
  Heart, 
  Users, 
  ShoppingBag, 
  Leaf, 
  HandHeart,
  Package,
  MapPin,
  DollarSign,
  Store,
  Building2,
  Truck,
  Sparkles,
  QrCode,
  TrendingUp,
  FileText,
  Recycle,
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

export interface ActorRole {
  icon: LucideIcon;
  title: string;
  role: string;
  description: string;
  color: string;
  emoji: string;
}

export interface WhyPillar {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface KeyFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export const stats: Stat[] = [
  { value: '-70%', label: 'd\'économies sur vos courses', icon: DollarSign, color: 'blue' },
  { value: '2/jour', label: 'Paniers solidaires gratuits', icon: Heart, color: 'red' },
  { value: '10k+', label: 'Repas sauvés ensemble', icon: Package, color: 'green' },
  { value: '15T', label: 'de CO₂ évité collectivement', icon: Leaf, color: 'pink' },
];

export const features: Feature[] = [
  {
    icon: ShoppingBag,
    title: 'Économisez jusqu\'à -70%',
    description: 'Découvrez des paniers surprises de vos commerçants préférés à prix mini. Des produits de qualité de tous types, jusqu\'à 70% moins cher.',
    color: 'blue',
  },
  {
    icon: HandHeart,
    title: 'Paniers suspendus solidaires',
    description: 'Offrez un panier suspendu et aidez une personne dans le besoin. Un geste simple pour créer du lien dans votre quartier.',
    color: 'pink',
  },
  {
    icon: Leaf,
    title: 'Agissez pour la planète',
    description: 'Chaque panier récupéré, c\'est 0.9kg de CO₂ évité. Suivez votre impact environnemental en temps réel.',
    color: 'green',
  },
  {
    icon: Users,
    title: 'Soutenez vos commerçants',
    description: 'Découvrez les artisans et commerces engagés de votre quartier. Consommez local et responsable.',
    color: 'purple',
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Explorez les paniers près de chez vous',
    description: 'Parcourez les paniers surprises disponibles dans votre quartier. Filtrez par type de commerce, prix ou catégorie de produits.',
    icon: MapPin,
  },
  {
    step: 2,
    title: 'Réservez votre panier en 2 clics',
    description: 'Choisissez votre panier et payez en ligne de manière 100% sécurisée. Vous recevez immédiatement votre QR code de retrait.',
    icon: ShoppingBag,
  },
  {
    step: 3,
    title: 'Récupérez vos produits frais',
    description: 'Présentez simplement votre QR code au commerce. C\'est rapide, simple et sans contact. Dégustez vos trouvailles !',
    icon: Package,
  },
  {
    step: 4,
    title: 'Mesurez votre impact positif',
    description: 'Consultez votre tableau de bord personnel : argent économisé, kg de CO₂ évités, repas sauvés. Chaque action compte !',
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
    text: 'Le programme solidaire d\'ÉcoPanier a changé la donne pour nos bénéficiaires. Ils accèdent à des produits de qualité de tous types de commerces, pas à des restes. Le système de QR code préserve leur dignité. C\'est de l\'aide alimentaire réinventée.',
    avatar: '/testimonial/testimonials-3.png',
  },
];

export const userProfiles: UserProfile[] = [
  {
    icon: ShoppingBag,
    title: 'Clients',
    subtitle: 'Consommateurs responsables',
    description: 'Faites vos courses autrement : des produits de qualité jusqu\'à -70%, issus de tous types de commerces, tout en sauvant la planète, un panier à la fois.',
    benefits: [
      '💰 Économisez jusqu\'à 70% sur vos courses quotidiennes',
      '✨ Produits variés et de qualité : frais, secs, préparés, boulangerie...',
      '🌍 Impact concret : 0.9kg de CO₂ évité par repas sauvé',
      '📱 Récupération ultra-simple avec votre QR code personnalisé',
      '📊 Tableau de bord pour suivre votre impact environnemental',
      '❤️ Possibilité d\'offrir des paniers suspendus solidaires'
    ],
    color: 'primary',
    emoji: '🛒'
  },
  {
    icon: Heart,
    title: 'Bénéficiaires',
    subtitle: 'Accès à l\'aide alimentaire',
    description: 'Accédez à de bons produits alimentaires chaque jour, gratuitement et en toute dignité, grâce à la solidarité de votre quartier.',
    benefits: [
      '🎁 Jusqu\'à 2 paniers gratuits par jour de produits de qualité',
      '🏪 Produits variés issus des commerçants engagés de votre quartier',
      '✨ Même qualité que tous les autres paniers de la plateforme',
      '📱 Retrait simple et discret avec votre QR code personnel',
      '🤗 Inscription via une association partenaire près de chez vous',
      '🔒 Confidentialité et respect de votre dignité garantis'
    ],
    color: 'accent',
    emoji: '🤝'
  }
];

export const whyReasons: WhyReason[] = [
  {
    icon: Leaf,
    title: 'Agissez pour la Planète',
    description: 'En France, 10 millions de tonnes de nourriture finissent à la poubelle chaque année. C\'est un désastre écologique. Avec ÉcoPanier, chaque panier que vous sauvez évite 0.9kg de CO₂ dans l\'atmosphère. Un petit geste qui compte vraiment : ensemble, nous avons déjà évité l\'équivalent de 15 tonnes de CO₂.',
    stats: '15 tonnes de CO₂ évitées',
    color: 'success'
  },
  {
    icon: Heart,
    title: 'Créez du Lien Social',
    description: 'En France, 1 personne sur 10 dépend de l\'aide alimentaire. En achetant vos paniers, vous soutenez un système solidaire où chaque panier compte. Vous pouvez même offrir des paniers suspendus pour aider directement vos voisins dans le besoin. La solidarité commence à votre porte.',
    stats: '5,000+ personnes aidées',
    color: 'accent'
  },
  {
    icon: DollarSign,
    title: 'Économisez sans Compromis',
    description: 'Manger mieux sans se ruiner, c\'est possible ! Découvrez des produits de qualité jusqu\'à 70% moins cher : boulangerie, fruits et légumes, épicerie, plats préparés... Nos utilisateurs économisent en moyenne 100€ par mois tout en découvrant de nouvelles saveurs et de nouveaux commerces. Des économies qui ont du goût.',
    stats: '100€ économisés en moyenne / mois',
    color: 'warning'
  },
  {
    icon: Users,
    title: 'Soutenez Votre Quartier',
    description: 'Derrière chaque panier, il y a un artisan, un commerçant passionné, un savoir-faire local. En achetant leurs invendus, vous les aidez concrètement tout en découvrant des pépites près de chez vous. Consommez local, consommez malin, faites vivre votre quartier.',
    stats: '200+ commerces soutenus',
    color: 'primary'
  }
];

export const faqItems: FAQItem[] = [
  {
    question: 'Comment garantissez-vous la qualité des produits ?',
    answer: 'Tous les paniers sont préparés le jour même par nos commerçants partenaires et doivent être récupérés dans les 24h. Ce sont des produits de qualité (frais, secs, préparés, boulangerie...) qui auraient fini à la poubelle, simplement parce qu\'ils n\'ont pas été vendus à temps. Chaque commerçant est responsable de la qualité des produits proposés.'
  },
  {
    question: 'Que contient un panier surprise ?',
    answer: 'Le contenu varie selon le type de commerce : pain et viennoiseries (boulangeries), fruits et légumes (primeurs), plats préparés (traiteurs), produits d\'épicerie (supérettes), pâtisseries, fromages, viandes, poissons, etc. La composition exacte est indiquée lors de la réservation pour éviter les mauvaises surprises. C\'est l\'aventure gourmande garantie !'
  },
  {
    question: 'Comment se passe le paiement et la récupération ?',
    answer: 'Le paiement est 100% sécurisé et s\'effectue en ligne lors de la réservation. Vous recevez immédiatement un QR code par email et dans votre espace personnel. Il vous suffit de le présenter au commerçant lors du retrait. Simple et sans contact !'
  },
  {
    question: 'Puis-je choisir mes commerçants et filtrer les paniers ?',
    answer: 'Absolument ! Notre plateforme vous permet de filtrer les paniers par commerçant, localisation, type de produits (bio, végétarien...), catégorie et prix. Vous pouvez aussi sauvegarder vos commerçants favoris pour ne rien rater de leurs offres.'
  },
  {
    question: 'C\'est quoi un "panier suspendu" ?',
    answer: 'C\'est un geste de solidarité inspiré du "caffè sospeso" italien. Vous achetez un panier en plus du vôtre, qui sera offert gratuitement à une personne dans le besoin. Un moyen simple et direct d\'aider votre quartier tout en luttant contre le gaspillage.'
  },
  {
    question: 'Comment accéder à l\'aide alimentaire en tant que bénéficiaire ?',
    answer: 'Si vous êtes en situation de précarité, rapprochez-vous d\'une association partenaire près de chez vous. Elle vous inscrira sur notre plateforme et vous pourrez accéder gratuitement à 2 paniers par jour maximum, de tous types de commerces. Le retrait se fait avec votre QR code personnel, en toute dignité et confidentialité.'
  },
  {
    question: 'Y a-t-il des frais cachés ou un abonnement ?',
    answer: 'Non, aucun abonnement ni frais cachés ! Vous ne payez que le prix affiché du panier que vous réservez. L\'inscription est gratuite et vous n\'avez aucun engagement. Liberté totale !'
  },
  {
    question: 'Puis-je annuler ma réservation ?',
    answer: 'Les annulations doivent être effectuées au moins 2h avant l\'heure de retrait prévue. Au-delà, le panier étant préparé, l\'annulation n\'est plus possible. Pensez à vérifier vos disponibilités avant de réserver !'
  }
];

// ========================================
// NOUVELLE STRUCTURE DE LANDING PAGE
// ========================================

// Les 5 acteurs de l'écosystème EcoPanier
export const actorRoles: ActorRole[] = [
  {
    icon: Store,
    title: 'Commerçant',
    role: 'Commerce engagé',
    description: 'Crée des lots d\'invendus à prix réduits ou gratuits pour les bénéficiaires. Valorise ses produits et réduit son gaspillage.',
    color: 'secondary',
    emoji: '🏪'
  },
  {
    icon: ShoppingBag,
    title: 'Client',
    role: 'Consommateur responsable',
    description: 'Réserve des paniers solidaires à petit prix et agit concrètement pour la planète tout en économisant.',
    color: 'primary',
    emoji: '🛒'
  },
  {
    icon: Heart,
    title: 'Bénéficiaire',
    role: 'Accès aide alimentaire',
    description: 'Accède à 2 lots gratuits par jour en toute dignité, sans marquage spécial ni jugement.',
    color: 'accent',
    emoji: '❤️'
  },
  {
    icon: Building2,
    title: 'Association',
    role: 'Organisation solidaire',
    description: 'Gère ses bénéficiaires et suit leur activité en temps réel via un tableau de bord complet.',
    color: 'purple',
    emoji: '🏛️'
  },
  {
    icon: Truck,
    title: 'Collecteur',
    role: 'Livreur solidaire',
    description: 'Livre les paniers solidaires entre commerces et associations. Rémunération immédiate pour chaque mission.',
    color: 'success',
    emoji: '🚚'
  }
];

// Les 3 piliers d'EcoPanier
export const whyPillars: WhyPillar[] = [
  {
    icon: Recycle,
    title: 'Réduction du gaspillage',
    description: 'Sauvez des repas avant qu\'ils ne soient jetés. Chaque panier récupéré évite 0.9kg de CO₂ dans l\'atmosphère.',
    color: 'success'
  },
  {
    icon: HandHeart,
    title: 'Solidarité intégrée',
    description: 'Offrez des lots gratuits aux bénéficiaires ou achetez des paniers suspendus. La solidarité est au cœur du système.',
    color: 'accent'
  },
  {
    icon: TrendingUp,
    title: 'Suivi transparent',
    description: 'Mesurez votre impact réel : repas sauvés, CO₂ évité, dons effectués. Tableaux de bord pour tous les acteurs.',
    color: 'primary'
  }
];

// Fonctionnalités clés de la plateforme
export const keyFeatures: KeyFeature[] = [
  {
    icon: Sparkles,
    title: 'Création automatique avec IA',
    description: 'Gemini 2.0 Flash analyse vos photos de produits et remplit automatiquement le formulaire de création de lot.',
    color: 'primary'
  },
  {
    icon: MapPin,
    title: 'Carte interactive',
    description: 'Visualisez tous les commerçants engagés près de chez vous sur une carte en temps réel.',
    color: 'success'
  },
  {
    icon: QrCode,
    title: 'Retrait sécurisé QR + PIN',
    description: 'Système de retrait ultra-sécurisé avec QR code et code PIN à 6 chiffres pour chaque réservation.',
    color: 'secondary'
  },
  {
    icon: TrendingUp,
    title: 'Tableaux de bord complets',
    description: 'Statistiques en temps réel pour commerçants et associations : ventes, impact, activité des bénéficiaires.',
    color: 'warning'
  },
  {
    icon: FileText,
    title: 'Export RGPD',
    description: 'Exportez toutes vos données au format CSV ou JSON en un clic. Conformité RGPD totale.',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'Multi-rôles & centralisé',
    description: 'Une seule plateforme pour gérer 5 types d\'acteurs différents avec des interfaces dédiées.',
    color: 'accent'
  }
];

