# Team Tasks

Une plateforme légère type Notion pour le suivi de tâches et dossiers de ton équipe : gratuite, avec connexion par mot de passe pour chaque membre.

**Fonctionnalités :**
- Dossiers (espaces de travail) créables/supprimables
- Tâches par dossier avec statut (À faire / En cours / Terminé), priorité, assigné, échéance
- Vue kanban avec glisser-déposer entre colonnes
- Connexion par e-mail / mot de passe pour toute l'équipe

**Stack :** Next.js (frontend, gratuit sur Vercel) + Supabase (base de données + authentification, gratuit).

---

## Déploiement (environ 15 minutes, gratuit)

### Étape 1 — Créer le projet Supabase (base de données + connexion)

1. Va sur [supabase.com](https://supabase.com) et crée un compte gratuit.
2. Clique sur **New project**, donne-lui un nom (ex: `team-tasks`) et choisis un mot de passe pour la base de données (garde-le de côté).
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche).
4. Ouvre le fichier `supabase/schema.sql` de ce dossier, copie tout son contenu, colle-le dans l'éditeur SQL de Supabase, puis clique sur **Run**. Cela crée toutes les tables et la sécurité nécessaires.
5. Va dans **Project Settings > API**. Note deux valeurs :
   - **Project URL**
   - **anon public key**

   Tu en auras besoin à l'étape 3.

6. (Optionnel mais conseillé pour une petite équipe) Dans **Authentication > Providers > Email**, tu peux désactiver "Confirm email" si tu veux que les comptes de ton équipe soient utilisables immédiatement sans clic de confirmation par e-mail.

### Étape 2 — Mettre le code sur GitHub

1. Crée un compte gratuit sur [github.com](https://github.com) si tu n'en as pas.
2. Crée un nouveau dépôt (repository), par exemple `team-tasks`.
3. Mets tout le contenu de ce dossier dedans (dépose les fichiers directement via l'interface GitHub "Add file > Upload files", ou via `git push` si tu es à l'aise avec).

### Étape 3 — Déployer sur Vercel (hébergement gratuit)

1. Va sur [vercel.com](https://vercel.com) et crée un compte gratuit (tu peux te connecter avec ton compte GitHub).
2. Clique sur **Add New > Project**, choisis le dépôt `team-tasks` que tu viens de créer.
3. Dans la section **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` → l'URL notée à l'étape 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → la clé anon notée à l'étape 1
4. Clique sur **Deploy**. Après 1-2 minutes, Vercel te donne une URL du type `team-tasks.vercel.app`.

### Étape 4 — Inviter ton équipe

1. Ouvre l'URL fournie par Vercel.
2. Chaque membre de l'équipe clique sur **Créer un compte**, entre son nom, e-mail et mot de passe.
3. Tout le monde partage désormais les mêmes dossiers et tâches.

---

## Développement local (optionnel)

```bash
npm install
cp .env.example .env.local   # puis colle ton URL et ta clé Supabase dedans
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

---

## Notes

- Les plans gratuits de Supabase et Vercel suffisent largement pour une équipe de 5 à 15 personnes avec un usage normal.
- Le projet Supabase gratuit se met en pause après 7 jours d'inactivité totale — une simple visite du site le réactive automatiquement.
- Pour ajouter des fonctionnalités (pièces jointes, commentaires, sous-tâches...), le code est dans `app/` (pages) et `components/` (interface). Le schéma de données est dans `supabase/schema.sql`.
