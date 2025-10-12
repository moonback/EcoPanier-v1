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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Guide Station de Retrait</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition ${
              activeTab === 'steps'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={16} className="inline mr-2" />
            Étapes
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition ${
              activeTab === 'troubleshoot'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle size={16} className="inline mr-2" />
            Dépannage
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {/* Étapes compactes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const colors = {
                    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-600' },
                    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-600' },
                    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-600' },
                    green: { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-600' },
                  };
                  const colorScheme = colors[step.color as keyof typeof colors];
                  
                  return (
                    <div key={index} className={`${colorScheme.bg} rounded-lg p-3`}>
                      <div className="flex items-start gap-3">
                        <div className={`${colorScheme.icon} rounded-full p-2 flex-shrink-0`}>
                          <Icon size={18} className={colorScheme.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`${colorScheme.badge} text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold`}>
                              {index + 1}
                            </span>
                            <h4 className="font-bold text-gray-800 text-sm">{step.title}</h4>
                          </div>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Conseils rapides */}
              <div className="bg-blue-50 rounded-lg p-3 mt-4">
                <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <HelpCircle size={16} />
                  Conseils rapides
                </h3>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• Bon éclairage pour scanner</li>
                  <li>• Testez avec le mode démo</li>
                  <li>• Vérifiez l'identité si nécessaire</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-3">
              {troubleshooting.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="text-orange-600" />
                    {item.problem}
                  </h4>
                  <ul className="space-y-1.5 pl-6">
                    {item.solutions.map((solution, sIndex) => (
                      <li key={sIndex} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600 font-bold">→</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Support */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center mt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-1">Besoin d'aide ?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Support technique disponible
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition font-medium">
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

