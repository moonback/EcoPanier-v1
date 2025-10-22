import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

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
            <span>Plateforme Anti-Gaspillage & Solidaire</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Combattez le gaspillage alimentaire,
            <br />
            nourrissez l'<span className="text-primary-400">espoir</span> 🌱
          </h1>
          
          <p className="text-xl text-white/90 font-light max-w-2xl mx-auto mb-10">
            Sauvez des invendus à <strong className="font-semibold text-white">prix réduits</strong>, 
            soutenez les <strong className="font-semibold text-white">commerçants locaux</strong> et 
            aidez les <strong className="font-semibold text-white">personnes en précarité</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/how-it-works')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
            >
              <span>Je découvre ÉcoPanier</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/commercants')}
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all border border-white/20 shadow-xl"
            >
              <Users className="w-5 h-5 mr-2" />
              <span>Devenir partenaire</span>
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">-70%</div>
              <div className="text-sm text-white/70">Économies moyennes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">5</div>
              <div className="text-sm text-white/70">Acteurs connectés</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">0.9kg</div>
              <div className="text-sm text-white/70">CO₂ sauvé/panier</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

