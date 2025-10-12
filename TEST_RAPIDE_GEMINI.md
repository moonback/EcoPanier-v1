# 🧪 Test Rapide - Analyse IA Gemini

## ⚡ Tester en 5 minutes

### Étape 1 : Obtenir une clé API Gemini (2 minutes)

1. Ouvrir https://ai.google.dev/ dans votre navigateur
2. Cliquer sur **"Get API Key"**
3. Se connecter avec votre compte Google
4. Cliquer sur **"Create API Key"**
5. Copier la clé générée

### Étape 2 : Configurer le projet (30 secondes)

1. Créer un fichier `.env` à la racine du projet :

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Ou manuellement : créer le fichier .env
```

2. Ouvrir `.env` et ajouter :

```env
VITE_GEMINI_API_KEY=VOTRE_CLE_ICI
```

**Remplacer `VOTRE_CLE_ICI` par la clé copiée à l'étape 1**

### Étape 3 : Redémarrer le serveur (30 secondes)

```bash
# Arrêter le serveur si actif (Ctrl+C)
# Puis relancer :
npm run dev
```

### Étape 4 : Tester la fonctionnalité (2 minutes)

1. **Ouvrir l'application** : http://localhost:5173

2. **Se connecter en tant que Commerçant**
   - Si vous n'avez pas de compte commerçant, créez-en un
   - Rôle : Commerçant

3. **Aller dans "Gestion des Lots"**

4. **Cliquer sur "Nouveau Lot"**

5. **Vérifier que la section IA est visible** :
   ```
   ╔═══════════════════════════════════╗
   ║ ✨ 🤖 Analyse Intelligente par IA ║
   ║                                   ║
   ║ [📸 Analyser une image]           ║
   ╚═══════════════════════════════════╝
   ```

6. **Préparer une photo de test**
   - Option A : Chercher "baguette pain" sur Google Images
   - Option B : Prendre une photo d'un produit chez vous
   - Option C : Utiliser une des images fournies ci-dessous

7. **Cliquer sur "Analyser une image avec l'IA"**

8. **Sélectionner la photo**

9. **Attendre 2-5 secondes** ⏳

10. **✅ Vérifier que les champs sont pré-remplis !**

---

## 📸 Photos de test recommandées

### Test 1 : Baguette
Chercher "baguette tradition" sur Google Images et télécharger une photo claire

**Résultat attendu** :
- Titre : "Baguettes tradition" ou similaire
- Catégorie : Boulangerie
- Prix original : ~1-2€
- Prix réduit : ~0.50€
- Chaîne du froid : Non
- Urgence : Probablement Oui

### Test 2 : Tomates
Chercher "tomates fraîches" sur Google Images

**Résultat attendu** :
- Titre : "Tomates fraîches" ou "Tomates bio"
- Catégorie : Fruits & Légumes
- Prix original : ~3-5€
- Chaîne du froid : Non
- Urgence : Variable

### Test 3 : Poulet rôti
Chercher "poulet rôti" sur Google Images

**Résultat attendu** :
- Titre : "Poulet rôti"
- Catégorie : Viandes & Poissons
- Prix original : ~8-10€
- Chaîne du froid : **OUI** ✅
- Urgence : Variable

---

## ✅ Checklist de validation

### Interface
- [ ] Section IA visible en haut du formulaire
- [ ] Design avec dégradé purple/blue
- [ ] Icône Sparkles (✨) présente
- [ ] Bouton "Analyser une image avec l'IA" visible

### Fonctionnalité
- [ ] Clic sur le bouton ouvre sélecteur de fichier
- [ ] Spinner s'affiche pendant analyse
- [ ] Texte "Analyse en cours..." visible
- [ ] Analyse prend 2-5 secondes

### Résultat
- [ ] Alert "✅ Image analysée avec succès !" s'affiche
- [ ] Score de confiance affiché (ex: "85%")
- [ ] Champ "Titre" pré-rempli
- [ ] Champ "Description" pré-rempli
- [ ] Champ "Catégorie" pré-sélectionné
- [ ] Champ "Prix original" pré-rempli
- [ ] Champ "Prix réduit" pré-rempli
- [ ] Champ "Quantité" pré-rempli
- [ ] Checkbox "Chaîne du froid" cochée si applicable
- [ ] Checkbox "Urgence" cochée si applicable
- [ ] Image uploadée visible dans le formulaire

### Qualité
- [ ] Score de confiance > 70%
- [ ] Catégorie correcte
- [ ] Prix cohérents (réduit < original)
- [ ] Description pertinente

---

## 🐛 Si ça ne marche pas

### Erreur : "⚠️ Clé API non configurée"
**Cause** : La variable d'environnement n'est pas chargée

**Solution** :
1. Vérifier que le fichier `.env` existe à la racine
2. Vérifier que la clé commence bien par `VITE_GEMINI_API_KEY=`
3. **Redémarrer le serveur** (important !)
   ```bash
   Ctrl+C
   npm run dev
   ```

### Erreur : "❌ Impossible d'analyser l'image"
**Causes possibles** :
- Clé API invalide ou expirée
- Pas de connexion internet
- Quota dépassé (60/min ou 1500/jour)

**Solutions** :
1. Vérifier la clé sur https://ai.google.dev/
2. Vérifier la connexion internet
3. Attendre quelques minutes si quota dépassé
4. Regarder la console navigateur (F12) pour plus de détails

### La section IA n'apparaît pas
**Causes possibles** :
- Vous êtes en mode "Modifier" (elle apparaît seulement en création)
- Cache navigateur

**Solutions** :
1. Fermer le modal et recliquer sur "Nouveau Lot"
2. Rafraîchir la page (F5)
3. Vider le cache (Ctrl+Shift+R)

### Résultats incohérents
**Cause** : Photo floue ou ambiguë

**Solution** :
- Essayer avec une photo plus claire
- Prendre photo avec bon éclairage
- Cadrer uniquement le produit

---

## 📊 Exemples de résultats réels

### Exemple 1 : Excellent (confiance 92%)
```
Photo : Baguette tradition claire, bien cadrée
Titre : "Baguettes tradition fraîches"
Description : "Baguettes fraîches de fin de journée..."
Catégorie : Boulangerie ✅
Prix original : 1.20€
Prix réduit : 0.50€
Quantité : 6
Chaîne du froid : Non ✅
Urgence : Oui ✅
```

### Exemple 2 : Bon (confiance 78%)
```
Photo : Tomates dans cagette
Titre : "Tomates bio de saison"
Description : "Tomates locales cultivées..."
Catégorie : Fruits & Légumes ✅
Prix original : 5.00€
Prix réduit : 2.50€
Quantité : 1
Chaîne du froid : Non ✅
Urgence : Oui
```

### Exemple 3 : Moyen (confiance 65%)
```
Photo : Produit emballé avec peu de détails visibles
Titre : "Produit alimentaire emballé"
Description : "Produit à consommer rapidement"
Catégorie : Autres (par défaut)
Prix original : 5.00€
Prix réduit : 2.50€
Quantité : 1
Chaîne du froid : Non
Urgence : Non

→ NÉCESSITE VÉRIFICATION ET AJUSTEMENT
```

---

## 💡 Conseils pour de meilleurs résultats

### Photos qui donnent d'excellents résultats (90%+)
- ✅ Produits clairement identifiables (pain, fruits, légumes)
- ✅ Packaging avec étiquette visible
- ✅ Éclairage naturel
- ✅ Fond neutre
- ✅ Distance appropriée

### Photos qui donnent des résultats moyens (60-80%)
- ⚠️ Produits emballés sans étiquette
- ⚠️ Plusieurs produits similaires
- ⚠️ Éclairage artificiel fort
- ⚠️ Angle inhabituel

### Photos qui donnent de mauvais résultats (<60%)
- ❌ Photos floues
- ❌ Produits non alimentaires
- ❌ Mélange de produits différents
- ❌ Contre-jour
- ❌ Trop loin ou trop près

---

## 🎯 Test avancé (optionnel)

### Tester différents types de produits

1. **Produits frais** (chaîne du froid)
   - Viandes, poissons
   - Produits laitiers
   - Plats préparés frais
   → Vérifier que "Chaîne du froid" est bien coché

2. **Produits secs**
   - Pain, viennoiseries
   - Fruits, légumes
   - Conserves
   → Vérifier que "Chaîne du froid" n'est PAS coché

3. **Produits urgents**
   - Pain de la veille
   - Fruits très mûrs
   - DLC proche (si visible)
   → Vérifier que "Urgence" est coché

---

## 📝 Notes pour le rapport de test

```
Date du test : ______________
Version : 1.1.0

✅ Section IA visible : OUI / NON
✅ Analyse fonctionnelle : OUI / NON
✅ Temps d'analyse : _____ secondes
✅ Score de confiance : _____%
✅ Résultat satisfaisant : OUI / NON

Produit testé : _______________________
Catégorie détectée : __________________
Catégorie attendue : __________________
Correspondance : OUI / NON

Commentaires :
_______________________________________
_______________________________________
_______________________________________
```

---

## 🎉 Félicitations !

Si tous les tests passent, la fonctionnalité est **opérationnelle** ! 

### Prochaines étapes
1. Tester avec plusieurs types de produits
2. Former les commerçants
3. Collecter le feedback
4. Ajuster selon les besoins

---

## 🆘 Besoin d'aide ?

### Documentation
- **Guide utilisateur** : `GUIDE_ANALYSE_IA.md`
- **Setup technique** : `GEMINI_SETUP.md`
- **Résumé implémentation** : `IMPLEMENTATION_GEMINI_RESUME.md`

### Debug
1. Ouvrir la console (F12)
2. Regarder les erreurs en rouge
3. Prendre une capture d'écran
4. Consulter la section "Dépannage" dans GEMINI_SETUP.md

---

**Bon test ! 🚀🤖**

