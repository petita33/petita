import { FormulaireAnnonce } from "@/components/admin/FormulaireAnnonce";
import { estGroupe, GROUPES } from "@/lib/annonces";

export default async function NouvelleAnnonce({
  searchParams,
}: {
  searchParams: Promise<{ groupe?: string }>;
}) {
  const { groupe: brut } = await searchParams;
  // Un groupe inconnu retombe sur les annonces classiques.
  const groupe = estGroupe(brut) ? brut : "annonces";

  return (
    <>
      <a
        href="/admin"
        className="inline-flex min-h-11 items-center font-display text-sm text-petita-brown/80 no-underline hover:text-petita-brick sm:min-h-0"
      >
        ← Retour au tableau de bord
      </a>
      <h1 className="mb-0 mt-4 font-display text-2xl font-semibold text-petita-brick sm:text-4xl">
        {GROUPES[groupe].creer}
      </h1>
      <div className="my-5 h-0.5 w-16 bg-petita-gold" />

      <FormulaireAnnonce groupe={groupe} />
    </>
  );
}
