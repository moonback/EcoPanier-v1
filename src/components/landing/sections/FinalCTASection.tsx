import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Image de fond */}
      <img
        src="/slide-5.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none opacity-50"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-black rounded-3xl p-12 md:p-20 text-center bg-opacity-70"
        >
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight max-w-3xl mx-auto">
            Prêt à économiser et agir pour la planète ?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light">
            Que vous soyez commerce, collecteur, association ou citoyen, EcoPanier vous aide à agir simplement contre le gaspillage alimentaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
            >
              <span>Rejoindre gratuitement</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/commercants')}
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white px-8 py-5 rounded-lg text-lg font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              En savoir plus sur le partenariat
            </button>
          </div>
          <p className="text-sm text-white/60 mt-6 font-light">
            Aucun engagement • 100% gratuit
          </p>
        </motion.div>
      </div>
    </section>
  );
};

