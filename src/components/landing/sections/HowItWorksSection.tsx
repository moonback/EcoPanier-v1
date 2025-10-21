import { motion } from 'framer-motion';
import { howItWorks } from '../../../data/landingData';
import { ArrowRight } from 'lucide-react';

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Lignes de connexion décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-primary-500" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-success-50 text-success-700 px-5 py-2.5 rounded-full font-bold border border-success-200 mb-6 shadow-sm"
          >
            <span className="text-2xl">🚀</span>
            Comment ça marche
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-success-600 to-accent-600 animate-gradient">
              4 étapes simples
            </span>
            <br />
            pour faire la différence
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            De la découverte à l'impact : votre parcours anti-gaspi en toute simplicité
          </p>
        </motion.div>

        <div className="space-y-20 md:space-y-32">
          {howItWorks.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;
            const gradients = [
              { gradient: 'from-blue-500 via-primary-600 to-cyan-600', glow: 'shadow-primary-500/30', bg: 'bg-primary-50', text: 'text-primary-600' },
              { gradient: 'from-green-500 via-success-600 to-emerald-600', glow: 'shadow-success-500/30', bg: 'bg-success-50', text: 'text-success-600' },
              { gradient: 'from-orange-500 via-warning-600 to-yellow-600', glow: 'shadow-warning-500/30', bg: 'bg-warning-50', text: 'text-warning-600' },
              { gradient: 'from-pink-500 via-accent-600 to-red-600', glow: 'shadow-accent-500/30', bg: 'bg-accent-50', text: 'text-accent-600' }
            ];
            const colors = gradients[index];
            const badges = ["🔍 Découverte", "🛒 Réservation", "📦 Récupération", "❤️ Impact"];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
              >
                {/* Contenu textuel */}
                <div className="flex-1 space-y-6">
                  {/* Badge d'étape avec animation */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} text-white text-3xl font-black shadow-2xl ${colors.glow}`}
                  >
                    <span className="drop-shadow-lg">{item.step}</span>
                  </motion.div>

                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                  
                  {/* Badge indicatif stylisé */}
                  <div className={`inline-flex items-center gap-3 ${colors.bg} ${colors.text} px-6 py-3 rounded-2xl text-base font-bold border-2 ${colors.text.replace('text', 'border')} shadow-lg`}>
                    <span className="text-2xl">{badges[index].split(' ')[0]}</span>
                    <span>{badges[index].split(' ')[1]}</span>
                  </div>

                  {/* Flèche vers l'étape suivante (sauf dernière) */}
                  {index < howItWorks.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="hidden lg:flex items-center gap-2 text-gray-400 font-semibold mt-8"
                    >
                      <span>Étape suivante</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
                
                {/* Visuel illustratif */}
                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    {/* Cercle décoratif en arrière-plan */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${colors.gradient} opacity-20 blur-3xl`}
                    />
                    
                    {/* Carte principale avec icône */}
                    <div className={`relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-2xl ${colors.glow} overflow-hidden group`}>
                      {/* Pattern de fond */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} />
                      </div>

                      {/* Icône */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 text-white drop-shadow-2xl relative z-10" strokeWidth={1.5} />
                      </motion.div>

                      {/* Effet de brillance au hover */}
                      <motion.div
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)',
                        }}
                        animate={{
                          x: [-200, 400],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    </div>

                    {/* Nombre d'étape flottant */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-100"
                    >
                      <span className={`text-2xl font-black ${colors.text}`}>{index + 1}</span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 md:mt-32 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 text-white px-10 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-primary-500/50 transition-all"
          >
            <span>Commencer maintenant</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

