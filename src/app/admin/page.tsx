import { Suspense } from "react";
import { BoutonVendu } from "@/components/admin/BoutonVendu";
import {
  StatistiquesEnChargement,
  StatistiquesFrequentation,
} from "@/components/admin/StatistiquesFrequentation";
import {
  classeBoutonCompact,
  classeBoutonPrincipal,
  classeErreur,
} from "@/components/admin/ui";
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
      <h1 className="m-0 font-display text-2xl font-semibold text-petita-brick sm:text-4xl">
        Mes annonces
      </h1>
      <div className="my-4 h-0.5 w-16 bg-petita-gold" />
      <p className="m-0 max-w-[62ch] text-sm text-petita-brown sm:text-[15px]">
        Les annonces mises en vente et les pièces encore à l&apos;atelier se
        gèrent séparément. Les photos de présentation de la page d&apos;accueil,
        elles, se changent dans l&apos;onglet « Photos de la page d&apos;accueil ».
      </p>

      {erreur === "conflit" ? (
        <p role="alert" className={`mt-6 sm:mt-8 ${classeErreur}`}>
          La modification n&apos;a pas pu être appliquée. Rechargez la page puis
          réessayez.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-10 sm:mt-12 sm:gap-14">
        {GROUPES_ORDRE.map((groupe) => (
          <SectionGroupe
            key={groupe}
            groupe={groupe}
            annonces={annonces.filter(
              (annonce) => groupeDe(annonce.categorie) === groupe,
            )}
          />
        ))}

        {/* L'API de Vercel répond en dehors du chemin critique : les annonces
            s'affichent sans attendre les chiffres. */}
        <Suspense fallback={<StatistiquesEnChargement />}>
          <StatistiquesFrequentation />
        </Suspense>
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
    <section className="rounded-2xl border border-petita-gold/30 bg-petita-cream/40 p-4 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-5">
        <div>
          <h2 className="m-0 font-display text-xl font-semibold text-petita-brick sm:text-2xl">
            {GROUPES[groupe].titre}
          </h2>
          <p className="mb-0 mt-2 text-sm text-petita-brown sm:text-[15px]">
            {annonces.length === 0
              ? "Rien pour le moment."
              : `${compter(annonces.length, GROUPES[groupe].nom)} en ligne.`}
          </p>
        </div>
        <a
          href={`/admin/nouvelle?groupe=${groupe}`}
          className={`${classeBoutonPrincipal} w-full sm:w-auto`}
        >
          {GROUPES[groupe].creer}
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-8 sm:mt-8 sm:gap-10">
        {categories.map((categorie) => {
          const duGroupe = trierParDateDecroissante(
            annonces.filter((annonce) => annonce.categorie === categorie),
          );

          return (
            <div key={categorie}>
              {detaillerCategories ? (
                <h3 className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-lg font-semibold text-petita-brick sm:text-xl">
                  {CATEGORIES[categorie].label}
                  <span className="font-body text-[13px] font-normal text-petita-brown/70 sm:text-sm">
                    {compter(duGroupe.length, "annonce")} ·{" "}
                    {CATEGORIES[categorie].href}
                  </span>
                </h3>
              ) : (
                <p className="m-0 font-body text-[13px] text-petita-brown/70 sm:text-sm">
                  {CATEGORIES[categorie].href}
                </p>
              )}

              {duGroupe.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-petita-gold/40 px-4 py-5 text-sm text-petita-brown/70 sm:px-5 sm:py-6 sm:text-[15px]">
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
  const modifier = `/admin/modifier/${annonce.id}`;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-petita-gold/25 bg-petita-cream p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      {/* Au téléphone la carte s'empile — photo, puis texte — parce que trois
          colonnes sur 375 px écrasent le titre au point de rendre deux annonces
          indistinguables. À partir de `sm`, la rangée d'origine revient. */}
      <a
        href={modifier}
        className="flex min-w-0 flex-grow flex-col gap-3 no-underline sm:flex-row sm:items-center sm:gap-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={annonce.images[0]}
          alt=""
          className="h-40 w-full shrink-0 rounded-lg object-cover sm:h-20 sm:w-24"
        />
        <span className="flex min-w-0 flex-grow flex-col gap-1">
          <span className="line-clamp-2 font-display text-base font-semibold text-petita-brick sm:truncate sm:text-[17px]">
            {annonce.titre}
          </span>
          <span className="line-clamp-2 text-[13px] text-petita-brown/80 sm:truncate sm:text-sm">
            {annonce.description || "Sans description"}
          </span>
          {/* Le prix vient d'`Intl` avec une espace insécable : « 180 € » ne se
              coupe pas en fin de ligne. */}
          <span className="font-display text-[13px] text-petita-brown/70 sm:text-sm">
            {compter(annonce.images.length, "photo")}
            {prix ? ` · ${prix}` : ""}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="hidden shrink-0 pr-2 font-display text-petita-gold-fonce sm:block"
        >
          Modifier →
        </span>
      </a>

      {/* `sm:contents` fait disparaître ce conteneur de la mise en page au-delà
          du mobile : le formulaire redevient un enfant direct de la carte, à sa
          place d'origine, sans dupliquer le bouton dans le DOM. */}
      <div className="flex flex-wrap gap-2 sm:contents">
        <a
          href={modifier}
          className={`${classeBoutonCompact} grow basis-44 sm:hidden`}
        >
          Modifier
        </a>

        {vendue ? (
          <form
            action={marquerVendue}
            className="grow basis-44 sm:grow-0 sm:shrink-0 sm:basis-auto sm:pr-1"
          >
            <input type="hidden" name="id" value={annonce.id} />
            <BoutonVendu titre={annonce.titre} classe="w-full sm:w-auto" />
          </form>
        ) : null}
      </div>
    </li>
  );
}
