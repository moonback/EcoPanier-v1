# 💬 Guide de démarrage rapide - Système de messagerie

## 🚀 Mise en place (5 minutes)

### 1. Exécuter la migration SQL

```bash
# Se connecter à Supabase et exécuter la migration
supabase db push
# OU
# Copier le contenu de supabase/migrations/20250114_add_messaging_system.sql
# et l'exécuter dans l'éditeur SQL de Supabase
```

### 2. Vérifier les tables créées

Dans Supabase Dashboard → Database → Tables, vous devriez voir :
- ✅ `conversations`
- ✅ `messages`
- ✅ `quick_reply_templates`

### 3. Activer Supabase Realtime (optionnel mais recommandé)

Dans Supabase Dashboard → Database → Replication :
- Activer la réplication pour `conversations`
- Activer la réplication pour `messages`

### 4. Démarrer le projet

```bash
npm run dev
```

Accéder à `/messages` pour voir la page de messagerie.

---

## 📖 Utilisation de base

### Ajouter un bouton de contact sur une page

```tsx
import { ContactMerchantButton } from '@/components/shared/messaging';

function MyComponent() {
  return (
    <ContactMerchantButton
      merchantId="uuid-du-commercant"
      merchantName="Nom du commerçant"
      lotId="uuid-du-lot" // Optionnel
      lotTitle="Titre du lot" // Optionnel
      variant="primary" // ou "secondary"
    />
  );
}
```

### Afficher le badge de messages non lus

```tsx
import { useMessaging } from '@/hooks/useMessaging';
import { MessageCircle } from 'lucide-react';

function Header() {
  const { unreadCount } = useMessaging();

  return (
    <button onClick={() => navigate('/messages')}>
      <MessageCircle className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </button>
  );
}
```

### Démarrer une conversation programmatiquement

```tsx
import { useMessaging } from '@/hooks/useMessaging';
import { useNavigate } from 'react-router-dom';

function ContactForm() {
  const { startConversation } = useMessaging();
  const navigate = useNavigate();

  const handleContact = async () => {
    try {
      const conversationId = await startConversation({
        merchantId: 'merchant-uuid',
        lotId: 'lot-uuid', // Optionnel
        initialMessage: 'Bonjour, j\'ai une question...',
        messageType: 'quick_question', // Optionnel
      });

      navigate('/messages', { state: { conversationId } });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <button onClick={handleContact}>
      Contacter le commerçant
    </button>
  );
}
```

---

## 🎨 Personnalisation

### Modifier les messages rapides prédéfinis

Éditer `ContactMerchantButton.tsx` :

```tsx
const quickMessages = [
  { type: 'quick_question', text: 'Votre question personnalisée' },
  { type: 'negotiation', text: 'Votre demande de négociation' },
  // Ajouter d'autres...
];
```

### Changer les catégories de templates

Éditer `messaging.types.ts` :

```tsx
export const QUICK_REPLY_CATEGORIES: Record<QuickReplyCategory, string> = {
  general: 'Votre catégorie',
  allergens: 'Votre catégorie',
  // Ajouter d'autres...
};
```

---

## 🔧 Configuration avancée

### Activer les notifications push (futur)

```tsx
// Dans useMessaging.ts, ajouter :
useEffect(() => {
  if (unreadCount > 0 && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(`${unreadCount} nouveau(x) message(s)`);
    }
  }
}, [unreadCount]);
```

### Personnaliser le style

Les composants utilisent Tailwind CSS. Modifiez les classes directement dans les composants ou créez vos propres variantes.

---

## 🐛 Dépannage rapide

### Problème : "Cannot find module '@/components/shared/messaging'"

**Solution** : Vérifiez que `vite.config.ts` et `tsconfig.app.json` ont bien la configuration des alias :

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

// tsconfig.app.json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

### Problème : Les messages n'apparaissent pas en temps réel

**Solution** :
1. Vérifier que Supabase Realtime est activé
2. Ouvrir la console et chercher des erreurs WebSocket
3. Vérifier les permissions RLS dans Supabase

### Problème : Erreur "User not authenticated"

**Solution** : Vérifier que l'utilisateur est bien connecté avec `useAuthStore`.

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Migration SQL exécutée sur la base de production
- [ ] Supabase Realtime activé
- [ ] RLS policies testées
- [ ] Tests manuels effectués (envoi de messages, notifications, etc.)
- [ ] Variables d'environnement configurées
- [ ] Logs de débogage retirés

---

## 📚 Ressources

- **Documentation complète** : `src/components/shared/messaging/README.md`
- **Architecture détaillée** : `ARCHITECTURE.md`
- **Schéma de base de données** : `DB_SCHEMA.md`

---

## 💡 Exemple d'intégration complète

Voir `LotDetailsModal.tsx` pour un exemple d'intégration dans un composant existant.

---

**Questions ?** Consultez le README complet dans `src/components/shared/messaging/README.md` ou contactez l'équipe EcoPanier.

**Version** : 1.0.0  
**Date** : Janvier 2025

