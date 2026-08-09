<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Piège vérifié sur ce projet

Le minifieur de `next build` (16.3.0, Turbopack) **supprime** un `if (!x) throw`
quand la fonction qui le contient vit dans le même module que la fonction
`async` dont elle attend le résultat. Concrètement, un helper `exigerAdmin()`
placé dans `src/lib/session.ts` à côté de `sessionActive()` compilait en
`async function(){await sessionActive()}` — garde d'authentification purement
et simplement absente du bundle.

Donc : les contrôles de session sont écrits **inline dans chaque Server Action
et route**, jamais derrière un helper voisin de `sessionActive`. Après toute
modification de ces gardes, vérifier qu'elles survivent réellement :

```bash
npm run build
grep -rn "sessionActive" .next/server/chunks/ssr/*.js
```
