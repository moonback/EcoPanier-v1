// Imports externes
import { useState, useEffect } from 'react';
import { Users, LogOut, User, Shield, Settings, TrendingUp, Activity, History, FileText, ChevronLeft, ChevronRight, Home, Menu, X, MapPin, Package, Gift, Search, Bell, Zap, Moon, Sun, BarChart3, MessageSquare, HelpCircle, Wallet } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { AdminStats } from './AdminStats';
import { UserManagement } from './UserManagement';
import { ProfilePage } from '../shared/ProfilePage';
import { PlatformSettings } from './PlatformSettings';
import { SettingsHistory } from './SettingsHistory';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { ActivityLogs } from './ActivityLogs';
import { ReportsGenerator } from './ReportsGenerator';
import { GeocodeMerchants } from './GeocodeMerchants';
import { LotModeration } from './LotModeration';
import { ExpiredLotsManager } from './ExpiredLotsManager';
import { WalletManagement } from './WalletManagement';

// Type pour les onglets
type TabId = 'stats' | 'users' | 'lots' | 'expired-lots' | 'analytics' | 'logs' | 'reports' | 'settings' | 'history' | 'profile' | 'geocode' | 'wallets';

/**
 * Dashboard principal pour les administrateurs
 * Interface complète de gestion avec menu latéral et navigation par sections
 */
export const AdminDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    lots: any[];
    reservations: any[];
  }>({ users: [], lots: [], reservations: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Hooks (stores, contexts, router)
  const { profile, signOut } = useAuthStore();

  // Effets
  useEffect(() => {
    // Charger la préférence de mode sombre depuis localStorage
    const savedDarkMode = localStorage.getItem('admin_dark_mode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Sauvegarder la préférence de mode sombre
    localStorage.setItem('admin_dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Effet de recherche avec debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], lots: [], reservations: [] });
      return;
    }

    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fermer les panels au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Fermer notifications si clic extérieur
      if (showNotifications && !target.closest('.notifications-panel') && !target.closest('[aria-label="Notifications"]')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Fonction de recherche globale
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchTerm = query.toLowerCase();

      // Recherche d'utilisateurs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone, beneficiary_id, business_name, created_at')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,beneficiary_id.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`)
        .limit(5);

      if (usersError) throw usersError;

      // Recherche de lots
      const { data: lots, error: lotsError } = await supabase
        .from('lots')
        .select(`
          id,
          title,
          description,
          category,
          status,
          discounted_price,
          quantity_total,
          created_at,
          profiles!merchant_id(full_name, business_name)
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .limit(5);

      if (lotsError) throw lotsError;

      // Recherche de réservations (simplifié pour éviter les erreurs RLS)
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('id, pickup_pin, status, total_price, created_at, customer_id, lot_id')
        .ilike('pickup_pin', `%${searchTerm}%`)
        .limit(5);

      if (reservationsError) {
        console.warn('Erreur réservations (ignorée):', reservationsError);
      }

      setSearchResults({
        users: users || [],
        lots: lots || [],
        reservations: reservations || []
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults({ users: [], lots: [], reservations: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'stats', label: 'Tableau de bord', icon: Home, color: 'primary', emoji: '🏠' },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { id: 'users', label: 'Utilisateurs', icon: Users, color: 'secondary', emoji: '👥' },
        { id: 'wallets', label: 'Portefeuilles', icon: Wallet, color: 'primary', emoji: '💰' },
        { id: 'lots', label: 'Modération Lots', icon: Package, color: 'warning', emoji: '📦' },
        { id: 'expired-lots', label: 'Lots Expirés', icon: Gift, color: 'success', emoji: '🎁' },
        { id: 'geocode', label: 'Géocodage', icon: MapPin, color: 'primary', emoji: '🗺️' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'success', emoji: '📊' },
        { id: 'reports', label: 'Rapports', icon: FileText, color: 'warning', emoji: '📄' },
        { id: 'logs', label: 'Logs d\'activité', icon: Activity, color: 'primary', emoji: '📝' },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'settings', label: 'Paramètres', icon: Settings, color: 'secondary', emoji: '⚙️' },
        { id: 'history', label: 'Historique', icon: History, color: 'neutral', emoji: '🕒' },
      ]
    },
    {
      title: 'Compte',
      items: [
        { id: 'profile', label: 'Mon Profil', icon: User, color: 'accent', emoji: '👤' },
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string; gradient: string }> = {
      primary: { bg: 'bg-primary-50', text: 'text-primary-700', hover: 'hover:bg-primary-100', gradient: 'from-primary-500 to-primary-600' },
      secondary: { bg: 'bg-secondary-50', text: 'text-secondary-700', hover: 'hover:bg-secondary-100', gradient: 'from-secondary-500 to-secondary-600' },
      accent: { bg: 'bg-accent-50', text: 'text-accent-700', hover: 'hover:bg-accent-100', gradient: 'from-accent-500 to-accent-600' },
      success: { bg: 'bg-success-50', text: 'text-success-700', hover: 'hover:bg-success-100', gradient: 'from-success-500 to-success-600' },
      warning: { bg: 'bg-warning-50', text: 'text-warning-700', hover: 'hover:bg-warning-100', gradient: 'from-warning-500 to-warning-600' },
      neutral: { bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100', gradient: 'from-gray-500 to-gray-600' },
    };
    return colorMap[color] || colorMap.primary;
  };

  // Handlers
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false); // Fermer le menu mobile après sélection
  };

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay pour mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside className={`
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        bg-white border-r-2 border-gray-200 shadow-xl transition-all duration-300 flex flex-col
        fixed lg:sticky top-0 h-screen z-50
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Sidebar */}
        <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-white to-accent-50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield size={22} strokeWidth={2} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Admin</span>
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">{profile?.full_name}</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <Shield size={22} strokeWidth={2} className="text-white" />
              </div>
            )}
            {/* Bouton fermer sur mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 lg:hidden bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-all ml-auto"
              aria-label="Fermer le menu"
            >
              <X size={16} className="text-neutral-600" />
            </button>
            {/* Bouton collapse sur desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-lg items-center justify-center transition-all ml-auto"
              title={sidebarCollapsed ? 'Étendre' : 'Réduire'}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} className="text-neutral-600" />
              ) : (
                <ChevronLeft size={16} className="text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const colors = getColorClasses(item.color);
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as TabId)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all group relative ${
                        isActive
                          ? `${colors.bg} ${colors.text} shadow-md border-2 border-${item.color}-200`
                          : `text-gray-600 ${colors.hover} border-2 border-transparent`
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      {isActive && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b ${colors.gradient} rounded-r-full shadow-lg`}></div>
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isActive ? `bg-gradient-to-br ${colors.gradient} scale-110 shadow-md` : 'bg-gray-100 group-hover:scale-105'
                      }`}>
                        <Icon size={20} strokeWidth={2} className={isActive ? 'text-white' : 'text-gray-600'} />
                      </div>
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left text-sm flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <span>{item.label}</span>
                        </span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <div className={`w-2 h-2 bg-gradient-to-br ${colors.gradient} rounded-full animate-pulse shadow-sm`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t-2 border-gray-100 bg-gradient-to-r from-white to-accent-50">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-700 hover:bg-accent-100 hover:text-accent-700 transition-all group border-2 border-transparent hover:border-accent-200"
            title={sidebarCollapsed ? 'Déconnexion' : ''}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-accent-500 group-hover:to-accent-600">
              <LogOut size={20} strokeWidth={2} className="group-hover:text-white transition-colors" />
            </div>
            {!sidebarCollapsed && (
              <span className="flex-1 text-left text-sm flex items-center gap-2">
                <span>🚪</span>
                <span>Déconnexion</span>
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - Améliorée */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
            {/* Bouton menu burger sur mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-xl flex items-center justify-center transition-all flex-shrink-0 border border-primary-200 hover:shadow-md"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} strokeWidth={2.5} className="text-primary-700" />
            </button>

            {/* Titre de section */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-black text-gray-900 tracking-tight truncate flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{menuSections.flatMap(s => s.items).find(i => i.id === activeTab)?.emoji}</span>
                <span>{menuSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Tableau de bord'}</span>
              </h1>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Bouton recherche */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="hidden sm:flex w-10 h-10 items-center justify-center bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-xl transition-all border border-gray-200 hover:border-primary-300 hover:shadow-md group"
                title="Recherche globale"
              >
                <Search size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Bouton notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-warning-50 text-gray-600 hover:text-warning-600 rounded-xl transition-all border border-gray-200 hover:border-warning-300 hover:shadow-md group"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Bouton mode sombre */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="hidden md:flex w-10 h-10 items-center justify-center bg-gray-50 hover:bg-secondary-50 text-gray-600 hover:text-secondary-600 rounded-xl transition-all border border-gray-200 hover:border-secondary-300 hover:shadow-md group"
                title={darkMode ? 'Mode clair' : 'Mode sombre'}
              >
                {darkMode ? (
                  <Sun size={18} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Moon size={18} strokeWidth={2} className="group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Quick Stats Desktop */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-success-50 to-emerald-50 rounded-xl border border-success-200">
                <div className="w-2 h-2 bg-gradient-to-br from-success-500 to-success-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-success-700">Système actif</span>
              </div>

              {/* Bouton déconnexion mobile */}
              <button
                onClick={signOut}
                className="lg:hidden w-10 h-10 bg-accent-50 hover:bg-accent-100 rounded-xl flex items-center justify-center transition-all flex-shrink-0 border border-accent-200 hover:shadow-md group"
                aria-label="Se déconnecter"
              >
                <LogOut size={18} strokeWidth={2} className="text-accent-600 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Barre de recherche globale avec résultats */}
          {showSearch && (
            <div className="px-3 sm:px-6 pb-3 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Rechercher utilisateurs, lots, réservations..."
                  className="w-full pl-12 pr-12 py-3 bg-white border-2 border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all shadow-sm"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults({ users: [], lots: [], reservations: [] });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <X size={18} />
                </button>

                {/* Résultats de recherche */}
                {searchQuery.trim() && (searchResults.users.length > 0 || searchResults.lots.length > 0 || searchResults.reservations.length > 0) && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden max-h-96 overflow-y-auto z-50">
                    {/* Utilisateurs */}
                    {searchResults.users.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Users size={14} className="text-primary-600" />
                            Utilisateurs ({searchResults.users.length})
                          </h4>
                        </div>
                        {searchResults.users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setActiveTab('users');
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              user.role === 'customer' ? 'bg-primary-500' :
                              user.role === 'merchant' ? 'bg-secondary-500' :
                              user.role === 'beneficiary' ? 'bg-accent-500' :
                              user.role === 'collector' ? 'bg-success-500' : 'bg-gray-500'
                            }`}>
                              {user.role === 'customer' ? '🛒' :
                               user.role === 'merchant' ? '🏪' :
                               user.role === 'beneficiary' ? '🤝' :
                               user.role === 'collector' ? '🚴' : '👤'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {user.full_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {user.business_name || user.beneficiary_id || user.phone || user.role}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.role}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lots */}
                    {searchResults.lots.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-gradient-to-r from-success-50 to-emerald-50 border-b border-gray-200">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Package size={14} className="text-success-600" />
                            Lots ({searchResults.lots.length})
                          </h4>
                        </div>
                        {searchResults.lots.map((lot) => (
                          <button
                            key={lot.id}
                            onClick={() => {
                              setActiveTab('lots');
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                          >
                            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-success-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {lot.title}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {lot.profiles?.business_name || 'Commerce'} • {lot.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-success-600">
                                {lot.discounted_price}€
                              </p>
                              <p className="text-xs text-gray-500">
                                {lot.status}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Réservations */}
                    {searchResults.reservations.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gradient-to-r from-warning-50 to-orange-50 border-b border-gray-200">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={14} className="text-warning-600" />
                            Réservations ({searchResults.reservations.length})
                          </h4>
                        </div>
                        {searchResults.reservations.map((reservation) => (
                          <button
                            key={reservation.id}
                            onClick={() => {
                              setActiveTab('analytics');
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                          >
                            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                              <BarChart3 size={20} className="text-warning-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                PIN: {reservation.pickup_pin}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                ID: {reservation.id.substring(0, 8)}... • {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-warning-600">
                                {reservation.total_price.toFixed(2)}€
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {reservation.status}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Aucun résultat */}
                {searchQuery.trim() && !isSearching && searchResults.users.length === 0 && searchResults.lots.length === 0 && searchResults.reservations.length === 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8 text-center z-50">
                    <Search size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-900 mb-1">Aucun résultat trouvé</p>
                    <p className="text-xs text-gray-600">Essayez avec d'autres termes de recherche</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel notifications */}
          {showNotifications && (
            <div className="notifications-panel absolute right-4 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden animate-fade-in z-50">
              <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Bell size={18} className="text-primary-600" />
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={18} className="text-success-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Nouvel utilisateur</p>
                      <p className="text-xs text-gray-600 mt-1">3 nouveaux commerçants inscrits</p>
                      <p className="text-[10px] text-gray-400 mt-1">Il y a 2 heures</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-warning-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Lots à modérer</p>
                      <p className="text-xs text-gray-600 mt-1">5 lots en attente de validation</p>
                      <p className="text-[10px] text-gray-400 mt-1">Il y a 4 heures</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={18} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Rapport mensuel</p>
                      <p className="text-xs text-gray-600 mt-1">Le rapport d'octobre est disponible</p>
                      <p className="text-[10px] text-gray-400 mt-1">Hier</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <button className="w-full text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-12xl mx-auto">
            {activeTab === 'stats' && <AdminStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'wallets' && <WalletManagement />}
            {activeTab === 'lots' && <LotModeration />}
            {activeTab === 'expired-lots' && <ExpiredLotsManager />}
            {activeTab === 'analytics' && <AdvancedAnalytics />}
            {activeTab === 'reports' && <ReportsGenerator />}
            {activeTab === 'logs' && <ActivityLogs />}
            {activeTab === 'settings' && <PlatformSettings />}
            {activeTab === 'history' && <SettingsHistory />}
            {activeTab === 'geocode' && <GeocodeMerchants />}
            {activeTab === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>
    </div>
  );
};
