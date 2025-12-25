# 🔧 Guide d'installation et dépannage

## ✅ Étapes pour corriger TailwindCSS + DaisyUI

J'ai corrigé la configuration pour utiliser **TailwindCSS v3** (stable) au lieu de v4 qui n'est pas encore compatible avec DaisyUI.

### Ce qui a été modifié :

1. **Désinstallé TailwindCSS v4**

   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss
   ```

2. **Installé TailwindCSS v3**

   ```bash
   npm install -D tailwindcss@^3 postcss autoprefixer
   ```

3. **Mis à jour `postcss.config.mjs`**

   ```js
   const config = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```

4. **Désactivé Turbopack** (incompatibilité avec Tailwind v3)

   - Modifié `package.json` : `"dev": "next dev"` (sans --turbopack)

5. **Simplifié `tailwind.config.ts`**
   ```ts
   daisyui: {
     themes: ["light", "dark"],
     darkTheme: "dark",
   }
   ```

## 🚀 Pour tester maintenant :

1. **Arrêtez le serveur actuel** (Ctrl+C dans le terminal)

2. **Redémarrez le serveur**

   ```bash
   npm run dev
   ```

3. **Visitez la page de test**

   ```
   http://localhost:3000/test-styles
   ```

   ✅ Vous devriez voir :

   - Carrés colorés (rouge, bleu, vert)
   - Boutons DaisyUI avec différentes couleurs
   - Alerts stylisées
   - Inputs et badges

4. **Testez les autres pages**
   - http://localhost:3000 (Page d'accueil)
   - http://localhost:3000/login (Connexion)
   - http://localhost:3000/register (Inscription)

## 🐛 Si les styles ne s'appliquent toujours pas :

### Option 1 : Vider le cache

```bash
# Arrêter le serveur (Ctrl+C)
# Supprimer .next
Remove-Item -Recurse -Force .next
# Redémarrer
npm run dev
```

### Option 2 : Réinstaller les dépendances

```bash
# Supprimer node_modules et package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
# Réinstaller
npm install
npm run dev
```

### Option 3 : Vérifier que globals.css est importé

Le fichier `src/app/layout.tsx` doit contenir :

```tsx
import "./globals.css";
```

## 📝 Fichiers de configuration finaux

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "dark",
  },
};

export default config;
```

### `postcss.config.mjs`

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Vos styles personnalisés... */
```

## ✨ Vérification rapide

Ouvrez les DevTools de votre navigateur (F12) et inspectez un élément. Vous devriez voir des classes Tailwind appliquées comme :

- `bg-base-200`
- `btn btn-primary`
- `card shadow-xl`

Si vous voyez ces classes dans l'inspecteur, TailwindCSS fonctionne ! ✅

