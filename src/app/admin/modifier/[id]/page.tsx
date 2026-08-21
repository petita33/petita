import { notFound } from "next/navigation";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { FormulaireAnnonce } from "@/components/admin/FormulaireAnnonce";
import { CATEGORIES } from "@/lib/annonces";
import { lireAnnonce } from "@/lib/annonces-store";
import { supprimerAnnonce } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ModifierAnnonce({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const annonce = await lireAnnonce(id);
  if (!annonce) notFound();

  return (
    <>
      <a
        href="/admin"
        className="inline-flex min-h-11 items-center font-display text-sm text-petita-brown/80 no-underline hover:text-petita-brick sm:min-h-0"
      >
        ← Retour au tableau de bord
      </a>
      <h1 className="mb-0 mt-4 font-display text-2xl font-semibold text-petita-brick sm:text-4xl">
        Modifier l&apos;annonce
      </h1>
      <div className="my-5 h-0.5 w-16 bg-petita-gold" />
      <p className="mb-8 mt-0 text-sm text-petita-brown/80 sm:text-[15px]">
        Actuellement dans « {CATEGORIES[annonce.categorie].label} ». Créée le{" "}
        {new Date(annonce.creeLe).toLocaleDateString("fr-FR")}.
      </p>

      <FormulaireAnnonce annonce={annonce} />

      <section className="mt-10 rounded-xl border border-petita-brick/30 bg-petita-brick/5 p-4 sm:mt-14 sm:p-6">
        <h2 className="m-0 font-display text-lg font-semibold text-petita-brick sm:text-xl">
          Supprimer cette annonce
        </h2>
        <p className="mb-5 mt-2 text-sm text-petita-brown sm:text-[15px]">
          L&apos;annonce et ses photos seront définitivement effacées.
        </p>
        <form action={supprimerAnnonce}>
          <input type="hidden" name="id" value={annonce.id} />
          <BoutonSuppression titre={annonce.titre} />
        </form>
      </section>
    </>
  );
}
