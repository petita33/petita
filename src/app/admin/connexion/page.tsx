import { Logo } from "@/components/Logo";
import { FormulaireConnexion } from "@/components/admin/FormulaireConnexion";

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo className="h-20 w-20" />
        <h1 className="mb-0 mt-4 font-display text-3xl font-semibold text-petita-brick">
          Administration
        </h1>
        <div className="my-4 h-0.5 w-12 bg-petita-gold" />
        <p className="m-0 text-[15px] text-petita-brown">
          Espace réservé à la gestion des annonces.
        </p>
      </div>

      <FormulaireConnexion suite={suite ?? "/admin"} />
    </div>
  );
}
