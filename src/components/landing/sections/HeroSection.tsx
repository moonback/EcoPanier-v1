import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 text-center bg-gray-50 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/slide-7.png)' }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium mb-6 border border-white/20">
            <Sparkles className="w-5 h-5" />
            <span>Rejoignez le mouvement anti-gaspi</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sauvez des paniers,
            <br />
            <span className="text-primary-400">soutenez votre quartier</span>
          </h1>
          
          <p className="text-xl text-white/90 font-light max-w-2xl mx-auto mb-10">
            EcoPanier connecte commerçants engagés, voisins solidaires, associations et collecteurs pour sauver des invendus, proposer des paniers suspendus et lutter ensemble contre le gaspillage alimentaire.
          </p>

          {/* Badges d'impact */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span className="text-lg">♻️</span>
              <span>Anti-gaspillage</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span className="text-lg">🙏</span>
              <span>Solidarité locale</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span className="text-lg">🌱</span>
              <span>Impact CO₂</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span className="text-lg">💶</span>
              <span>Petits prix</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
              type="button"
            >
              <span>Je découvre EcoPanier</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/commercants')}
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/20 transition-all border border-white/20"
              type="button"
            >
              Devenir partenaire
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

