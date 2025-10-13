import { X, Smartphone, Scan, Lock, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export const PickupHelp = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'troubleshoot'>('steps');

  const steps = [
    {
      icon: Smartphone,
      title: 'Client présente QR code',
      description: 'Ouvre le QR code dans l\'application',
      color: 'blue',
    },
    {
      icon: Scan,
      title: 'Scannez le code',
      description: 'Cliquez sur "Scanner" et pointez la caméra',
      color: 'purple',
    },
    {
      icon: Lock,
      title: 'Vérifiez le PIN',
      description: 'Demandez le code PIN à 6 chiffres',
      color: 'orange',
    },
    {
      icon: CheckCircle,
      title: 'Remettez le colis',
      description: 'Validé, donnez le colis au client',
      color: 'green',
    },
  ];

  const troubleshooting = [
    {
      problem: 'QR code ne scanne pas',
      solutions: [
        'Vérifiez l\'autorisation caméra',
        'Améliorez l\'éclairage',
        'Augmentez luminosité écran client',
        'Tenez l\'appareil stable',
      ],
    },
    {
      problem: 'Code PIN incorrect',
      solutions: [
        'Demandez vérification au client',
        'Saisissez bien les 6 chiffres',
        'PIN visible dans l\'app client',
      ],
    },
    {
      problem: 'Réservation déjà utilisée',
      solutions: [
        'Vérifiez avec le client',
        'Contactez le support',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Guide Station de Retrait</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition ${
              activeTab === 'steps'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Étapes
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition ${
              activeTab === 'troubleshoot'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Dépannage
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'steps' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <h4 className="font-semibold text-black text-sm">{step.title}</h4>
                          </div>
                          <p className="text-xs text-gray-600 font-light">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                  <HelpCircle size={16} />
                  Conseils rapides
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 font-light">
                  <li>• Bon éclairage pour scanner</li>
                  <li>• Testez avec le mode démo</li>
                  <li>• Vérifiez l'identité si nécessaire</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              {troubleshooting.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-black mb-3 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {item.problem}
                  </h4>
                  <ul className="space-y-2">
                    {item.solutions.map((solution, sIndex) => (
                      <li key={sIndex} className="text-sm text-gray-700 font-light flex items-start gap-2">
                        <span className="text-black font-bold">→</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-black rounded-xl p-6 text-center text-white">
                <h3 className="text-sm font-bold mb-2">Besoin d'aide ?</h3>
                <p className="text-sm text-white/70 mb-4 font-light">
                  Support technique disponible
                </p>
                <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition font-medium text-sm">
                  Contacter le support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

