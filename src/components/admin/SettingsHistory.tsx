import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { History, User, Clock, RefreshCw, Filter } from 'lucide-react';

interface SettingChange {
  id: string;
  setting_key: string;
  old_value: any;
  new_value: any;
  changed_at: string;
  changed_by_profile: {
    full_name: string;
    role: string;
  };
  ip_address?: string;
}

export const SettingsHistory = () => {
  const [changes, setChanges] = useState<SettingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings_history')
        .select(`
          *,
          changed_by_profile:profiles!changed_by(full_name, role)
        `)
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setChanges(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatKey = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') return value ? 'Activé' : 'Désactivé';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredChanges = filter === 'all' 
    ? changes 
    : changes.filter(c => c.setting_key.includes(filter));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <History size={32} className="text-secondary-600" />
            Historique des Modifications
          </h2>
          <p className="text-neutral-600 mt-2 font-medium">
            Traçabilité complète des changements de paramètres
          </p>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="btn-outline rounded-xl"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-neutral-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="all">Tous les paramètres</option>
            <option value="platform">Paramètres généraux</option>
            <option value="lot">Paramètres des lots</option>
            <option value="commission">Commissions</option>
            <option value="beneficiary">Bénéficiaires</option>
            <option value="notification">Notifications</option>
            <option value="security">Sécurité</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-6 border-2 border-primary-200">
          <div className="text-3xl font-black text-neutral-900 mb-1">
            {changes.length}
          </div>
          <div className="text-sm font-semibold text-neutral-600">
            Total modifications
          </div>
        </div>
        <div className="card p-6 border-2 border-success-200">
          <div className="text-3xl font-black text-neutral-900 mb-1">
            {new Set(changes.map(c => c.changed_by_profile?.full_name)).size}
          </div>
          <div className="text-sm font-semibold text-neutral-600">
            Administrateurs actifs
          </div>
        </div>
        <div className="card p-6 border-2 border-secondary-200">
          <div className="text-3xl font-black text-neutral-900 mb-1">
            {new Set(changes.map(c => c.setting_key)).size}
          </div>
          <div className="text-sm font-semibold text-neutral-600">
            Paramètres modifiés
          </div>
        </div>
        <div className="card p-6 border-2 border-warning-200">
          <div className="text-3xl font-black text-neutral-900 mb-1">
            {changes.filter(c => {
              const date = new Date(c.changed_at);
              const today = new Date();
              return date.toDateString() === today.toDateString();
            }).length}
          </div>
          <div className="text-sm font-semibold text-neutral-600">
            Aujourd'hui
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {filteredChanges.length === 0 ? (
          <div className="card p-12 text-center">
            <History size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Aucune modification trouvée
            </h3>
            <p className="text-neutral-600 font-medium">
              L'historique des modifications apparaîtra ici
            </p>
          </div>
        ) : (
          filteredChanges.map((change, index) => (
            <div
              key={change.id}
              className="card p-6 hover-lift"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <History size={24} className="text-primary-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">
                        {formatKey(change.setting_key)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-neutral-600 font-medium">Ancienne valeur:</span>
                        <code className="px-2 py-1 bg-accent-100 text-accent-700 rounded font-mono text-xs font-semibold">
                          {formatValue(change.old_value)}
                        </code>
                        <span className="text-neutral-400">→</span>
                        <span className="text-neutral-600 font-medium">Nouvelle valeur:</span>
                        <code className="px-2 py-1 bg-success-100 text-success-700 rounded font-mono text-xs font-semibold">
                          {formatValue(change.new_value)}
                        </code>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-neutral-900">
                        {new Date(change.changed_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="text-xs text-neutral-600 font-medium">
                        {new Date(change.changed_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 font-medium">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{change.changed_by_profile?.full_name || 'Inconnu'}</span>
                    </div>
                    <span className="badge badge-primary text-xs">
                      {change.changed_by_profile?.role || 'admin'}
                    </span>
                    {change.ip_address && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock size={12} />
                        <span>IP: {change.ip_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredChanges.length >= 50 && (
        <div className="card p-4 text-center bg-neutral-50">
          <p className="text-sm text-neutral-600 font-medium">
            Affichage des 50 dernières modifications. 
            <button className="text-primary-600 font-semibold ml-2 hover:underline">
              Charger plus
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

