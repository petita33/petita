/**
 * Lecture des statistiques de fréquentation, via l'API Web Analytics de Vercel.
 *
 * Ce module est strictement serveur : `VERCEL_TOKEN` est un secret de compte,
 * il ne doit jamais partir dans un bundle client. D'où le `server-only` en
 * tête, qui fait échouer la compilation si un composant client l'importe.
 *
 * Aucune panne de l'API ne doit sortir l'admin de ses rails : chaque bloc de
 * chiffres est récupéré séparément et vaut `null` s'il n'a pas pu être lu. La
 * page affiche alors une phrase neutre à la place du bloc concerné, et les
 * autres restent lisibles.
 */

import "server-only";

const BASE = "https://api.vercel.com/v1/query/web-analytics";

/** Une heure de cache : l'audience d'un site vitrine ne bouge pas à la minute. */
const FRAICHEUR_SECONDES = 3600;

/** Regroupement que l'API pose sur tout ce qui dépasse `limit`. */
export const RESTE = "Others";

/**
 * L'administratrice consulte son propre back-office : sans ce filtre, ses
 * visites gonflent les totaux et `/admin` trône dans les pages les plus vues.
 *
 * L'API accepte un filtre OData (`filter`), appliqué avant l'agrégation : les
 * totaux, le classement des pages et celui des provenances sont donc cohérents
 * entre eux, ce qu'un filtrage a posteriori ne saurait garantir — les visiteurs
 * uniques ne se soustraient pas. `startswith` couvre `/admin` et toutes ses
 * sous-routes.
 */
const HORS_ADMIN = "not startswith(requestPath, '/admin')";

export type LigneClassement = {
  /** Chemin de page ou nom de domaine, tel que renvoyé par l'API. */
  cle: string;
  visiteurs: number;
  pagesVues: number;
};

export type Frequentation = {
  visiteurs: number;
  pagesVues: number;
  /** Nombre de jours couverts par la période interrogée. */
  jours: number;
};

export type SiteStats = {
  frequentation: Frequentation | null;
  pages: LigneClassement[] | null;
  sources: LigneClassement[] | null;
};

/** Lignes renvoyées par `visits/aggregate`, selon la valeur de `by`. */
type LigneJour = { timestamp: string; pageviews: number; visitors: number };
type LignePage = { requestPath: string; pageviews: number; visitors: number };
type LigneSource = {
  referrerHostname: string;
  pageviews: number;
  visitors: number;
};

function lireConfiguration() {
  const jeton = process.env.VERCEL_TOKEN;
  const projet = process.env.VERCEL_PROJECT_ID;

  if (!jeton || !projet) {
    console.error(
      "Statistiques indisponibles : VERCEL_TOKEN et/ou VERCEL_PROJECT_ID ne sont pas définis. Voir .env.example.",
    );
    return null;
  }

  return { jeton, projet };
}

/** Date au format `YYYY-MM-DD`, `recul` jours avant aujourd'hui. */
function jour(recul: number) {
  return new Date(Date.now() - recul * 86_400_000).toISOString().slice(0, 10);
}

function estNombre(valeur: unknown): valeur is number {
  return typeof valeur === "number" && Number.isFinite(valeur);
}

/**
 * Appelle `visits/aggregate` et rend les lignes brutes, ou `null` si quoi que
 * ce soit a échoué : réseau, statut non-OK, JSON illisible, forme inattendue.
 * L'erreur est journalisée côté serveur avec le statut et le corps de réponse,
 * seul endroit où l'on peut vraiment diagnostiquer un jeton expiré ou un projet
 * inconnu.
 */
async function agreger<L>(
  parametres: Record<string, string>,
): Promise<L[] | null> {
  const configuration = lireConfiguration();
  if (!configuration) return null;

  const url = new URL(`${BASE}/visits/aggregate`);
  url.searchParams.set("projectId", configuration.projet);
  for (const [nom, valeur] of Object.entries(parametres)) {
    url.searchParams.set(nom, valeur);
  }
  // Le jeton voyage dans l'en-tête, jamais dans l'URL : celle-ci est
  // journalisée en cas d'erreur.
  const repere = `${url.pathname}?${url.searchParams.toString()}`;

  try {
    const reponse = await fetch(url, {
      headers: { Authorization: `Bearer ${configuration.jeton}` },
      next: { revalidate: FRAICHEUR_SECONDES },
    });

    if (!reponse.ok) {
      console.error(
        `Vercel Web Analytics ${repere} → HTTP ${reponse.status}`,
        await reponse.text().catch(() => "(corps illisible)"),
      );
      return null;
    }

    const charge: unknown = await reponse.json();
    const lignes = (charge as { data?: unknown } | null)?.data;
    if (!Array.isArray(lignes)) {
      console.error(
        `Vercel Web Analytics ${repere} → réponse inattendue`,
        JSON.stringify(charge)?.slice(0, 500),
      );
      return null;
    }

    return lignes as L[];
  } catch (erreur) {
    console.error(`Vercel Web Analytics ${repere} → appel impossible`, erreur);
    return null;
  }
}

/**
 * Ne garde que les lignes exploitables — une ligne bancale ne doit pas fausser
 * un total — puis range le classement dans l'ordre où il est lu.
 *
 * L'API trie par visiteurs ; l'écran, lui, affiche des pages vues. Sans ce
 * second tri, les nombres descendent puis remontent. Le regroupement `Others`
 * est renvoyé à la fin quel que soit son score : ce n'est pas une ligne du
 * classement, c'est ce qui reste une fois le classement fait.
 */
function classer(
  lignes: Array<Record<string, unknown>> | null,
  champCle: string,
): LigneClassement[] | null {
  if (!lignes) return null;

  const retenues = lignes.flatMap((ligne) => {
    const cle = ligne[champCle];
    if (!estNombre(ligne.visitors) || !estNombre(ligne.pageviews)) return [];
    return [
      {
        cle: typeof cle === "string" ? cle : "",
        visiteurs: ligne.visitors,
        pagesVues: ligne.pageviews,
      },
    ];
  });

  const reste = (ligne: LigneClassement) =>
    ligne.cle.trim().toLowerCase() === RESTE.toLowerCase();

  return retenues.sort((a, b) => {
    if (reste(a) !== reste(b)) return reste(a) ? 1 : -1;
    return b.pagesVues - a.pagesVues;
  });
}

/**
 * Statistiques du site sur les `days` derniers jours (aujourd'hui compris).
 *
 * Rend `null` si aucun des trois blocs n'a pu être lu — API en panne, jeton
 * absent ou révoqué : il n'y a alors rien à afficher du tout. Sinon, chaque
 * bloc vaut ses données ou `null` s'il est le seul à avoir échoué.
 */
export async function getSiteStats(days = 30): Promise<SiteStats | null> {
  const until = jour(0);
  const since = jour(days - 1);
  const periode = { since, until, filter: HORS_ADMIN };

  const [parJour, pages, sources] = await Promise.all([
    agreger<LigneJour>({ ...periode, by: "day" }),
    agreger<LignePage>({ ...periode, by: "requestPath", limit: "5" }),
    agreger<LigneSource>({ ...periode, by: "referrerHostname", limit: "5" }),
  ]);

  if (!parJour && !pages && !sources) return null;

  return {
    // L'API rend le détail jour par jour ; le panel n'affiche que les totaux
    // de la période, donc on additionne ici plutôt que de le refaire à l'écran.
    frequentation: parJour
      ? parJour.reduce<Frequentation>(
          (total, ligne) => ({
            visiteurs:
              total.visiteurs + (estNombre(ligne.visitors) ? ligne.visitors : 0),
            pagesVues:
              total.pagesVues +
              (estNombre(ligne.pageviews) ? ligne.pageviews : 0),
            jours: total.jours,
          }),
          { visiteurs: 0, pagesVues: 0, jours: days },
        )
      : null,
    pages: classer(pages, "requestPath"),
    sources: classer(sources, "referrerHostname"),
  };
}
