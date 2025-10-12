import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight
} from 'lucide-react';

export const Footer = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: 'Navigation',
      links: [
        { name: 'Accueil', path: '/' },
        { name: 'Comment ça marche', path: '/how-it-works' },
        { name: 'Station de retrait', path: '/pickup' },
        { name: 'Centre d\'aide', path: '/help' },
      ],
    },
    {
      title: 'Pour les professionnels',
      links: [
        { name: 'Devenir commerçant', path: '/dashboard' },
        { name: 'Espace collecteur', path: '/dashboard' },
        { name: 'Partenariats', path: '/help' },
        { name: 'Tarifs', path: '/help' },
      ],
    },
    {
      title: 'Solidarité',
      links: [
        { name: 'Paniers suspendus', path: '/' },
        { name: 'Associations partenaires', path: '/help' },
        { name: 'Devenir bénéficiaire', path: '/help' },
        { name: 'Notre impact', path: '/' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'FAQ', path: '/help' },
        { name: 'Nous contacter', path: '/help' },
        { name: 'Mentions légales', path: '/help' },
        { name: 'Politique de confidentialité', path: '/help' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: Instagram, url: '#', color: 'hover:bg-pink-600' },
    { name: 'Twitter', icon: Twitter, url: '#', color: 'hover:bg-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:bg-blue-700' },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-primary py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black mb-2 tracking-tight">
                Restez informé de nos nouveautés
              </h3>
              <p className="text-primary-100 font-medium">
                Recevez nos dernières offres et actualités solidaires
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-5 py-3 rounded-full text-neutral-900 placeholder-neutral-500 focus:ring-4 focus:ring-white/30 outline-none font-medium"
                />
                <button className="btn-secondary rounded-full whitespace-nowrap">
                  <span>S'abonner</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft-lg">
                  <Heart size={24} className="text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gradient tracking-tight">
                    EcoPanier
                  </div>
                  <div className="text-xs text-neutral-400 -mt-1 font-medium">
                    Solidarité Alimentaire
                  </div>
                </div>
              </div>
              <p className="text-neutral-400 mb-6 leading-relaxed font-medium">
                La plateforme qui connecte citoyens, commerçants et associations pour lutter contre le gaspillage alimentaire et la précarité.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a href="mailto:contact@EcoPanier.com" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-all group hover-lift">
                  <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm font-medium">contact@EcoPanier.com</span>
                </a>
                <a href="tel:0123456789" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-all group hover-lift">
                  <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all">
                    <Phone size={16} />
                  </div>
                  <span className="text-sm font-medium">01 23 45 67 89</span>
                </a>
                <div className="flex items-center gap-3 text-neutral-400">
                  <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm font-medium">Paris, France</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-bold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button
                        onClick={() => navigate(link.path)}
                        className="text-neutral-400 hover:text-white transition-all text-sm flex items-center gap-2 group font-medium"
                      >
                        <span className="w-0 h-0.5 bg-primary-500 group-hover:w-4 transition-all" />
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links & Bottom Bar */}
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-neutral-400 text-sm font-semibold">Suivez-nous :</span>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center ${social.color} transition-all hover-lift`}
                      title={social.name}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>

              {/* Copyright */}
              <div className="text-center md:text-right">
                <p className="text-neutral-400 text-sm font-medium">
                  © 2025 EcoPanier. Tous droits réservés.
                </p>
                <p className="text-neutral-500 text-xs mt-1 font-medium">
                  Fait avec <Heart size={12} className="inline text-accent-500" fill="currentColor" /> pour un monde meilleur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-neutral-950 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-neutral-600 text-xs font-semibold">
            <div className="flex items-center gap-2 hover-lift">
              <div className="w-6 h-6 bg-success-600 rounded-full flex items-center justify-center">
                ✓
              </div>
              <span>Paiements sécurisés</span>
            </div>
            <div className="flex items-center gap-2 hover-lift">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                🔒
              </div>
              <span>Données protégées</span>
            </div>
            <div className="flex items-center gap-2 hover-lift">
              <div className="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center">
                ♻️
              </div>
              <span>Impact environnemental</span>
            </div>
            <div className="flex items-center gap-2 hover-lift">
              <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                ❤️
              </div>
              <span>Solidarité garantie</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

