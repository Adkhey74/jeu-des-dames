# 🗄️ Configuration de la Base de Données

## Option 1 : SQLite (Plus simple pour tester)

### Étape 1 : Modifier le fichier Prisma

Éditez `prisma/schema.prisma`, changez la ligne 8 :

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Étape 2 : Créer le fichier .env

Créez un fichier `.env` à la racine du projet :

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt-changez-moi"
```

### Étape 3 : Générer et migrer

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## Option 2 : PostgreSQL (Recommandé pour production)

### Étape 1 : Installer PostgreSQL

- Téléchargez PostgreSQL : https://www.postgresql.org/download/
- Ou utilisez Docker :
  ```bash
  docker run --name postgres-jeu-dames -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
  ```

### Étape 2 : Créer la base de données

Ouvrez pgAdmin ou psql et créez la base :

```sql
CREATE DATABASE jeu_dames;
```

### Étape 3 : Créer le fichier .env

Créez un fichier `.env` à la racine :

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/jeu_dames?schema=public"
JWT_SECRET="votre-secret-jwt-changez-moi"
```

### Étape 4 : Générer et migrer

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## ✅ Vérification

Après la migration, vous devriez voir :

```
✔ Generated Prisma Client
✔ The migration has been created
✔ Database schema in sync
```

## 🧪 Tester Prisma Studio

Visualisez votre base de données :

```bash
npx prisma studio
```

Ouvre http://localhost:5555

---

## 🚀 Prochaines étapes

Une fois la base de données configurée :

1. ✅ Redémarrez le serveur Next.js
2. ✅ Testez l'inscription : http://localhost:3000/register
3. ✅ Testez la connexion : http://localhost:3000/login

## ⚠️ Note importante

Le fichier `.env` est ignoré par Git pour la sécurité.
Utilisez `.env.example` comme référence pour les autres développeurs.



