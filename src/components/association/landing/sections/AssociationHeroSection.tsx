import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

export const AssociationHeroSection = () => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20"
          >
            <span className="text-lg">🏛️</span>
            <span>Rejoignez les associations engagées</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
            Simplifiez la gestion de
            <br />
            votre <span className="text-accent-400">aide alimentaire</span>.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl font-light">
            Une plateforme complète pour enregistrer, gérer et suivre vos bénéficiaires en toute dignité. Gratuit pour les associations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/auth?role=association')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-purple-900 px-8 py-5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
            >
              <span>Rejoindre la plateforme</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={scrollToContent}
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white px-8 py-5 rounded-lg text-lg font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl"
          >
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-white/70">Gratuit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">5 min</div>
              <div className="text-sm text-white/70">Inscription bénéficiaire</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">5000+</div>
              <div className="text-sm text-white/70">Bénéficiaires aidés</div>
            </div>
          </motion.div>
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

