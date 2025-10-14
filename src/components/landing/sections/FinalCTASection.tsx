import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Image Background - même style que Hero */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/slide-5.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Titre principal */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            <span className="block">
              Prêt à faire la
            </span>
            <span className="text-primary-400 block">
              différence ensemble ?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
            Rejoignez une communauté engagée qui sauve des repas, soutient les plus précaires et combat le gaspillage au quotidien.
          </p>

          {/* Badges d'avantages - même style que Hero */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow">
              <span className="text-lg">✨</span>
              <span>Inscription gratuite</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow">
              <span className="text-lg">⚡</span>
              <span>Sans engagement</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow">
              <span className="text-lg">🚀</span>
              <span>Impact immédiat</span>
            </div>
          </div>

          {/* Boutons CTA - même style que Hero */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-10 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all group flex items-center gap-3 justify-center"
              type="button"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/commercants')}
              className="btn-secondary text-lg px-8 py-5 rounded-lg flex items-center justify-center gap-2 border border-white/20"
              type="button"
            >
              <span>Devenir partenaire</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mention légère en bas */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm text-white/60 mt-8 font-light"
          >
            Aucun engagement • 100% gratuit • Sans publicité
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

