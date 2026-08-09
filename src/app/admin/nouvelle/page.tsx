import { FormulaireAnnonce } from "@/components/admin/FormulaireAnnonce";

export default function NouvelleAnnonce() {
  return (
    <>
      <a
        href="/admin"
        className="font-display text-sm text-petita-brown/80 no-underline hover:text-petita-brick"
      >
        ← Toutes les annonces
      </a>
      <h1 className="mb-0 mt-4 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
        Nouvelle annonce
      </h1>
      <div className="my-5 h-0.5 w-16 bg-petita-gold" />

      <FormulaireAnnonce />
    </>
  );
}
