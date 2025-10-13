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
  { value: '2/jour', label: 'Lots gratuits bénéficiaires', icon: Heart, color: 'red' },
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
    title: 'Lots gratuits pour bénéficiaires',
    description: 'Les commerçants offrent des lots gratuits exclusifs aux personnes en précarité (2 lots/jour max).',
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
    title: 'Découvrez les lots',
    description: 'Parcourez les invendus disponibles près de chez vous',
    icon: MapPin,
  },
  {
    step: 2,
    title: 'Réservez en ligne',
    description: 'Choisissez votre lot et payez en ligne de manière sécurisée',
    icon: ShoppingBag,
  },
  {
    step: 3,
    title: 'Récupérez vos courses',
    description: 'Présentez votre QR code au point de retrait',
    icon: Package,
  },
  {
    step: 4,
    title: 'Partagez la solidarité',
    description: 'Les commerçants créent des lots gratuits pour les bénéficiaires',
    icon: Heart,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Marie L.',
    role: 'Cliente',
    text: 'Grâce à cette plateforme, j\'économise 50€ par mois tout en aidant mon quartier. Une initiative magnifique !',
    avatar: '👩',
  },
  {
    name: 'Pierre D.',
    role: 'Commerçant',
    text: 'Fini le gaspillage ! Je valorise mes invendus et je participe à une action solidaire. Bravo !',
    avatar: '👨‍🍳',
  },
  {
    name: 'Association Entraide',
    role: 'Bénéficiaire',
    text: 'Les lots gratuits permettent à nos bénéficiaires d\'accéder à 2 lots par jour de produits frais dans la dignité.',
    avatar: '🤝',
  },
];

export const userProfiles: UserProfile[] = [
  {
    icon: ShoppingBag,
    title: 'Clients',
    subtitle: 'Consommateurs responsables',
    description: 'Vous souhaitez réduire votre budget courses tout en agissant pour la planète',
    benefits: [
      'Économisez jusqu\'à 70% sur vos courses',
      'Produits frais et de qualité garantis',
      'Participez à la lutte anti-gaspillage',
      'Récupération facile avec QR code',
      'Suivez votre impact environnemental'
    ],
    color: 'primary',
    emoji: '🛒'
  },
  {
    icon: Package,
    title: 'Commerçants',
    subtitle: 'Artisans & Commerces locaux',
    description: 'Valorisez vos invendus au lieu de les jeter, tout en augmentant vos revenus',
    benefits: [
      'Réduisez vos pertes financières',
      'Créez des lots gratuits pour bénéficiaires',
      'Améliorez votre image de marque',
      'Gestion simple et rapide des lots',
      'Statistiques de vente détaillées'
    ],
    color: 'secondary',
    emoji: '🏪'
  },
  {
    icon: Heart,
    title: 'Bénéficiaires',
    subtitle: 'Personnes en situation de précarité',
    description: 'Accédez à des produits frais gratuitement dans le respect et la dignité',
    benefits: [
      '2 lots gratuits par jour maximum',
      'Lots gratuits exclusifs des commerçants',
      'Produits frais et de qualité 100% gratuits',
      'Retrait simple avec QR code',
      'Accompagnement par les associations'
    ],
    color: 'accent',
    emoji: '🤝'
  },
  {
    icon: MapPin,
    title: 'Collecteurs',
    subtitle: 'Livreurs solidaires',
    description: 'Gagnez un revenu complémentaire en effectuant des livraisons solidaires',
    benefits: [
      'Missions flexibles près de chez vous',
      'Rémunération immédiate',
      'Participez à une action solidaire',
      'Planning adaptable',
      'Suivi de vos missions en temps réel'
    ],
    color: 'success',
    emoji: '🚴'
  }
];

export const whyReasons: WhyReason[] = [
  {
    icon: Leaf,
    title: 'Impact Environnemental',
    description: 'La production alimentaire représente 30% des émissions de CO₂ mondiales. Sauver un repas, c\'est éviter 0.9kg de CO₂.',
    stats: '15 tonnes de CO₂ évitées',
    color: 'success'
  },
  {
    icon: Heart,
    title: 'Solidarité Sociale',
    description: 'En France, 1 personne sur 10 a recours à l\'aide alimentaire. Les lots gratuits (2/jour max) offrent une aide digne et respectueuse.',
    stats: '5,000+ personnes aidées',
    color: 'accent'
  },
  {
    icon: DollarSign,
    title: 'Économies Réelles',
    description: 'Les invendus sont proposés jusqu\'à -70%. Un foyer moyen économise jusqu\'à 100€/mois en utilisant notre plateforme.',
    stats: '100,000€+ économisés',
    color: 'warning'
  },
  {
    icon: Users,
    title: 'Commerce Local',
    description: 'Soutenez les artisans et commerçants de votre quartier. 100% de vos achats bénéficient directement aux commerces locaux.',
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
    question: 'Comment fonctionnent les lots gratuits pour bénéficiaires ?',
    answer: 'Les commerçants créent des lots gratuits exclusifs pour les personnes en précarité. Les bénéficiaires peuvent réserver jusqu\'à 2 lots gratuits par jour et les récupérer avec leur QR code en toute dignité.'
  },
  {
    question: 'Comment devenir commerçant partenaire ?',
    answer: 'Créez un compte commerçant, remplissez vos informations (SIRET, coordonnées bancaires) et commencez à créer vos premiers lots. C\'est gratuit et sans engagement.'
  }
];

