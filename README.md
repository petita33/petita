This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Espace d'administration

`/admin` permet de publier les annonces (titre, description, prix facultatif,
photos) et de choisir la page sur laquelle elles apparaissent :

| Emplacement          | Page publique            |
| -------------------- | ------------------------ |
| Luminaires en vente  | `/luminaires/en-vente`   |
| Luminaires vendus    | `/luminaires/vendus`     |
| Meubles              | `/meubles` *(à créer)*   |

### Mise en service

1. Sur Vercel, onglet **Storage** du projet → créer un store **Blob** et le
   relier au projet. `BLOB_READ_WRITE_TOKEN` est alors injecté automatiquement.
2. Ajouter deux variables d'environnement au projet Vercel :
   - `ADMIN_PASSWORD` — le mot de passe de connexion à `/admin` ;
   - `ADMIN_SESSION_SECRET` — une clé aléatoire, via `openssl rand -base64 32`.
3. En local : `vercel env pull .env.local` (voir `.env.example`).

Sans store Blob configuré, les pages publiques s'affichent vides et
l'enregistrement d'une annonce renvoie un message d'erreur explicite.

### Fonctionnement

- Les photos sont envoyées **depuis le navigateur** directement vers Vercel
  Blob (`/api/admin/upload` ne délivre qu'un jeton), ce qui contourne la limite
  de 4,5 Mo des fonctions serveur. Elles sont redimensionnées et converties en
  WebP avant l'envoi.
- Les annonces elles-mêmes vivent dans un seul JSON sur Blob
  (`donnees/annonces.json`), lu en contournant le CDN pour qu'une publication
  soit visible immédiatement. Les écritures sont conditionnées par l'ETag, donc
  deux modifications simultanées ne peuvent pas s'écraser silencieusement.
- L'accès est protégé par un mot de passe unique et une session signée en
  cookie `httpOnly`. `src/proxy.ts` redirige les visiteurs non connectés, et
  **chaque** Server Action revérifie la session.

### Créer la page Meubles

Elle se branche en reprenant `src/app/luminaires/en-vente/page.tsx` et en
filtrant sur la catégorie `meubles` — `AnnoncesGrille` fait le reste.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
