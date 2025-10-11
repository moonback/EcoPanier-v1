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
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">
                Restez informé de nos nouveautés
              </h3>
              <p className="text-blue-100">
                Recevez nos dernières offres et actualités solidaires
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-5 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 outline-none"
                />
                <button className="px-6 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  S'abonner
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
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    EcoPanier
                  </div>
                  <div className="text-xs text-gray-400 -mt-1">
                    Solidarité Alimentaire
                  </div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                La plateforme qui connecte citoyens, commerçants et associations pour lutter contre le gaspillage alimentaire et la précarité.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a href="mailto:contact@EcoPanier.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm">contact@EcoPanier.com</span>
                </a>
                <a href="tel:0123456789" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <Phone size={16} />
                  </div>
                  <span className="text-sm">01 23 45 67 89</span>
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm">Paris, France</span>
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
                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      >
                        <span className="w-0 h-0.5 bg-purple-500 group-hover:w-4 transition-all" />
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links & Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm font-semibold">Suivez-nous :</span>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center ${social.color} transition-all transform hover:scale-110`}
                      title={social.name}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>

              {/* Copyright */}
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm">
                  © 2025 EcoPanier. Tous droits réservés.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Fait avec <Heart size={12} className="inline text-red-500" /> pour un monde meilleur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                ✓
              </div>
              <span>Paiements sécurisés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                🔒
              </div>
              <span>Données protégées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                ♻️
              </div>
              <span>Impact environnemental</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
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

