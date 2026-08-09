import { classeBoutonPrincipal, classeErreur } from "@/components/admin/ui";
import {
  CATEGORIES,
  CATEGORIES_ORDRE,
  formaterPrix,
  trierParDateDecroissante,
  type Annonce,
} from "@/lib/annonces";
import { lireAnnonces } from "@/lib/annonces-store";

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
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="m-0 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
            Mes annonces
          </h1>
          <div className="my-4 h-0.5 w-16 bg-petita-gold" />
          <p className="m-0 text-[15px] text-petita-brown">
            {annonces.length === 0
              ? "Aucune annonce pour le moment."
              : `${annonces.length} annonce${annonces.length > 1 ? "s" : ""} publiée${annonces.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <a href="/admin/nouvelle" className={classeBoutonPrincipal}>
          Nouvelle annonce
        </a>
      </div>

      {erreur === "conflit" ? (
        <p role="alert" className={`mt-8 ${classeErreur}`}>
          La suppression n&apos;a pas pu être appliquée. Rechargez la page puis
          réessayez.
        </p>
      ) : null}

      <div className="mt-12 flex flex-col gap-12">
        {CATEGORIES_ORDRE.map((categorie) => {
          const duGroupe = trierParDateDecroissante(
            annonces.filter((annonce) => annonce.categorie === categorie),
          );

          return (
            <section key={categorie}>
              <h2 className="m-0 flex flex-wrap items-baseline gap-3 font-display text-xl font-semibold text-petita-brick">
                {CATEGORIES[categorie].label}
                <span className="font-body text-sm font-normal text-petita-brown/70">
                  {duGroupe.length} annonce{duGroupe.length > 1 ? "s" : ""} ·{" "}
                  {CATEGORIES[categorie].href}
                </span>
              </h2>

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
            </section>
          );
        })}
      </div>
    </>
  );
}

function LigneAnnonce({ annonce }: { annonce: Annonce }) {
  const prix = formaterPrix(annonce.prix);

  return (
    <li>
      <a
        href={`/admin/modifier/${annonce.id}`}
        className="flex items-center gap-4 rounded-xl border border-petita-gold/25 bg-petita-cream p-3 no-underline transition-shadow hover:shadow-md"
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
            {annonce.images.length} photo{annonce.images.length > 1 ? "s" : ""}
            {prix ? ` · ${prix}` : ""}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 pr-2 font-display text-petita-gold"
        >
          Modifier →
        </span>
      </a>
    </li>
  );
}
