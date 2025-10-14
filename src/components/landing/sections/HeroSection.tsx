import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-black">
      {/* Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/slide-7.png"
          alt="EcoPanier - Lutte contre le gaspillage alimentaire"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
            <span className="block">
              Sauvez des paniers, 
            </span>
            <span className="text-primary-400 block">
              soutenez votre quartier
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl font-light">
            EcoPanier connecte commerçants engagés, voisins solidaires, associations et collecteurs pour sauver des invendus, proposer des paniers suspendus et lutter ensemble contre le gaspillage alimentaire.
          </p>

          {/* Badges d'impact */}
          <div className="flex flex-wrap gap-3 mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow hover-lift transition-all">
              <span className="text-lg">♻️</span>
              <span>Anti-gaspillage</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow hover-lift transition-all">
              <span className="text-lg">🙏</span>
              <span>Solidarité locale</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow hover-lift transition-all">
              <span className="text-lg">🌱</span>
              <span>Impact CO₂</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow hover-lift transition-all">
              <span className="text-lg">💶</span>
              <span>Petits prix</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-8 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all group flex items-center gap-3 justify-center"
              type="button"
            >
              <span>Je découvre EcoPanier</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/commercants')}
              className="btn-secondary text-lg px-8 py-5 rounded-lg flex items-center justify-center border border-white/20"
              type="button"
            >
              Devenir partenaire
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </section>
  );
};

