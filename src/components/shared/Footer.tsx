import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from 'lucide-react';

export const Footer = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

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
    <footer className="bg-white text-black">
      {/* Newsletter Section */}
      <div className="bg-neutral-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                Restez informé
              </h3>
              <p className="text-neutral-600">
                Recevez nos dernières offres et actualités
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="input flex-1"
                />
                <button className="btn-primary whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <img
                  src="/logo.png"
                  alt="Logo EcoPanier"
                  className="h-10 rounded-lg object-cover"
                />
              </div>
              <p className="text-neutral-600 mb-6 leading-relaxed max-w-sm">
                La plateforme qui connecte citoyens, commerçants et associations pour lutter contre le gaspillage alimentaire.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a href={`mailto:${settings.platformEmail}`} className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900 transition-colors">
                  <Mail size={16} strokeWidth={1.5} />
                  <span className="text-sm">{settings.platformEmail}</span>
                </a>
                <a href={`tel:${settings.supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900 transition-colors">
                  <Phone size={16} strokeWidth={1.5} />
                  <span className="text-sm">{settings.supportPhone}</span>
                </a>
                <div className="flex items-center gap-3 text-neutral-600">
                  <MapPin size={16} strokeWidth={1.5} />
                  <span className="text-sm">Paris, France</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-neutral-900 font-semibold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button
                        onClick={() => navigate(link.path)}
                        className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links & Bottom Bar */}
          <div className="border-t border-black/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-300"
                      title={social.name}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>

              {/* Copyright */}
              <div className="text-center md:text-right">
                  <p className="text-neutral-500 text-sm">
                  © 2025 {settings.platformName}. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

