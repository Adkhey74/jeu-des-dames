# Configuration de Brevo pour la vérification d'email

## Étapes de configuration

### 1. Installer le package Brevo

```bash
npm install @getbrevo/brevo
```

### 2. Obtenir une clé API Brevo

1. Créez un compte sur [Brevo](https://www.brevo.com/) (anciennement Sendinblue)
2. Allez dans **Settings** > **API Keys**
3. Créez une nouvelle clé API
4. Copiez la clé API

### 3. Configurer les variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Brevo Configuration
BREVO_API_KEY=votre_cle_api_brevo_ici
BREVO_SENDER_EMAIL=noreply@votre-domaine.com

# URL de l'application (pour les liens de vérification)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# En production, remplacez par votre URL réelle :
# NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### 4. Vérifier l'expéditeur d'email

1. Dans Brevo, allez dans **Settings** > **Senders & IP**
2. Ajoutez et vérifiez votre adresse email d'expéditeur
3. Utilisez cette adresse dans `BREVO_SENDER_EMAIL`

### 5. Tester la configuration

1. Inscrivez-vous avec un nouvel email
2. Vérifiez votre boîte mail (et les spams)
3. Cliquez sur le lien de vérification

## Fonctionnalités implémentées

- ✅ Envoi automatique d'email de vérification lors de l'inscription
- ✅ Page de vérification d'email avec token
- ✅ Renvoi d'email de vérification
- ✅ Blocage de connexion si l'email n'est pas vérifié
- ✅ Redirection automatique vers la page de vérification si nécessaire

## Structure des fichiers

- `src/lib/email.ts` - Service d'envoi d'email avec Brevo
- `src/app/api/auth/verify-email/route.ts` - API pour vérifier et renvoyer les emails
- `src/app/verify-email/page.tsx` - Page de vérification d'email
- `src/app/api/auth/register/route.ts` - Modifié pour envoyer l'email automatiquement
- `src/app/api/auth/login/route.ts` - Modifié pour vérifier si l'email est vérifié

## Notes importantes

- Les emails de vérification expirent après 24 heures (gestion à implémenter si nécessaire)
- Le token de vérification est supprimé après vérification réussie
- Si l'envoi d'email échoue lors de l'inscription, l'utilisateur peut toujours demander un renvoi
