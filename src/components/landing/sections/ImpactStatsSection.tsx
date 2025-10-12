import { useState, useEffect } from 'react';
import { Package, Users, Leaf, DollarSign } from 'lucide-react';

export const ImpactStatsSection = () => {
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

    const statsElement = document.getElementById('impact-stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: Package, value: '10,247', label: 'Repas sauvés', suffix: '' },
    { icon: Users, value: '5,423', label: 'Personnes aidées', suffix: '' },
    { icon: Leaf, value: '15.2', label: 'Tonnes CO₂ évitées', suffix: 'T' },
    { icon: DollarSign, value: '52,800', label: 'Euros de dons', suffix: '€' },
  ];

  return (
    <section 
      id="impact-stats-section" 
      className="py-20 section-gradient-dark text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Notre impact en chiffres
          </h2>
          <p className="text-xl text-primary-100 font-medium">
            Ensemble, nous changeons le monde
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`text-center transform transition-all duration-1000 glass-dark p-6 rounded-large hover-lift ${
                  visibleStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Icon size={48} className="mx-auto mb-4" />
                <div className="text-5xl font-black mb-2">
                  {visibleStats ? stat.value : '0'}
                  {stat.suffix}
                </div>
                <div className="text-lg text-primary-100 font-semibold">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

