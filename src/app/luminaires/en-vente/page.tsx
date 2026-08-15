import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnoncesGrille } from "@/components/AnnoncesGrille";
import { JsonLd } from "@/components/JsonLd";
import { trierParDateDecroissante } from "@/lib/annonces";
import { lireAnnonces } from "@/lib/annonces-store";
import {
  filArianeJsonLd,
  creerMetadataPage,
  grapheSchema,
  listeAnnoncesJsonLd,
} from "@/lib/seo";

const DESCRIPTION =
  "Découvrez nos luminaires anciens restaurés et disponibles à la vente : des pièces uniques remises aux normes à la main.";

export const metadata = creerMetadataPage({
  titre: "Nos luminaires en vente — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/luminaires/en-vente",
});

// La publication admin invalide cette copie sans attendre l'échéance horaire.
export const revalidate = 3600;

export default async function LuminairesEnVente() {
  const annonces = trierParDateDecroissante(
    (await lireAnnonces()).filter(
      (annonce) => annonce.categorie === "luminaires-en-vente",
    ),
  );

  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "Nos luminaires en vente", chemin: "/luminaires/en-vente" },
          ]),
          listeAnnoncesJsonLd(annonces),
        )}
      />
      <Header />

      <main>
        {/* En-tête de page */}
        <div className="bg-petita-cream/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-2 font-display text-sm text-petita-brown/70">
              <Link href="/" className="no-underline hover:text-petita-brick">Accueil</Link>
              <span aria-hidden="true">›</span>
              <span className="text-petita-brick">Nos luminaires en vente</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Nos luminaires en vente
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Écumant brocantes et vide-greniers, nous dénichons des pièces qui ont une âme.
              Lustres, appliques, suspensions… chacune renaît sous d’autres formes, entre nos quatre mains,
              avec patience et passion, pour devenir une création unique.
            </p>
          </div>
        </div>

        {/* Grille des luminaires */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <AnnoncesGrille
            annonces={annonces}
            messageVide="Aucune pièce disponible pour le moment — de nouvelles trouvailles arrivent après chaque chine."
          />

          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Vous cherchez une pièce particulière ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Contactez-nous pour nous décrire votre projet. Nous sélectionnons régulièrement de nouvelles pièces lors de nos chines.
            </p>
            <Link
              href="/#contact"
              className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              Nous écrire
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
