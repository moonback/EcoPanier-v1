# 🏠 Mode Kiosque Tablette - Accès pour Bénéficiaires Sans Téléphone

**Date** : Janvier 2025  
**Priorité** : 🔴 **P0 - CRITIQUE**  
**Problème** : Exclusion des bénéficiaires SDF ou en grande précarité sans smartphone

---

## 🎯 Contexte et Problématique

### Le Problème Identifié

**Constat critique** : Les bénéficiaires en situation de grande précarité (SDF, personnes hébergées en foyer) n'ont souvent **pas de smartphone** ou d'accès internet personnel.

**Impact actuel** :
- ❌ **Exclusion totale** de ces bénéficiaires du système EcoPanier
- ❌ Contradiction avec la mission solidaire de la plateforme
- ❌ Ceux qui en ont le **plus besoin** ne peuvent **pas y accéder**
- ❌ Dépendance aux travailleurs sociaux pour les réservations

**Population concernée** :
- Personnes sans domicile fixe (SDF)
- Personnes hébergées en foyers d'urgence
- Personnes hébergées en centres d'accueil
- Personnes âgées sans équipement numérique
- Personnes en situation de grande précarité numérique

**Estimation** : 30-50% des bénéficiaires potentiels pourraient être concernés.

---

## 💡 Solution Proposée : Mode Kiosque sur Tablette Partagée

### Concept

**Déploiement de tablettes tactiles** dans des lieux d'accueil :
- 🏠 Foyers d'urgence
- 🏛️ Centres d'hébergement
- 🤝 Associations caritatives (Restos du Cœur, Secours Populaire, etc.)
- 🏢 Maisons de quartier / Centres sociaux
- ⛪ Lieux d'accueil de jour

**Principe** :
1. Le bénéficiaire reçoit une **carte physique avec QR Code** lors de son inscription (par l'association)
2. Il se rend dans un lieu partenaire équipé d'une tablette
3. Il scanne son QR Code personnel sur la tablette
4. Il accède à son espace bénéficiaire et réserve des paniers
5. Il se déconnecte automatiquement après utilisation

---

## 🔧 Architecture Technique

### 1. Carte Physique avec QR Code

#### Format de la carte

```
┌─────────────────────────────────────────┐
│  🌱 EcoPanier - Carte Bénéficiaire      │
│                                         │
│  [      QR CODE (5cm x 5cm)      ]      │
│                                         │
│  ID: 2025-BEN-00123                     │
│  Nom: MARTIN Jean                       │
│                                         │
│  📱 Scannez pour accéder                │
│  aux paniers solidaires                 │
│                                         │
│  ⚠️ Ne pas partager cette carte         │
└─────────────────────────────────────────┘
```

**Dimensions** : Format carte de crédit (85,6mm × 53,98mm)  
**Matériau** : Plastique PVC (durable, résistant)  
**Coût** : ~0,50-1€ par carte  
**Production** : Service d'impression spécialisé (ex: Vistaprint, MOO)

#### Contenu du QR Code

```json
{
  "type": "beneficiary_access_card",
  "beneficiary_id": "uuid-du-beneficiaire",
  "card_number": "2025-BEN-00123",
  "issued_at": "2025-01-15T10:30:00Z",
  "issued_by": "uuid-association-ou-admin",
  "security_token": "hash-securite-unique",
  "version": "1.0"
}
```

**Sécurité** :
- Token de sécurité unique (HMAC-SHA256)
- Expiration possible (renouvellement annuel)
- Révocation possible en cas de perte/vol
- Logging de toutes les utilisations

---

### 2. Mode Kiosque sur Tablette

#### Interface Dédiée

**Route spéciale** : `https://ecopanier.fr/kiosque`

**Caractéristiques** :
- ✅ **Interface simplifiée** (gros boutons, texte agrandi)
- ✅ **Pas de saisie de mot de passe** (uniquement QR code)
- ✅ **Session temporaire** (auto-déconnexion après inactivité)
- ✅ **Pas de données persistantes** (cookies, localStorage limités)
- ✅ **Mode guidé** avec instructions vocales optionnelles
- ✅ **Accessibilité renforcée** (fort contraste, pictogrammes)

#### Composant React : Mode Kiosque

```typescript
// src/components/kiosk/KioskMode.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '@/components/shared/QRScanner';
import { supabase } from '@/lib/supabase';

export function KioskMode() {
  const [isScanning, setIsScanning] = useState(true);
  const [beneficiary, setBeneficiary] = useState(null);
  const [error, setError] = useState('');
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Auto-déconnexion après 2 minutes d'inactivité
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    // Prévenir la sortie du mode plein écran
    document.documentElement.requestFullscreen?.();
    
    // Désactiver le zoom
    document.body.style.touchAction = 'pan-x pan-y';
    
    return () => {
      document.exitFullscreen?.();
    };
  }, []);

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    const timer = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
    
    setInactivityTimer(timer);
  };

  const handleQRCodeScan = async (qrData: string) => {
    try {
      const cardData = JSON.parse(qrData);
      
      // Vérification du format
      if (cardData.type !== 'beneficiary_access_card') {
        throw new Error('QR Code invalide');
      }

      // Vérification de la sécurité
      const { data: isValid, error: validationError } = await supabase.rpc(
        'validate_beneficiary_card',
        {
          p_beneficiary_id: cardData.beneficiary_id,
          p_card_number: cardData.card_number,
          p_security_token: cardData.security_token
        }
      );

      if (validationError || !isValid) {
        throw new Error('Carte invalide ou expirée');
      }

      // Récupérer les infos du bénéficiaire
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', cardData.beneficiary_id)
        .eq('role', 'beneficiary')
        .eq('verified', true)
        .single();

      if (profileError || !profile) {
        throw new Error('Bénéficiaire non trouvé ou compte non vérifié');
      }

      // Vérifier si le compte n'est pas suspendu
      if (profile.suspended) {
        throw new Error('Compte temporairement suspendu');
      }

      // Logger l'accès
      await supabase.from('kiosk_access_log').insert({
        beneficiary_id: profile.id,
        kiosk_location: getKioskLocation(), // À implémenter
        access_method: 'qr_card',
        card_number: cardData.card_number
      });

      // Session temporaire (pas de stockage persistent)
      sessionStorage.setItem('kiosk_session', JSON.stringify({
        beneficiary_id: profile.id,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min max
      }));

      setBeneficiary(profile);
      setIsScanning(false);
      resetInactivityTimer();

    } catch (error) {
      console.error('Erreur scan QR:', error);
      setError(error.message || 'Erreur lors du scan du QR Code');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kiosk_session');
    if (inactivityTimer) clearTimeout(inactivityTimer);
    setBeneficiary(null);
    setIsScanning(true);
    navigate('/kiosque', { replace: true });
  };

  // Écran d'accueil : Scanner QR
  if (isScanning && !beneficiary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-600 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📱</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Bienvenue sur EcoPanier
            </h1>
            <p className="text-2xl text-gray-700 font-medium mb-8">
              Scannez votre carte bénéficiaire pour accéder aux paniers solidaires gratuits
            </p>
          </div>

          <div className="mb-8">
            <QRScanner
              onScan={handleQRCodeScan}
              size={400}
              className="mx-auto"
            />
          </div>

          {error && (
            <div className="p-6 bg-red-100 border-4 border-red-500 rounded-2xl">
              <p className="text-2xl font-bold text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-12 p-6 bg-blue-50 rounded-xl">
            <p className="text-lg text-blue-800">
              <strong>Pas de carte ?</strong><br />
              Rendez-vous auprès d'une association partenaire pour en obtenir une.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Écran connecté : Interface bénéficiaire simplifiée
  if (beneficiary) {
    return (
      <div 
        className="min-h-screen bg-gray-50"
        onClick={resetInactivityTimer}
        onTouchStart={resetInactivityTimer}
      >
        {/* Header avec déconnexion */}
        <header className="bg-white border-b-4 border-primary-500 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">👤</span>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Bonjour {beneficiary.full_name?.split(' ')[0]} !
                </h2>
                <p className="text-xl text-gray-600">ID: {beneficiary.beneficiary_id}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-8 py-4 bg-red-600 text-white rounded-2xl text-2xl font-bold hover:bg-red-700 transition-all shadow-lg"
            >
              🚪 Déconnexion
            </button>
          </div>
        </header>

        {/* Contenu principal : Interface bénéficiaire simplifiée */}
        <main className="max-w-7xl mx-auto p-8">
          <KioskBeneficiaryInterface 
            beneficiary={beneficiary}
            onInactivity={resetInactivityTimer}
          />
        </main>

        {/* Footer avec timer inactivité */}
        <footer className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t-4 border-yellow-500 p-4">
          <p className="text-center text-xl text-yellow-800 font-semibold">
            ⏱️ Déconnexion automatique dans 2 minutes sans activité
          </p>
        </footer>
      </div>
    );
  }

  return null;
}
```

#### Interface Bénéficiaire Simplifiée pour Kiosque

```typescript
// src/components/kiosk/KioskBeneficiaryInterface.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FreeLotsList } from '@/components/beneficiary/FreeLotsList';
import { BeneficiaryReservations } from '@/components/beneficiary/BeneficiaryReservations';

interface KioskBeneficiaryInterfaceProps {
  beneficiary: any;
  onInactivity: () => void;
}

export function KioskBeneficiaryInterface({ beneficiary, onInactivity }: KioskBeneficiaryInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations'>('browse');
  const [dailyCount, setDailyCount] = useState(0);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
    checkDailyLimit();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('platform_settings').select('*').single();
    setSettings(data);
  };

  const checkDailyLimit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('beneficiary_daily_limits')
      .select('reservation_count')
      .eq('beneficiary_id', beneficiary.id)
      .eq('date', today)
      .maybeSingle();
    
    setDailyCount(data?.reservation_count || 0);
  };

  return (
    <div onClick={onInactivity}>
      {/* Barre de quota très visible */}
      <div className="mb-8 p-8 bg-gradient-to-r from-primary-100 to-accent-100 rounded-3xl border-4 border-primary-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-6xl">🎁</span>
            <div>
              <p className="text-2xl font-semibold text-gray-700">Vos paniers aujourd'hui</p>
              <p className="text-6xl font-bold text-primary-700">
                {dailyCount} / {settings?.max_daily_beneficiary_reservations || 2}
              </p>
            </div>
          </div>
          
          {dailyCount < (settings?.max_daily_beneficiary_reservations || 2) && (
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                ✅ {(settings?.max_daily_beneficiary_reservations || 2) - dailyCount} encore disponible(s)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation simplifiée (2 onglets seulement) */}
      <div className="flex gap-6 mb-8">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-8 px-12 rounded-3xl text-3xl font-bold transition-all ${
            activeTab === 'browse'
              ? 'bg-primary-600 text-white shadow-2xl scale-105'
              : 'bg-white text-gray-700 shadow-md hover:shadow-xl'
          }`}
        >
          <span className="text-5xl block mb-2">🎁</span>
          Paniers Gratuits
        </button>
        
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 py-8 px-12 rounded-3xl text-3xl font-bold transition-all ${
            activeTab === 'reservations'
              ? 'bg-primary-600 text-white shadow-2xl scale-105'
              : 'bg-white text-gray-700 shadow-md hover:shadow-xl'
          }`}
        >
          <span className="text-5xl block mb-2">📦</span>
          Mes Réservations
        </button>
      </div>

      {/* Contenu (composants existants adaptés) */}
      <div className="kiosk-content text-2xl">
        {activeTab === 'browse' && (
          <FreeLotsList
            dailyCount={dailyCount}
            onReservationMade={checkDailyLimit}
            kioskMode={true} // Prop pour adapter l'affichage
          />
        )}
        
        {activeTab === 'reservations' && (
          <BeneficiaryReservations
            kioskMode={true} // Prop pour adapter l'affichage
          />
        )}
      </div>
    </div>
  );
}
```

---

### 3. Base de Données : Extensions Nécessaires

#### Nouvelles Tables

```sql
-- Table pour les cartes physiques
CREATE TABLE beneficiary_access_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID REFERENCES profiles(id) NOT NULL,
  card_number VARCHAR(20) UNIQUE NOT NULL, -- Format: YYYY-BEN-XXXXX
  security_token TEXT NOT NULL, -- Hash sécurisé
  qr_code_data TEXT NOT NULL, -- JSON du QR code
  issued_at TIMESTAMP DEFAULT NOW(),
  issued_by UUID REFERENCES profiles(id), -- Admin ou association
  expires_at TIMESTAMP, -- Optionnel : renouvellement annuel
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_cards_beneficiary ON beneficiary_access_cards(beneficiary_id);
CREATE INDEX idx_cards_number ON beneficiary_access_cards(card_number);
CREATE INDEX idx_cards_active ON beneficiary_access_cards(beneficiary_id, revoked) WHERE revoked = FALSE;

-- Table pour les kiosques/tablettes
CREATE TABLE kiosks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name VARCHAR(200) NOT NULL, -- "Foyer d'urgence XYZ"
  location_type VARCHAR(50), -- 'foyer', 'association', 'centre_social'
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  managed_by UUID REFERENCES profiles(id), -- Association responsable
  device_identifier TEXT UNIQUE, -- MAC address ou ID unique
  is_active BOOLEAN DEFAULT TRUE,
  installation_date DATE,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table de logs d'accès kiosque
CREATE TABLE kiosk_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID REFERENCES profiles(id),
  kiosk_id UUID REFERENCES kiosks(id),
  kiosk_location VARCHAR(200), -- Fallback si kiosk_id null
  access_method VARCHAR(50), -- 'qr_card', 'manual_id'
  card_number VARCHAR(20),
  session_duration_seconds INTEGER,
  actions_performed JSONB, -- {reservations: 2, views: 5, etc.}
  accessed_at TIMESTAMP DEFAULT NOW(),
  logged_out_at TIMESTAMP,
  logout_type VARCHAR(50) -- 'manual', 'inactivity', 'timeout'
);

-- Index pour analytics
CREATE INDEX idx_kiosk_log_beneficiary ON kiosk_access_log(beneficiary_id, accessed_at);
CREATE INDEX idx_kiosk_log_kiosk ON kiosk_access_log(kiosk_id, accessed_at);
CREATE INDEX idx_kiosk_log_date ON kiosk_access_log(accessed_at);

-- Fonction de validation de carte
CREATE OR REPLACE FUNCTION validate_beneficiary_card(
  p_beneficiary_id UUID,
  p_card_number VARCHAR,
  p_security_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_card RECORD;
BEGIN
  -- Récupérer la carte
  SELECT * INTO v_card
  FROM beneficiary_access_cards
  WHERE beneficiary_id = p_beneficiary_id
    AND card_number = p_card_number
    AND revoked = FALSE;
  
  -- Vérifier existence
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier expiration (si définie)
  IF v_card.expires_at IS NOT NULL AND v_card.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier token de sécurité
  IF v_card.security_token != p_security_token THEN
    RETURN FALSE;
  END IF;
  
  -- Mettre à jour last_used et usage_count
  UPDATE beneficiary_access_cards
  SET last_used_at = NOW(),
      usage_count = usage_count + 1
  WHERE id = v_card.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 4. Workflow d'Inscription et Émission de Carte

#### Processus d'Inscription pour Bénéficiaire Sans Téléphone

```
1. Le bénéficiaire se présente dans une association partenaire
2. L'association (ou l'admin) crée le compte :
   - Nom, prénom
   - Date de naissance
   - Justificatifs de situation (si requis)
   - Aucune adresse email ou téléphone requis
3. Le système génère automatiquement :
   - Un beneficiary_id (YYYY-BEN-XXXXX)
   - Une carte physique avec QR code
   - Un token de sécurité unique
4. L'association imprime ou commande la carte
5. La carte est remise au bénéficiaire (+ explications d'utilisation)
```

#### Interface Admin/Association : Création de Carte

```typescript
// src/components/admin/CreateBeneficiaryCard.tsx
export function CreateBeneficiaryCard() {
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateCard = async () => {
    setLoading(true);
    try {
      // 1. Générer le token de sécurité
      const securityToken = generateSecurityToken(); // HMAC-SHA256
      
      // 2. Créer le QR code data
      const qrData = {
        type: 'beneficiary_access_card',
        beneficiary_id: beneficiary.id,
        card_number: beneficiary.beneficiary_id,
        issued_at: new Date().toISOString(),
        issued_by: currentAdmin.id,
        security_token: securityToken,
        version: '1.0'
      };
      
      // 3. Insérer dans la DB
      const { data: card, error } = await supabase
        .from('beneficiary_access_cards')
        .insert({
          beneficiary_id: beneficiary.id,
          card_number: beneficiary.beneficiary_id,
          security_token: securityToken,
          qr_code_data: JSON.stringify(qrData),
          issued_by: currentAdmin.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // 4. Générer le PDF de la carte (pour impression)
      const pdfBlob = await generateCardPDF(beneficiary, qrData);
      
      // 5. Télécharger
      downloadFile(pdfBlob, `carte-${beneficiary.beneficiary_id}.pdf`);
      
      alert('Carte générée avec succès ! Imprimez-la et remettez-la au bénéficiaire.');
      
    } catch (error) {
      console.error('Erreur création carte:', error);
      alert('Erreur lors de la création de la carte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Créer une Carte Bénéficiaire</h2>
      
      {/* Sélection du bénéficiaire */}
      <BeneficiarySelector onSelect={setBeneficiary} />
      
      {beneficiary && (
        <div className="mt-6">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p><strong>Nom :</strong> {beneficiary.full_name}</p>
            <p><strong>ID :</strong> {beneficiary.beneficiary_id}</p>
          </div>
          
          <button
            onClick={handleCreateCard}
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300"
          >
            {loading ? 'Génération en cours...' : '🎴 Générer la Carte'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 Déploiement et Logistique

### 1. Équipement Nécessaire

#### Par Kiosque

| Équipement | Spécifications | Prix unitaire | Obligatoire |
|------------|----------------|---------------|-------------|
| **Tablette tactile** | 10-12 pouces, Android/iPad | 200-400 € | ✅ Oui |
| **Support/Borne** | Support fixe anti-vol | 50-150 € | ✅ Oui |
| **Connexion Internet** | WiFi ou 4G (SIM data) | 20-40 €/mois | ✅ Oui |
| **Imprimante badges** | Pour imprimer les cartes | 100-200 € | ⚠️ Optionnel |
| **Webcam** (si nécessaire) | Pour scan QR si pas de caméra tablette | 30-50 € | ⚠️ Si besoin |

**Coût total par kiosque** : ~300-600 € initial + 20-40 €/mois

#### Cartes Physiques

| Quantité | Prix unitaire | Prix total |
|----------|---------------|------------|
| 100 cartes | 0,50-1 € | 50-100 € |
| 500 cartes | 0,40-0,80 € | 200-400 € |
| 1000 cartes | 0,30-0,60 € | 300-600 € |

**Impression** : Services en ligne (Vistaprint, MOO, Printoclock)

---

### 2. Partenariats avec Lieux d'Accueil

#### Types de Partenaires

1. **Foyers d'urgence** (Samu Social, 115, etc.)
   - Hébergement temporaire
   - Accès 24/7
   - Personnel social présent

2. **Centres d'Hébergement et de Réinsertion Sociale (CHRS)**
   - Hébergement moyen/long terme
   - Accompagnement social
   - Accès journée + soirée

3. **Associations caritatives**
   - Restos du Cœur
   - Secours Populaire
   - Croix-Rouge
   - Secours Catholique

4. **Maisons de quartier / Centres sociaux**
   - Accès libre
   - Horaires d'ouverture larges
   - Proximité habitants

5. **Lieux d'accueil de jour**
   - Pas d'hébergement mais services
   - Douches, repas, accompagnement
   - Fréquentation quotidienne

#### Convention Type

```
CONVENTION DE PARTENARIAT
Installation d'un Kiosque Numérique EcoPanier

Entre :
- EcoPanier (plateforme anti-gaspillage solidaire)
- [Nom du Partenaire] (foyer/association)

OBJET : Mise à disposition d'une tablette tactile permettant aux bénéficiaires
sans téléphone d'accéder aux paniers solidaires gratuits.

ENGAGEMENTS ECOPANIER :
- Fourniture de la tablette et du support
- Installation et configuration
- Maintenance à distance
- Support technique
- Renouvellement du matériel si défaillant

ENGAGEMENTS PARTENAIRE :
- Hébergement du kiosque dans un lieu sécurisé
- Connexion Internet WiFi gratuite
- Surveillance du matériel (anti-vol)
- Accompagnement des bénéficiaires (si besoin)
- Information sur le dispositif

DURÉE : 1 an renouvelable tacitement
```

---

### 3. Formation et Accompagnement

#### Formation des Référents

**Durée** : 1 heure  
**Format** : Présentiel ou visio  
**Contenu** :
1. Présentation d'EcoPanier (15 min)
2. Fonctionnement du kiosque (20 min)
3. Inscription des bénéficiaires et création de cartes (15 min)
4. Résolution des problèmes courants (10 min)

#### Support Visuel sur le Kiosque

**Affiche plastifiée à côté de la tablette** :

```
┌─────────────────────────────────────────────────┐
│  🌱 COMMENT UTILISER LE KIOSQUE ECOPANIER ?     │
│                                                 │
│  1️⃣ SCANNEZ VOTRE CARTE                         │
│     Placez votre carte devant la caméra        │
│                                                 │
│  2️⃣ CHOISISSEZ VOS PANIERS                      │
│     Parcourez les paniers disponibles          │
│     Maximum 2 paniers par jour                 │
│                                                 │
│  3️⃣ RÉSERVEZ                                     │
│     Cliquez sur "Réserver gratuitement"        │
│     Notez votre code PIN à 6 chiffres          │
│                                                 │
│  4️⃣ RÉCUPÉREZ                                    │
│     Allez chez le commerçant indiqué          │
│     Donnez votre code PIN                      │
│                                                 │
│  ❓ BESOIN D'AIDE ?                              │
│     Demandez au personnel sur place            │
│                                                 │
│  🚪 N'OUBLIEZ PAS DE VOUS DÉCONNECTER !         │
└─────────────────────────────────────────────────┘
```

---

## 🔒 Sécurité et Confidentialité

### Mesures de Sécurité

1. **Pas de données persistantes sur tablette**
   - Utilisation de `sessionStorage` uniquement
   - Pas de `localStorage` ou cookies permanents
   - Effacement automatique à la déconnexion

2. **Auto-déconnexion**
   - Après 2 minutes d'inactivité
   - Après 10 minutes maximum (même avec activité)
   - Confirmation avant déconnexion automatique

3. **Mode Kiosque verrouillé**
   - Impossible de sortir de l'app EcoPanier
   - Pas d'accès aux paramètres Android/iOS
   - Pas d'accès au navigateur ou autres apps
   - Mode Kiosque Android (ou Guided Access iOS)

4. **Chiffrement des communications**
   - HTTPS uniquement
   - Tokens de session courts (10 min max)
   - Pas de transmission de mot de passe

5. **Logs d'audit**
   - Toutes les connexions sont loggées
   - Détection d'utilisation anormale (ex: 10 connexions/jour)
   - Alertes en cas d'activité suspecte

6. **Protection anti-vol**
   - Support fixe avec câble antivol
   - Localisation GPS de la tablette
   - Blocage à distance si vol détecté

---

## 📊 Analytics et Suivi

### Métriques à Suivre

1. **Utilisation des kiosques**
   - Nombre de connexions/jour/kiosque
   - Durée moyenne des sessions
   - Taux de déconnexion manuelle vs automatique
   - Heures de pic d'utilisation

2. **Adoption par les bénéficiaires**
   - % de bénéficiaires utilisant le kiosque vs smartphone
   - Nombre de bénéficiaires uniques/mois
   - Fréquence d'utilisation par bénéficiaire

3. **Réservations**
   - Nombre de réservations via kiosque vs app
   - Taux de retrait des réservations kiosque
   - Types de produits les plus réservés

4. **Partenaires**
   - Nombre de lieux équipés
   - Utilisation par lieu
   - Satisfaction des partenaires

### Dashboard Admin : Suivi des Kiosques

```typescript
// src/components/admin/KioskManagement.tsx
export function KioskManagement() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchKiosks();
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestion des Kiosques</h1>
      
      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Kiosques Actifs"
          value={stats?.active_kiosks || 0}
          icon="📱"
          color="green"
        />
        <StatCard
          title="Connexions Aujourd'hui"
          value={stats?.connections_today || 0}
          icon="🔑"
          color="blue"
        />
        <StatCard
          title="Bénéficiaires Uniques (30j)"
          value={stats?.unique_users_30d || 0}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Réservations via Kiosque"
          value={stats?.reservations_kiosk || 0}
          icon="🎁"
          color="orange"
        />
      </div>
      
      {/* Liste des kiosques */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Liste des Kiosques</h2>
        
        <table className="w-full">
          <thead>
            <tr className="border-b-2">
              <th className="text-left p-3">Lieu</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Adresse</th>
              <th className="text-left p-3">Connexions (7j)</th>
              <th className="text-left p-3">Dernière activité</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kiosks.map(kiosk => (
              <KioskRow key={kiosk.id} kiosk={kiosk} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 💰 Budget et ROI

### Coûts Initiaux (100 bénéficiaires sans téléphone)

| Poste | Détails | Coût |
|-------|---------|------|
| **Développement Mode Kiosque** | 2 semaines dev | 10-15k € |
| **Équipement (10 kiosques)** | Tablettes + supports | 3-6k € |
| **Cartes physiques (100)** | Impression PVC | 50-100 € |
| **Formation partenaires** | 10 formations x 2h | 1-2k € |
| **Communication** | Affiches, flyers | 500-1k € |
| **TOTAL INITIAL** | | **~15-24k €** |

### Coûts Récurrents (par mois)

| Poste | Détails | Coût/mois |
|-------|---------|-----------|
| **Internet (10 kiosques)** | 20-40€ x 10 | 200-400 € |
| **Maintenance** | Support technique | 500-1k € |
| **Renouvellement cartes** | ~10 cartes/mois | 5-10 € |
| **TOTAL MENSUEL** | | **~700-1,4k €** |

### ROI Social

**Sans kiosques** :
- ❌ 30-50% de bénéficiaires potentiels exclus (les plus précaires)
- ❌ Mission solidaire incomplète
- ❌ Inégalité d'accès numérique

**Avec kiosques** :
- ✅ 100% des bénéficiaires peuvent accéder (avec ou sans téléphone)
- ✅ Inclusion numérique réelle
- ✅ Impact social maximal
- ✅ Différenciation forte vs concurrents

**Estimation** : +30-50 bénéficiaires actifs/mois par kiosque  
**Impact** : +300-500 bénéficiaires actifs avec 10 kiosques

---

## 🚀 Plan de Déploiement

### Phase 1 : MVP (1-2 mois)

**Objectif** : Valider le concept avec 2-3 kiosques pilotes

**Actions** :
1. ✅ Développer le mode kiosque (2 semaines)
2. ✅ Créer système de cartes physiques (1 semaine)
3. ✅ Identifier 2-3 partenaires pilotes (foyers/associations)
4. ✅ Installer et configurer les tablettes
5. ✅ Former les référents
6. ✅ Créer 20-30 cartes pour tests
7. ✅ Tester pendant 1 mois
8. ✅ Recueillir feedbacks

**Budget Phase 1** : ~10-15k €

---

### Phase 2 : Déploiement (2-3 mois)

**Objectif** : Passer à 10 kiosques

**Actions** :
1. ✅ Ajuster le système selon feedbacks pilote
2. ✅ Signer conventions avec 7 nouveaux partenaires
3. ✅ Commander tablettes et supports
4. ✅ Former tous les référents
5. ✅ Créer 100 cartes supplémentaires
6. ✅ Installer les 7 nouveaux kiosques
7. ✅ Communication vers bénéficiaires

**Budget Phase 2** : ~8-12k €

---

### Phase 3 : Scaling (6+ mois)

**Objectif** : 20-30 kiosques dans toute la région

**Actions** :
1. ✅ Campagne de recrutement de partenaires
2. ✅ Automatisation de la gestion (dashboard admin)
3. ✅ Analytics avancés
4. ✅ Support multi-langue si nécessaire
5. ✅ Amélioration continue

---

## 🎯 Recommandations Prioritaires

### À Faire IMMÉDIATEMENT

1. ✅ **Valider le budget** Phase 1 (~10-15k €)
2. ✅ **Identifier 2-3 partenaires pilotes**
   - Contacter Samu Social, Restos du Cœur, etc.
   - Présenter le projet
3. ✅ **Développer le mode kiosque** (priorité P0)
   - En parallèle de l'interface admin (Sprint 1)
4. ✅ **Commander 2-3 tablettes** pour tests

### Timeline Recommandée

```
Semaine 1-2   : Développement mode kiosque
Semaine 2-3   : Identification partenaires pilotes
Semaine 3-4   : Signature conventions + commande matériel
Semaine 5     : Installation + formation
Semaine 6-10  : Phase de test (1 mois)
Semaine 11    : Analyse feedbacks + ajustements
Semaine 12+   : Déploiement élargi
```

---

## 📞 Contacts et Partenaires Potentiels

### Structures Nationales à Contacter

1. **Samu Social** - Hébergement d'urgence
2. **Restos du Cœur** - Distribution alimentaire + aide
3. **Secours Populaire** - Solidarité multi-services
4. **Croix-Rouge** - Aide d'urgence + hébergement
5. **Secours Catholique** - Accompagnement social
6. **Emmaüs** - Hébergement + réinsertion
7. **Armée du Salut** - Accueil de jour + hébergement

### Acteurs Locaux

- Mairies (CCAS - Centres Communaux d'Action Sociale)
- Centres sociaux de quartier
- Associations locales d'aide alimentaire
- Foyers d'urgence municipaux
- Centres d'Hébergement et de Réinsertion Sociale (CHRS)

---

## ✅ Checklist de Déploiement

### Technique
- [ ] Développer composant KioskMode
- [ ] Créer tables DB (cartes, kiosques, logs)
- [ ] Implémenter génération de cartes PDF
- [ ] Tester auto-déconnexion et sécurité
- [ ] Configurer mode kiosque Android/iOS sur tablettes

### Logistique
- [ ] Identifier 2-3 partenaires pilotes
- [ ] Signer conventions
- [ ] Commander tablettes (2-3 unités)
- [ ] Commander supports anti-vol
- [ ] Commander cartes PVC (20-30 unités test)
- [ ] Installer Internet/WiFi si nécessaire

### Formation & Communication
- [ ] Créer support de formation (slides)
- [ ] Former les référents partenaires
- [ ] Créer affiches explicatives
- [ ] Créer flyers pour bénéficiaires

### Suivi
- [ ] Mettre en place analytics
- [ ] Dashboard admin de suivi kiosques
- [ ] Process de support technique
- [ ] Collecte de feedbacks

---

## 📚 Conclusion

Le **mode kiosque sur tablette partagée** est une **solution indispensable** pour garantir l'**inclusion numérique** des bénéficiaires les plus précaires (SDF, sans téléphone).

### Impact attendu

✅ **+30-50%** de bénéficiaires accessibles  
✅ **Inclusion réelle** des personnes en grande précarité  
✅ **Différenciation forte** vs concurrents  
✅ **Mission solidaire complète**

### Budget raisonnable

- **Phase 1 (pilote)** : ~10-15k €
- **Phase 2 (déploiement)** : ~8-12k €
- **Mensuel (10 kiosques)** : ~700-1,4k €

### Priorité

🔴 **P0 - CRITIQUE** : À développer **en parallèle** du Sprint 1 (interface admin)

---

**Prochaine étape** : Valider le budget et identifier les 2-3 premiers partenaires pilotes.

---

*Document préparé pour : Inclusion des bénéficiaires sans téléphone*  
*Statut* : ✅ Prêt à implémenter  
*Date* : Janvier 2025

