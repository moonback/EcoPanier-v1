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
  { value: '10k+', label: 'Repas sauvés', icon: Package, color: 'blue' },
  { value: '5k+', label: 'Personnes aidées', icon: Users, color: 'pink' },
  { value: '15T', label: 'CO₂ économisé', icon: Leaf, color: 'green' },
  { value: '50k€', label: 'Dons solidaires', icon: Heart, color: 'red' },
];

export const features: Feature[] = [
  {
    icon: ShoppingBag,
    title: 'Combattez le gaspillage',
    description: 'Achetez des invendus à prix réduits et donnez une seconde chance aux aliments.',
    color: 'blue',
  },
  {
    icon: HandHeart,
    title: 'Paniers Suspendus',
    description: 'Offrez des repas aux personnes en situation de précarité en toute dignité.',
    color: 'pink',
  },
  {
    icon: Leaf,
    title: 'Impact environnemental',
    description: 'Réduisez votre empreinte carbone tout en économisant sur vos courses.',
    color: 'green',
  },
  {
    icon: Users,
    title: 'Solidarité locale',
    description: 'Soutenez les commerçants de votre quartier et créez du lien social.',
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
    description: 'Offrez un panier suspendu à quelqu\'un dans le besoin',
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
    text: 'Les paniers suspendus permettent à nos bénéficiaires d\'accéder à des produits de qualité dans la dignité.',
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
      'Économisez jusqu\'à 50% sur vos courses',
      'Produits frais et de qualité garantis',
      'Participez à la lutte anti-gaspillage',
      'Offrez des paniers suspendus facilement',
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
      'Attirez une nouvelle clientèle',
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
      'Accès gratuit aux lots disponibles',
      'Paniers suspendus offerts par la communauté',
      'Jusqu\'à 2 réservations par jour',
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
    description: 'En France, 1 personne sur 10 a recours à l\'aide alimentaire. Les paniers suspendus offrent une aide digne et respectueuse.',
    stats: '5,000+ personnes aidées',
    color: 'accent'
  },
  {
    icon: DollarSign,
    title: 'Économies Réelles',
    description: 'Les invendus sont proposés à -50% minimum. Un foyer moyen économise 50€/mois en utilisant notre plateforme.',
    stats: '52,800€ économisés',
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
    question: 'Les paniers suspendus, comment ça marche ?',
    answer: 'Lors de votre achat, cochez simplement "Offrir un panier suspendu". Votre don est mis à disposition des associations partenaires qui le redistribuent dignement.'
  },
  {
    question: 'Comment devenir commerçant partenaire ?',
    answer: 'Créez un compte commerçant, remplissez vos informations (SIRET, coordonnées bancaires) et commencez à créer vos premiers lots. C\'est gratuit et sans engagement.'
  }
];

