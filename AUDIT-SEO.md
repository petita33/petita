# Audit SEO — atelier-petita.fr

Analyse du code (`src/`) croisée avec le site en production, le 16 août 2026.
26 URLs au sitemap, dont 16 annonces.

## Synthèse

Les fondamentaux éditoriaux sont bons : titres et descriptions uniques sur chaque
page, `lang="fr"`, fil d'Ariane partout, sitemap dynamique, HTTPS avec
redirections www/http propres, images servies via `next/image`.

Le problème n'est pas le contenu — ce sont cinq défauts structurels qui
empêchent ce contenu d'être vu :

1. **3 des 4 pages catalogue ne reçoivent aucun lien interne** (menu déroulant
   rendu conditionnellement)
2. **Aucune URL canonique**, alors que `petita.vercel.app` sert le site en double
3. **Pas de robots.txt** (404 en production)
4. **Aucune donnée structurée** — pas de prix ni de fil d'Ariane dans les
   résultats Google
5. **983 Ko de logo préchargés sur chaque page**

---

## 🔴 Critique

### 1. Les pages catalogue sont invisibles du maillage interne

C'est le point le plus grave. Dans `Header.tsx`, les liens vers les catégories
vivent dans un menu déroulant monté **conditionnellement** :

- `src/components/Header.tsx:121` — `{ouvert && (<div>…liens…</div>)}`
- `src/components/Header.tsx:211` — même chose pour l'accordéon mobile

Googlebot exécute le JavaScript, mais **ne clique sur rien**. Ces liens ne sont
jamais dans le DOM. Vérification sur le HTML servi de la page d'accueil :

| Page | Liens internes dans le HTML |
| --- | --- |
| `/luminaires/en-vente` | **0** |
| `/luminaires/vendus` | **0** |
| `/meubles/vendus` | **0** |
| `/meubles/en-vente` | 1 |

Les trois pages commerciales principales ne sont découvrables que par le sitemap
et ne reçoivent **aucun jus de lien**. Elles sont mécaniquement condamnées à mal
se positionner.

Aggravé par `src/components/Luminaires.tsx:28` : le CTA « Explorez nos
luminaires » pointe vers `#ventes` — l'ancre de la section **« Nos dernières
ventes »**, c'est-à-dire les pièces déjà vendues. Le seul CTA luminaires de la
page d'accueil envoie vers ce qui n'est plus achetable.

**Correction :** rendre les liens du menu toujours présents dans le DOM (masqués
en CSS plutôt que démontés), et faire pointer le CTA luminaires vers
`/luminaires/en-vente`.

### 2. Duplicate content : `petita.vercel.app` est indexable

```
https://petita.vercel.app/  →  200 OK
<title>Atelier Petita — Luminaires & mobilier revisités</title>
```

Site complet, contenu identique, même `<title>`, aucune protection. Google peut
indexer cette version à la place de la bonne, ou diluer les deux.

**Correction :** deux verrous complémentaires — canonicals absolues (point 3)
**et** un `robots.ts` qui bloque tout quand `VERCEL_ENV !== "production"`.

### 3. Aucune URL canonique, `metadataBase` absent

`src/app/layout.tsx:21` ne définit ni `metadataBase` ni `alternates.canonical`.
Aucune page du site n'émet de `<link rel="canonical">`. Sans `metadataBase`, Next
refuse d'ailleurs les chemins relatifs dans les champs OG/canonical (erreur de
build).

**Correction :** `metadataBase: new URL("https://atelier-petita.fr")` dans le
layout racine, puis `alternates: { canonical: "/…" }` sur chaque page (et dans le
`generateMetadata` des annonces).

### 4. `/robots.txt` renvoie 404

Aucun fichier `src/app/robots.ts`. Conséquences : aucune déclaration du sitemap
aux moteurs autres que Google, `/admin/*` non explicitement exclu (il est en
`noindex` via `src/app/admin/layout.tsx:9`, mais crawlé quand même), et aucune
barrière contre l'indexation du domaine Vercel.

### 5. Zéro donnée structurée (JSON-LD)

Aucun `application/ld+json` sur le site. Pour un site de vente de pièces uniques,
c'est le plus gros gisement inexploité :

- **`Product` + `Offer`** sur les annonces → prix, disponibilité et image
  directement dans les résultats Google. Toutes les données existent déjà
  (`prix`, `images`, `description`, `categorie.enVente`).
- **`BreadcrumbList`** → le fil d'Ariane visuel existe déjà sur *toutes* les
  pages, mais Google ne le lit pas. Balisé, il remplace l'URL brute dans les
  résultats.
- **`LocalBusiness`** / **`Organization`** → nom, logo, téléphone, adresse,
  Instagram (`sameAs`). Nécessaire au Knowledge Panel.
- **`ItemList`** sur les pages catalogue.

Une réserve : ne pas baliser les témoignages de `Testimonials.tsx` en `Review`.
Google ne montre plus de rich results pour les avis auto-déclarés sur sa propre
entité — c'est du risque de pénalité sans bénéfice.

---

## 🟠 Élevé

### 6. Aucune balise Open Graph hors pages d'annonce

Les annonces ont og:title/description/image
(`src/app/annonces/[id]/page.tsx:32`). **La page d'accueil, les 4 catalogues,
`/en-cours`, `/apropos`, `/contact` n'ont rien.** Partager `atelier-petita.fr`
sur Instagram, Facebook ou WhatsApp donne un lien nu, sans image ni titre.

Pour un atelier dont le trafic vient largement d'Instagram, c'est une perte
directe. Manquent aussi partout : `og:url`, `og:type`, `og:site_name`,
`og:locale`, et un fichier `opengraph-image` par défaut (1200×630).

### 7. Les URLs d'annonces sont des UUID

```
/annonces/562d39a5-b569-4516-ba4c-df2c034cd78c
```

`src/lib/annonces.ts:177` — zéro mot-clé, illisible, impartageable. Ces pages
sont les meilleures candidates sur la longue traîne (« porte manteau vestiaire
merisier massif ») et l'URL n'en dit rien.

**Correction :** `/annonces/porte-manteau-vestiaire-merisier-massif-562d39a5`.
Garder l'ID en suffixe permet la résolution sans migration du store, et une
redirection 301 depuis l'ancienne forme préserve l'existant.

### 8. H1 sur-optimisés et incohérents sur les deux pages « en vente »

`src/app/luminaires/en-vente/page.tsx:39` :

> **H1 :** « Luminaire ancien chiné en brocante, restauré et sublimé à quatre
> mains par l'Atelier Petita — pièce unique »
> **Title :** « Nos luminaires en vente — Atelier Petita »
> **Fil d'Ariane :** « Nos luminaires en vente »
> **Menu :** « Nos luminaires en vente »

Même problème sur `src/app/meubles/en-vente/page.tsx:39`. Le H1 contredit les
trois autres signaux de la page, et c'est du bourrage de mots-clés **visible par
le visiteur** — un titre de page qui se lit comme une balise meta. Les pages
« vendus » et « en cours » ont un H1 propre, ce qui montre que c'est un accident.

**Correction :** H1 court et cohérent (« Nos luminaires en vente »). Le champ
lexical riche a toute sa place dans le paragraphe d'intro juste en dessous, qui
le contient déjà.

### 9. `logo.png` : 983 Ko préchargés sur toutes les pages

```
public/logo.png : PNG 1024×1024, 1 006 213 octets
<link rel="preload" as="image" href="/logo.png">   ← dans le <head> de chaque page
```

`src/components/Logo.tsx:3` utilise un `<img>` brut, donc aucune optimisation
Next. React le passe en preload haute priorité. Il est affiché en **56×56 px**
dans le header. Soit ~1 Mo téléchargé en priorité maximale, avant le contenu, sur
chaque page, y compris en 4G. C'est de loin le premier poste de poids du site et
un concurrent direct de l'image LCP.

**Correction :** `next/image` avec `width`/`height` explicites, ou un logo
redimensionné à ~128 px. Gain attendu : ~980 Ko par page.

### 10. Cache désactivé sur tout le site

Toutes les pages portent `export const dynamic = "force-dynamic"`. En
production :

```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS
TTFB mesuré : 310 – 510 ms
```

Aucune page n'est jamais servie depuis le CDN. Le commentaire du code explique le
choix (voir une publication immédiatement) — l'intention est juste, le moyen est
le plus coûteux qui soit.

**Correction :** `export const revalidate = 3600` + appel à `revalidatePath()`
dans les Server Actions de l'admin après publication/modification. Fraîcheur
identique, TTFB divisé par ~10.

### 11. Liens internes en `<a href>` au lieu de `next/link`

29 occurrences hors admin (Header, Footer, tous les CTA de page). Chaque clic
recharge le document entier : pas de prefetch, pas de navigation client. Dégrade
la fluidité perçue et les signaux d'expérience de page. `next/link` est déjà
importé ailleurs dans le projet (`AnnoncesGrille`, `Gallery`, `Footer`
partiellement) — l'incohérence est purement historique.

### 12. Liens morts dans le footer sur toutes les pages sauf l'accueil

`src/components/Footer.tsx:35` et `:38` :

```tsx
<a href="#luminaires">Voir tous les luminaires</a>
<a href="#meubles">Voir tous les meubles</a>
```

Ces ancres n'existent que sur la page d'accueil. Sur `/contact`, `/apropos`,
`/annonces/…`, `/en-cours` — c'est-à-dire la majorité du site — ces deux liens ne
font **rien**.

**Correction :** les pointer vers `/luminaires/en-vente` et `/meubles/en-vente`.
Cela répare simultanément le point 1 : le footer est sur toutes les pages, ces
deux liens deviendraient la principale source de maillage vers les pages
commerciales.

---

## 🟡 Moyen

### 13. Page 404 par défaut, en anglais

Aucun `src/app/not-found.tsx`. Une URL inexistante affiche « 404 — This page
could not be found. » sur fond blanc, sans header, sans footer, sans issue. Sur
un site en français dont les URLs d'annonces changeront (point 7), c'est à la
fois une fuite de trafic et une rupture de marque.

### 14. La section « Nos services » n'est affichée nulle part

`src/components/Services.tsx` existe, est complet et soigné — « Restauration de
luminaires », « Relooking de meubles », **« Intervention à domicile »** — et
n'est importé par aucune page. C'est du contenu prêt à l'emploi ciblant des
requêtes de service, dont un signal de proximité fort, laissé mort dans le dépôt.

### 15. Aucun signal de référencement local

L'adresse (Cestas, Gironde) n'apparaît que dans les mentions légales. Ni sur
l'accueil, ni sur `/contact`, ni en `LocalBusiness`. Sur « restaurateur de
meubles Bordeaux », « relookage meuble Gironde », « luminaire ancien Cestas », le
site n'existe pas — alors que c'est exactement le type de requête qui convertit
pour un artisan, et que l'intervention à domicile est proposée (point 14).

À coupler avec une fiche **Google Business Profile**, probablement le meilleur
retour sur temps investi de tout cet audit.

### 16. Meta descriptions des annonces tronquées à l'aveugle

`src/app/annonces/[id]/page.tsx:30` — `annonce.description.slice(0, 300)`. Deux
problèmes : Google coupe à ~155-160 caractères, et le `slice` brut tranche en
plein milieu d'un mot. Par ailleurs si `description` est vide, le fallback est
prévu pour `description` mais **pas** pour `openGraph.description` (ligne 34),
qui sera vide.

### 17. Hiérarchie de titres cassée sur les pages d'annonce

`<h1>` (titre de l'annonce) → puis directement les `<h3>` du footer. Aucun
`<h2>`. Un `<h2>` sur le bloc description, ou une section « Pièces similaires »
(qui serait aussi un excellent maillage interne annonce→annonce, aujourd'hui
inexistant), corrigerait les deux.

### 18. Incohérence de maillage vers `/contact`

7 liens pointent vers `/#contact` (l'ancre de l'accueil), **0** vers `/contact`
hors le menu principal. La page `/contact` est dans le sitemap, a ses propres
métadonnées, et ne reçoit qu'un seul lien. Les deux affichent le même formulaire.

**Correction :** choisir. Soit les CTA pointent vers `/contact` (recommandé —
page dédiée, mesurable, plus forte), soit `/contact` sort du sitemap.

---

## 🟢 Faible

- **`changeFrequency` et `priority` dans le sitemap** (`src/app/sitemap.ts:22-68`)
  sont ignorés par Google depuis des années. Sans effet négatif, mais du bruit.
  En revanche `lastModified` manque sur les 10 pages fixes alors qu'il est bien
  présent sur les annonces — c'est celui qui compte.
- **Pas de `title.template`** : le suffixe « — Atelier Petita » est recopié à la
  main dans 10 fichiers. Un `template: "%s — Atelier Petita"` dans le layout
  racine évite la dérive.
- **`<img>` sans `width`/`height`** dans `src/components/Logo.tsx:3` et
  `src/app/apropos/page.tsx:44` → risque de décalage visuel (CLS).
- **Cannibalisation potentielle** : les pages « vendus » ciblent le même champ
  lexical que les pages « en vente » (« luminaire ancien restauré »). Choix
  éditorial défendable, mais à surveiller dans la Search Console.
- **`src/app/icon.png` : 71 Ko** pour une favicon. Compressible à ~5 Ko.
- **Poids JS** : 193 Ko compressés, 10 chunks. Correct pour du Next, rien
  d'alarmant.
- **Search Console / Bing Webmaster Tools** : aucune balise de vérification dans
  le code. À faire — c'est le seul moyen de mesurer l'effet de tout ce qui
  précède.

---

## Plan d'action

### Semaine 1 — débloquer l'indexation (fort impact, faible effort)

1. `robots.ts` + blocage des environnements non-production
2. `metadataBase` + canonicals sur toutes les pages
3. Liens du menu toujours présents dans le DOM
4. Footer : `#luminaires`/`#meubles` → vraies URLs catalogue
5. CTA « Explorez nos luminaires » → `/luminaires/en-vente`
6. Corriger les deux H1 sur-optimisés
7. Optimiser `logo.png` (~980 Ko gagnés par page)

### Semaine 2 — rich results & partage

8. JSON-LD : `Product`+`Offer`, `BreadcrumbList`, `LocalBusiness`
9. Open Graph complet + `opengraph-image`
10. Page 404 personnalisée
11. Vérification Search Console

### Ensuite — fond

12. URLs d'annonces avec slug (+ 301)
13. `revalidate` + `revalidatePath()` à la place de `force-dynamic`
14. Publier la section Services + contenu local (Cestas / Bordeaux)
15. Migration `<a>` → `next/link`
16. Bloc « Pièces similaires » sur les annonces

Les points 1 à 7 représentent l'essentiel du gain et se traitent en une session.
