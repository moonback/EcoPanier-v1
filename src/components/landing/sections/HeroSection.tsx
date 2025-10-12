import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { stats } from '../../../data/landingData';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/ÉcoPanier.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        
        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
        
        {/* Overlay dégradé coloré subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-transparent to-secondary-900/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-soft-lg hover-lift backdrop-blur-md bg-white/20">
              <Sparkles size={20} className="text-warning-300" />
              <span className="text-sm font-bold text-white">
                La solidarité alimentaire réinventée
              </span>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Sauvez des repas,
            <br />
            <span className="bg-gradient-to-r from-primary-300 via-secondary-300 to-pink-300 bg-clip-text text-transparent">
              Nourrissez l'espoir
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto font-medium drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Sauvez un repas, soutenez un voisin et faites du bien à la planète 🌍
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary rounded-full px-8 py-4 text-lg group shadow-glow-md hover:shadow-glow-lg"
            >
              <span>Commencer maintenant</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/how-it-works')}
              className="btn-secondary rounded-full px-8 py-4 text-lg"
            >
              Comment ça marche ?
            </button>
          </motion.div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorMap: Record<string, string> = {
                blue: 'text-primary-600',
                pink: 'text-secondary-600',
                green: 'text-success-600',
                red: 'text-accent-600'
              };
              return (
                <motion.div
                  key={index}
                  className="card-gradient p-6 hover-lift cursor-default"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                >
                  <Icon size={32} className={`${colorMap[stat.color]} mx-auto mb-2`} />
                  <div className="text-3xl font-black text-neutral-900">{stat.value}</div>
                  <div className="text-sm text-neutral-600 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
};

