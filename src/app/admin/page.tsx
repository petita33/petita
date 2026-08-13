import { BoutonVendu } from "@/components/admin/BoutonVendu";
import { classeBoutonPrincipal, classeErreur } from "@/components/admin/ui";
import {
  categoriesDuGroupe,
  categorieVendue,
  compter,
  CATEGORIES,
  GROUPES,
  GROUPES_ORDRE,
  formaterPrix,
  groupeDe,
  trierParDateDecroissante,
  type Annonce,
  type Groupe,
} from "@/lib/annonces";
import { lireAnnonces } from "@/lib/annonces-store";
import { marquerVendue } from "./actions";

export const dynamic = "force-dynamic";

export default async function TableauDeBord({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const [{ erreur }, annonces] = await Promise.all([
    searchParams,
    lireAnnonces(),
  ]);

  return (
    <>
      <h1 className="m-0 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
        Mes annonces
      </h1>
      <div className="my-4 h-0.5 w-16 bg-petita-gold" />
      <p className="m-0 max-w-[62ch] text-[15px] text-petita-brown">
        Les annonces mises en vente et les pièces encore à l&apos;atelier se
        gèrent séparément. Les photos de présentation de la page d&apos;accueil,
        elles, se changent dans l&apos;onglet « Photos de la page d&apos;accueil ».
      </p>

      {erreur === "conflit" ? (
        <p role="alert" className={`mt-8 ${classeErreur}`}>
          La modification n&apos;a pas pu être appliquée. Rechargez la page puis
          réessayez.
        </p>
      ) : null}

      <div className="mt-12 flex flex-col gap-14">
        {GROUPES_ORDRE.map((groupe) => (
          <SectionGroupe
            key={groupe}
            groupe={groupe}
            annonces={annonces.filter(
              (annonce) => groupeDe(annonce.categorie) === groupe,
            )}
          />
        ))}
      </div>
    </>
  );
}

function SectionGroupe({
  groupe,
  annonces,
}: {
  groupe: Groupe;
  annonces: Annonce[];
}) {
  const categories = categoriesDuGroupe(groupe);
  // Un groupe d'une seule catégorie n'a rien à sous-titrer : la liste suit
  // directement l'en-tête.
  const detaillerCategories = categories.length > 1;

  return (
    <section className="rounded-2xl border border-petita-gold/30 bg-petita-cream/40 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
            {GROUPES[groupe].titre}
          </h2>
          <p className="mb-0 mt-2 text-[15px] text-petita-brown">
            {annonces.length === 0
              ? "Rien pour le moment."
              : `${compter(annonces.length, GROUPES[groupe].nom)} en ligne.`}
          </p>
        </div>
        <a
          href={`/admin/nouvelle?groupe=${groupe}`}
          className={classeBoutonPrincipal}
        >
          {GROUPES[groupe].creer}
        </a>
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {categories.map((categorie) => {
          const duGroupe = trierParDateDecroissante(
            annonces.filter((annonce) => annonce.categorie === categorie),
          );

          return (
            <div key={categorie}>
              {detaillerCategories ? (
                <h3 className="m-0 flex flex-wrap items-baseline gap-3 font-display text-xl font-semibold text-petita-brick">
                  {CATEGORIES[categorie].label}
                  <span className="font-body text-sm font-normal text-petita-brown/70">
                    {compter(duGroupe.length, "annonce")} ·{" "}
                    {CATEGORIES[categorie].href}
                  </span>
                </h3>
              ) : (
                <p className="m-0 font-body text-sm text-petita-brown/70">
                  {CATEGORIES[categorie].href}
                </p>
              )}

              {duGroupe.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-petita-gold/40 px-5 py-6 text-[15px] text-petita-brown/70">
                  Rien ici pour l&apos;instant.
                </p>
              ) : (
                <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
                  {duGroupe.map((annonce) => (
                    <LigneAnnonce key={annonce.id} annonce={annonce} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LigneAnnonce({ annonce }: { annonce: Annonce }) {
  const prix = CATEGORIES[annonce.categorie].enVente
    ? formaterPrix(annonce.prix)
    : null;
  // Seules les annonces encore en vente peuvent basculer côté « vendus ».
  const vendue = categorieVendue(annonce.categorie);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-petita-gold/25 bg-petita-cream p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      <a
        href={`/admin/modifier/${annonce.id}`}
        className="flex min-w-0 flex-grow items-center gap-4 no-underline"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={annonce.images[0]}
          alt=""
          className="h-20 w-24 shrink-0 rounded-lg object-cover"
        />
        <span className="flex min-w-0 flex-grow flex-col gap-1">
          <span className="truncate font-display text-[17px] font-semibold text-petita-brick">
            {annonce.titre}
          </span>
          <span className="truncate text-sm text-petita-brown/80">
            {annonce.description || "Sans description"}
          </span>
          <span className="font-display text-sm text-petita-brown/70">
            {compter(annonce.images.length, "photo")}
            {prix ? ` · ${prix}` : ""}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 pr-2 font-display text-petita-gold-fonce"
        >
          Modifier →
        </span>
      </a>

      {vendue ? (
        <form action={marquerVendue} className="shrink-0 sm:pr-1">
          <input type="hidden" name="id" value={annonce.id} />
          <BoutonVendu titre={annonce.titre} />
        </form>
      ) : null}
    </li>
  );
}
