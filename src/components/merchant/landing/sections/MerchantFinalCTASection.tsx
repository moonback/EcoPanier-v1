import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const MerchantFinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            Prêt à valoriser vos invendus ?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            Rejoignez les commerçants engagés qui ont choisi de transformer leurs invendus en impact positif
          </p>

          {/* Quick Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { icon: '⚡', text: 'Inscription en 5 minutes' },
              { icon: '💰', text: 'Premiers revenus dès la 1ère semaine' },
              { icon: '🌱', text: 'Impact environnemental immédiat' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-4xl mb-2">{benefit.icon}</span>
                <span className="text-white/90 font-light">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Main CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/auth?role=merchant')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-secondary-900 px-10 py-6 rounded-xl text-xl font-medium hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
              <span>Gratuit à vie</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
              <span>Support dédié</span>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 pt-16 border-t border-white/20"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-white mb-2">200+</div>
                <div className="text-white/70 text-sm">Commerçants partenaires</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">10k+</div>
                <div className="text-white/70 text-sm">Repas sauvés</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">15T</div>
                <div className="text-white/70 text-sm">CO₂ évité</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                <div className="text-white/70 text-sm">Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

