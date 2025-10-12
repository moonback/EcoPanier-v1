import { useState } from 'react';
import { 
  Activity, 
  User, 
  ShoppingBag, 
  Package, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Download
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  user: string;
  userId: string;
  action: string;
  type: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ip?: string;
}

export const ActivityLogs = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date('2025-10-12T10:30:00'),
      user: 'Jean Dupont',
      userId: 'user-123',
      action: 'Création de lot',
      type: 'success',
      details: 'Nouveau lot "Panier légumes" créé',
      ip: '192.168.1.1'
    },
    {
      id: '2',
      timestamp: new Date('2025-10-12T10:25:00'),
      user: 'Marie Martin',
      userId: 'user-456',
      action: 'Réservation',
      type: 'success',
      details: 'Réservation du lot #789',
      ip: '192.168.1.2'
    },
    {
      id: '3',
      timestamp: new Date('2025-10-12T10:20:00'),
      user: 'Admin',
      userId: 'admin-001',
      action: 'Vérification bénéficiaire',
      type: 'warning',
      details: 'Bénéficiaire BEN-2025-00145 vérifié',
      ip: '192.168.1.100'
    },
    {
      id: '4',
      timestamp: new Date('2025-10-12T10:15:00'),
      user: 'Pierre Durand',
      userId: 'user-789',
      action: 'Échec de connexion',
      type: 'error',
      details: 'Tentative de connexion échouée (mauvais mot de passe)',
      ip: '192.168.1.3'
    },
    {
      id: '5',
      timestamp: new Date('2025-10-12T10:10:00'),
      user: 'Sophie Dubois',
      userId: 'user-101',
      action: 'Modification profil',
      type: 'info',
      details: 'Mise à jour des informations personnelles',
      ip: '192.168.1.4'
    },
    {
      id: '6',
      timestamp: new Date('2025-10-12T10:05:00'),
      user: 'Admin',
      userId: 'admin-001',
      action: 'Paramètres système',
      type: 'warning',
      details: 'Modification des commissions commerçants (15% → 12%)',
      ip: '192.168.1.100'
    },
    {
      id: '7',
      timestamp: new Date('2025-10-12T10:00:00'),
      user: 'Luc Bernard',
      userId: 'user-202',
      action: 'Suppression lot',
      type: 'warning',
      details: 'Lot #456 supprimé',
      ip: '192.168.1.5'
    },
    {
      id: '8',
      timestamp: new Date('2025-10-12T09:55:00'),
      user: 'Emma Petit',
      userId: 'user-303',
      action: 'Don panier suspendu',
      type: 'success',
      details: 'Don de panier suspendu de 5€',
      ip: '192.168.1.6'
    },
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning-600" />;
      case 'error':
        return <XCircle size={20} className="text-accent-600" />;
      default:
        return <Activity size={20} className="text-primary-600" />;
    }
  };

  const getLogBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'error':
        return 'bg-accent-50 border-accent-200';
      default:
        return 'bg-primary-50 border-primary-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const exportLogs = () => {
    console.log('Exporting logs...');
    // Implémentation de l'export
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <Activity size={32} className="text-primary-600" />
            Journal d'Activité
          </h2>
          <p className="text-neutral-600 mt-2 font-medium">
            Historique complet des actions et événements
          </p>
        </div>
        <button onClick={exportLogs} className="btn-secondary rounded-xl">
          <Download size={20} />
          <span>Exporter</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une action ou un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-icon"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-icon"
            >
              <option value="all">Tous les types</option>
              <option value="success">✅ Succès</option>
              <option value="warning">⚠️ Avertissement</option>
              <option value="error">❌ Erreur</option>
              <option value="info">ℹ️ Information</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-6 border-2 border-success-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-success-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">
              {logs.filter(l => l.type === 'success').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Succès</div>
        </div>

        <div className="card p-6 border-2 border-warning-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-warning-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">
              {logs.filter(l => l.type === 'warning').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Avertissements</div>
        </div>

        <div className="card p-6 border-2 border-accent-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-accent-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">
              {logs.filter(l => l.type === 'error').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Erreurs</div>
        </div>

        <div className="card p-6 border-2 border-primary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-primary-600" />
            </div>
            <div className="text-2xl font-black text-neutral-900">
              {logs.filter(l => l.type === 'info').length}
            </div>
          </div>
          <div className="text-sm font-semibold text-neutral-600">Info</div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="space-y-4">
        {filteredLogs.map((log, index) => (
          <div
            key={log.id}
            className={`card p-6 hover-lift border-2 ${getLogBgColor(log.type)}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getLogIcon(log.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">
                      {log.action}
                    </h3>
                    <p className="text-neutral-700 font-medium">
                      {log.details}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-bold text-neutral-900">
                      {formatTime(log.timestamp)}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 font-medium">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{log.user}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>ID: {log.userId}</span>
                  </div>
                  {log.ip && (
                    <div className="flex items-center gap-1">
                      <Settings size={14} />
                      <span>IP: {log.ip}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="card p-12 text-center">
            <Activity size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Aucun log trouvé
            </h3>
            <p className="text-neutral-600 font-medium">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredLogs.length > 0 && (
        <div className="flex justify-center">
          <button className="btn-outline rounded-xl">
            Charger plus de logs
          </button>
        </div>
      )}

      {/* Alert Settings */}
      <div className="card p-8 bg-gradient-to-br from-warning-50 to-accent-50 border-2 border-warning-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={24} className="text-warning-600" />
          Alertes Automatiques
        </h3>
        <p className="text-neutral-700 mb-4 font-medium">
          Configurez les événements qui déclencheront une notification immédiate
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-neutral-700">Échecs de connexion multiples</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-neutral-700">Suppressions de données</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-neutral-700">Modifications système</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-neutral-700">Transactions importantes</span>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

