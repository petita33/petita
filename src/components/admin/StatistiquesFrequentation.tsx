/**
 * Bloc « Statistiques de fréquentation » du tableau de bord.
 *
 * Composant serveur : il appelle directement la couche de données, qui est
 * `server-only`. Rien de tout cela n'atteint le navigateur.
 *
 * Le vocabulaire technique reste dehors : on parle de visiteurs et de pages
 * consultées, jamais de sessions ni de pageviews, et un domaine comme
 * `instagram.com` s'affiche « Instagram ».
 */

import { CATEGORIES, CATEGORIES_ORDRE } from "@/lib/annonces";
import { getSiteStats, RESTE, type LigneClassement } from "@/lib/analytics";

const nombre = new Intl.NumberFormat("fr-FR");

const SOURCES_CONNUES: Record<string, string> = {
  "google.com": "Google",
  "instagram.com": "Instagram",
  "facebook.com": "Facebook",
};

/**
 * Les réseaux passent par des sous-domaines de redirection (`l.instagram.com`,
 * `m.facebook.com`) : on les ramène au domaine principal avant de chercher un
 * libellé, sinon la même source apparaîtrait sous deux noms.
 */
function libelleSource(cle: string) {
  const brut = cle.trim().toLowerCase();
  if (brut === "") return "Accès direct";
  if (brut === RESTE.toLowerCase()) return "Autres sources";

  const domaine = brut.replace(/^(?:www|m|l)\./, "");
  return SOURCES_CONNUES[domaine] ?? domaine;
}

/**
 * Un chemin d'URL ne dit rien à qui ne lit pas d'URL. Les pages de catalogue
 * portent déjà un nom dans l'admin : on le reprend, plutôt que d'entretenir
 * deux listes qui divergeront.
 */
const PAGES_CONNUES: Record<string, string> = {
  "/": "Accueil",
  "/apropos": "À propos",
  "/contact": "Contact",
  "/mentions-legales": "Mentions légales",
  "/cgu-cgv": "Conditions générales",
  ...Object.fromEntries(
    CATEGORIES_ORDRE.map((categorie) => [
      CATEGORIES[categorie].href,
      CATEGORIES[categorie].label,
    ]),
  ),
};

function libellePage(cle: string) {
  const chemin = cle.trim();
  if (chemin.toLowerCase() === RESTE.toLowerCase()) return "Autres pages";
  if (chemin === "") return "Accueil";

  // `/contact/` et `/contact` sont la même page ; l'accueil garde sa barre.
  const normalise = chemin.replace(/\/+$/, "") || "/";
  // Route inconnue — la page d'une annonce, par exemple : le chemin brut vaut
  // mieux qu'un libellé approximatif, et il est lisible même tronqué.
  return PAGES_CONNUES[normalise] ?? chemin;
}

const classeSection =
  "rounded-2xl border border-petita-gold/30 bg-petita-cream/40 p-4 sm:p-7";

const classeVide =
  "mt-4 rounded-lg border border-dashed border-petita-gold/40 px-4 py-5 text-sm text-petita-brown/70 sm:px-5 sm:py-6 sm:text-[15px]";

/**
 * Affiché pendant l'appel à l'API : le reste du tableau de bord ne doit pas
 * attendre les statistiques pour s'afficher.
 */
export function StatistiquesEnChargement() {
  return (
    <section className={classeSection} aria-busy="true">
      <h2 className="m-0 font-display text-xl font-semibold text-petita-brick sm:text-2xl">
        Statistiques de fréquentation
      </h2>
      <p className="mb-0 mt-2 text-sm text-petita-brown/70 sm:text-[15px]">
        Chargement des chiffres…
      </p>
    </section>
  );
}

export async function StatistiquesFrequentation() {
  const stats = await getSiteStats(30);

  return (
    <section className={classeSection}>
      <h2 className="m-0 font-display text-xl font-semibold text-petita-brick sm:text-2xl">
        Statistiques de fréquentation
      </h2>
      <p className="mb-0 mt-2 max-w-[62ch] text-sm text-petita-brown sm:text-[15px]">
        Ce que les visiteurs regardent sur le site, vos propres passages par
        l&apos;administration mis à part. Les chiffres se rafraîchissent environ
        une fois par heure.
      </p>

      {stats === null ? (
        <p className={classeVide}>Statistiques temporairement indisponibles.</p>
      ) : (
        <Chiffres stats={stats} />
      )}
    </section>
  );
}

function Chiffres({
  stats,
}: {
  stats: NonNullable<Awaited<ReturnType<typeof getSiteStats>>>;
}) {
  const { frequentation, pages, sources } = stats;
  // Un site tout juste mis en ligne répond correctement, mais sans rien à
  // montrer : ce n'est pas une panne, et ça ne se dit pas comme une panne.
  const aucuneDonnee =
    frequentation !== null &&
    frequentation.visiteurs === 0 &&
    frequentation.pagesVues === 0 &&
    (pages?.length ?? 0) === 0 &&
    (sources?.length ?? 0) === 0;

  if (aucuneDonnee) {
    return (
      <p className={classeVide}>
        Pas encore de données, revenez dans quelques jours.
      </p>
    );
  }

  return (
    <>
      {frequentation === null ? (
        <p className={classeVide}>Statistiques temporairement indisponibles.</p>
      ) : (
        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-5 sm:gap-x-12 sm:gap-y-6">
          <p className="m-0">
            <span className="block font-display text-4xl font-semibold leading-none text-petita-brick sm:text-5xl">
              {nombre.format(frequentation.visiteurs)}
            </span>
            <span className="mt-2 block text-sm text-petita-brown sm:text-[15px]">
              visiteurs uniques ces {frequentation.jours} derniers jours
            </span>
          </p>
          <p className="m-0">
            <span className="block font-display text-2xl font-semibold leading-none text-petita-brown sm:text-3xl">
              {nombre.format(frequentation.pagesVues)}
            </span>
            <span className="mt-2 block text-sm text-petita-brown sm:text-[15px]">
              pages consultées
            </span>
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8">
        <Classement
          titre="Pages les plus consultées"
          lignes={pages}
          libelle={libellePage}
          vide="Aucune page consultée sur la période."
        />
        <Classement
          titre="D'où viennent les visiteurs"
          lignes={sources}
          libelle={libelleSource}
          vide="Aucune provenance connue sur la période."
        />
      </div>
    </>
  );
}

function Classement({
  titre,
  lignes,
  libelle,
  vide,
}: {
  titre: string;
  lignes: LigneClassement[] | null;
  libelle: (cle: string) => string;
  vide: string;
}) {
  return (
    // `min-w-0` : sans lui, la piste de la grille est dimensionnée sur le
    // contenu intrinsèque des lignes. Or `truncate` pose `white-space: nowrap`,
    // dont la largeur min-content vaut la largeur du texte entier : un référent
    // comme `com.google.android.googlequicksearchbox` élargit alors la colonne
    // au-delà de l'écran. Le `min-w-0` de l'étiquette ne suffit pas — il permet
    // de rétrécir, pas de réduire la contribution au dimensionnement de la piste.
    <div className="min-w-0">
      <h3 className="m-0 font-display text-lg font-semibold text-petita-brick sm:text-xl">
        {titre}
      </h3>

      {lignes === null ? (
        <p className={classeVide}>Statistiques temporairement indisponibles.</p>
      ) : lignes.length === 0 ? (
        <p className={classeVide}>{vide}</p>
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {lignes.map((ligne) => (
            <li
              key={ligne.cle}
              className="flex items-baseline justify-between gap-3 rounded-xl border border-petita-gold/25 bg-petita-cream px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
            >
              <span className="min-w-0 truncate text-sm text-petita-brown sm:text-[15px]">
                {libelle(ligne.cle)}
              </span>
              <span className="shrink-0 whitespace-nowrap font-display text-sm font-semibold text-petita-brick sm:text-[15px]">
                {nombre.format(ligne.pagesVues)} vues
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
