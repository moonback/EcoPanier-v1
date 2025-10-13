# 💬 Système de Messagerie EcoPanier

## Vue d'ensemble

Système de chat en temps réel permettant aux clients de communiquer directement avec les commerçants pour poser des questions, négocier des horaires ou demander des personnalisations avant achat.

---

## 🏗️ Architecture

### Base de données (Supabase)

#### Tables principales

1. **`conversations`**
   - Gère les conversations entre clients et commerçants
   - Une conversation par paire client-commerçant-lot (unique)
   - Compteurs de messages non lus séparés pour client/commerçant
   - Statuts : `active`, `archived`, `blocked`

2. **`messages`**
   - Messages individuels dans une conversation
   - Types : `text`, `quick_question`, `negotiation`, `custom_request`
   - Statut de lecture avec timestamp

3. **`quick_reply_templates`**
   - Templates de réponses rapides pour commerçants
   - Catégories : `general`, `allergens`, `schedule`, `custom`
   - Compteur d'utilisation pour afficher les plus populaires

#### Fonctionnalités SQL

- **Trigger automatique** : Mise à jour de `last_message_at` et des compteurs de non-lus
- **Fonction RPC** : `mark_messages_as_read()` pour marquer les messages comme lus
- **Row Level Security (RLS)** : Protection des données avec policies strictes

### Services (TypeScript)

**`messagingService.ts`** : Service centralisé pour toutes les opérations

- **Conversations** : fetch, create, archive, count unread
- **Messages** : fetch, send, mark as read
- **Templates** : CRUD des réponses rapides
- **Realtime** : Abonnements Supabase pour mises à jour en temps réel

### Hook personnalisé

**`useMessaging`** : Hook React pour gérer l'état de la messagerie

```typescript
const {
  conversations,        // Liste des conversations
  currentMessages,      // Messages de la conversation courante
  unreadCount,          // Nombre total de messages non lus
  loading,              // État de chargement
  sending,              // État d'envoi
  error,                // Erreur éventuelle
  
  loadConversations,    // Charger les conversations
  openConversation,     // Ouvrir une conversation
  startConversation,    // Démarrer une nouvelle conversation
  send,                 // Envoyer un message
  markAsRead,           // Marquer comme lu
  refreshUnreadCount,   // Rafraîchir le compteur
} = useMessaging();
```

### Composants React

#### 1. **`MessagingPage`**
Page principale avec layout 2 colonnes (liste + chat)
- Responsive : 1 colonne sur mobile avec navigation
- Gestion de l'état local pour conversation courante

#### 2. **`ConversationsList`**
Liste des conversations avec :
- Avatar, nom, dernier message
- Badge de messages non lus
- Indication de la conversation active
- État vide avec message d'aide

#### 3. **`ChatWindow`**
Fenêtre de chat avec :
- Messages alignés (droite = moi, gauche = autre)
- Séparateurs de dates
- Avatars
- Statut de lecture
- Auto-scroll vers le bas
- Types de messages avec badges

#### 4. **`MessageInput`**
Zone de saisie avec :
- Textarea auto-resize (max 120px)
- Envoi avec `Entrée` (Shift+Entrée pour nouvelle ligne)
- Compteur de caractères (max 1000)
- Bouton emoji (placeholder)
- Loading state

#### 5. **`QuickReplies`** ⚡
Réponses rapides pour commerçants :
- Affichage des templates actifs
- Création/suppression de templates
- Compteur d'utilisation
- Catégorisation

#### 6. **`ContactMerchantButton`**
Bouton pour démarrer une conversation :
- Modal avec messages rapides prédéfinis
- Zone de saisie personnalisée
- Sélection du type de message
- Intégration dans les fiches de lots

---

## 📱 Fonctionnalités

### Pour les clients

- ✅ Voir toutes les conversations
- ✅ Démarrer une conversation depuis un lot
- ✅ Envoyer des messages texte
- ✅ Utiliser des messages rapides prédéfinis
- ✅ Voir le statut de lecture
- ✅ Notifications de nouveaux messages (badge)
- ✅ Catégoriser les messages (question, négociation, demande spéciale)

### Pour les commerçants

- ✅ Toutes les fonctionnalités client +
- ✅ Créer des templates de réponses rapides
- ✅ Utiliser les templates pour répondre vite
- ✅ Voir les templates les plus utilisés
- ✅ Organiser les templates par catégorie

### Temps réel (Realtime)

- ✅ Nouveaux messages apparaissent instantanément
- ✅ Mise à jour automatique des conversations
- ✅ Rafraîchissement du compteur de non-lus
- ✅ Pas besoin de rafraîchir la page

---

## 🚀 Utilisation

### 1. Ajouter le bouton dans une fiche de lot

```tsx
import { ContactMerchantButton } from '@/components/shared/messaging';

<ContactMerchantButton
  merchantId={lot.merchant_id}
  merchantName={lot.merchant.business_name}
  lotId={lot.id}
  lotTitle={lot.title}
  variant="primary"
/>
```

### 2. Démarrer une conversation programmatiquement

```tsx
import { useMessaging } from '@/hooks/useMessaging';

const { startConversation } = useMessaging();

const handleContact = async () => {
  const conversationId = await startConversation({
    merchantId: '...',
    lotId: '...',
    initialMessage: 'Bonjour !',
    messageType: 'text',
  });
  
  navigate('/messages', { state: { conversationId } });
};
```

### 3. Afficher le badge de messages non lus

```tsx
import { useMessaging } from '@/hooks/useMessaging';

const { unreadCount } = useMessaging();

{unreadCount > 0 && (
  <span className="badge">{unreadCount}</span>
)}
```

---

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables ont RLS activé avec policies :

- **Conversations** : Seuls les participants peuvent voir/modifier
- **Messages** : Seuls les participants peuvent voir, seul l'expéditeur peut modifier
- **Templates** : Seul le commerçant propriétaire peut voir/modifier

### Validation

- **Longueur** : Messages max 1000 caractères, templates max 500
- **Contenu** : Pas de messages vides (trim)
- **Authentification** : Vérification côté serveur via RLS

---

## 🎯 Points d'amélioration futurs

### Court terme
- [ ] Émojis (sélecteur d'emojis)
- [ ] Pièces jointes (images de produits)
- [ ] Notifications push (via Supabase Realtime ou service externe)
- [ ] Sons de notification

### Moyen terme
- [ ] Messages vocaux
- [ ] Traduction automatique
- [ ] Recherche dans les conversations
- [ ] Archivage automatique des vieilles conversations

### Long terme
- [ ] Chatbot IA pour réponses automatiques simples
- [ ] Analyse de sentiment pour détecter les problèmes
- [ ] Intégration calendrier pour prise de RDV
- [ ] Visioconférence pour cas complexes

---

## 🐛 Dépannage

### Les messages n'apparaissent pas en temps réel

1. Vérifier que Supabase Realtime est activé pour les tables
2. Vérifier les subscriptions dans le hook
3. Vérifier la console pour erreurs WebSocket

### Le compteur de non-lus ne se met pas à jour

1. Vérifier que la fonction `mark_messages_as_read` est bien appelée
2. Vérifier les triggers SQL
3. Rafraîchir manuellement avec `refreshUnreadCount()`

### Erreurs de permissions

1. Vérifier les policies RLS dans Supabase
2. Vérifier que l'utilisateur est authentifié
3. Vérifier que l'utilisateur est bien participant de la conversation

---

## 📚 Ressources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : EcoPanier Team

