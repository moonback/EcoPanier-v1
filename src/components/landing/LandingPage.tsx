import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import {
  Heart,
  Users,
  ShoppingBag,
  Leaf,
  HandHeart,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [visibleStats, setVisibleStats] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleStats(true);
          }
        });
      },
      { threshold: 0.1 }
    );
    const statsElement = document.getElementById('stats-section');
    if (statsElement) observer.observe(statsElement);
    return () => observer.disconnect();
  }, []);

  const features = [
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

  const howItWorks = [
    { step: 1, title: 'Découvrez les lots', description: 'Parcourez les invendus disponibles près de chez vous', icon: MapPin },
    { step: 2, title: 'Réservez en ligne', description: 'Choisissez votre lot et payez en ligne de manière sécurisée', icon: ShoppingBag },
    { step: 3, title: 'Récupérez vos courses', description: 'Présentez votre QR code au point de retrait', icon: Package },
    { step: 4, title: 'Partagez la solidarité', description: 'Offrez un panier suspendu à quelqu’un dans le besoin', icon: Heart },
  ];

  const testimonials = [
    { name: 'Marie L.', role: 'Cliente', text: 'Grâce à cette plateforme, j’économise 50€ par mois tout en aidant mon quartier.', avatar: '👩' },
    { name: 'Pierre D.', role: 'Commerçant', text: 'Fini le gaspillage ! Je valorise mes invendus et je participe à une action solidaire.', avatar: '👨‍🍳' },
    { name: 'Association Entraide', role: 'Bénéficiaire', text: 'Les paniers suspendus permettent à nos bénéficiaires d’accéder à des produits de qualité dans la dignité.', avatar: '🤝' },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Header transparent />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/ÉcoPanier.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-12xl mx-auto px-4 text-center text-white">
          <div className="mb-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Plateforme solidaire française</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Sauvez <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">des repas</span>,<br />
            nourrissez <span className="text-emerald-300">l’espoir</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            <span className="font-semibold">10 millions de tonnes</span> d’aliments gaspillés chaque année.<br />
            <span className="text-emerald-300">Vous pouvez</span> changer cela aujourd’hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              Commencer maintenant
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:border-white hover:bg-white/10 transition-all"
            >
              Comment ça marche
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[{ value: '10k+', label: 'Repas sauvés', icon: Package }, { value: '5k+', label: 'Personnes aidées', icon: Users }, { value: '15T', label: 'CO₂ économisé', icon: Leaf }, { value: '50k€', label: 'Dons solidaires', icon: Heart }].map((stat, i) => (
              <div key={i} className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <stat.icon className="mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Sociale */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-12xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-pink-50 text-pink-600">
            <Heart size={16} fill="currentColor" />
            <span className="text-sm font-medium">Notre Mission Sociale</span>
          </div>
          <h2 className="text-4xl font-bold mb-12">Les Paniers Suspendus</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <HandHeart size={48} className="mx-auto mb-6 text-pink-600" />
              <h3 className="text-2xl font-bold mb-4">Comment ça fonctionne ?</h3>
              <ul className="space-y-3 text-left">
                {['Lors de votre achat, cochez "Offrir un panier suspendu"', 'Votre don est mis à disposition des associations partenaires', 'Les bénéficiaires récupèrent leur panier en toute dignité', 'Transparence totale : suivez l’impact de vos dons'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="mt-1 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Impact réel</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">5,000+</div>
                  <div className="text-sm opacity-90">Personnes aidées</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">50k€</div>
                  <div className="text-sm opacity-90">En dons</div>
                </div>
              </div>
              <button className="mt-8 w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                Offrir un panier
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous rejoindre ? */}
      <section className="py-20 bg-white">
        <div className="max-w-12xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Pourquoi nous rejoindre ?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${colorMap[feature.color].bg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon size={24} className={colorMap[feature.color].text} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche ? */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-12xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-green-50 text-green-600">
            <Clock size={16} />
            <span className="text-sm font-medium">Simple et rapide</span>
          </div>
          <h2 className="text-4xl font-bold mb-12">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-xl hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-blue-600" />
                </div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-12xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Ils témoignent</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-6 bg-white rounded-xl hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <div className="font-bold">{testimonial.name}</div>
                <div className="text-sm text-gray-500 mb-4">{testimonial.role}</div>
                <p className="italic text-gray-700">"{testimonial.text}"</p>
                <div className="mt-4 text-yellow-400">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact en chiffres */}
      <section id="stats-section" className="py-20 bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-12xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Notre impact en chiffres</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[{ icon: Package, value: '10,247', label: 'Repas sauvés' }, { icon: Users, value: '5,423', label: 'Personnes aidées' }, { icon: Leaf, value: '15.2', label: 'Tonnes CO₂ évitées' }, { icon: DollarSign, value: '52,800', label: 'Euros de dons' }].map((stat, i) => (
              <div key={i} className={`p-6 bg-white/10 rounded-xl backdrop-blur-sm transition-all ${visibleStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <stat.icon size={32} className="mx-auto mb-4" />
                <div className="text-4xl font-bold">{visibleStats ? stat.value : '0'}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
            <h2 className="text-4xl font-bold mb-6">Prêt à faire la différence ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Rejoignez notre communauté et participez à la révolution alimentaire solidaire.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transition-all">
                Créer mon compte
              </button>
              <button onClick={() => navigate('/pickup')} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-all">
                Découvrir la station de retrait
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
