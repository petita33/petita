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
  "Luminaires et meubles restaurés par l'Atelier Petita, photographiés chez leurs nouveaux propriétaires. Des pièces anciennes qui ont trouvé leur place.";

export const metadata = creerMetadataPage({
  titre: "Chez vous — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/chez-vous",
});

// La publication admin invalide cette copie sans attendre l'échéance horaire.
export const revalidate = 3600;

export default async function ChezVous() {
  const annonces = trierParDateDecroissante(
    (await lireAnnonces()).filter((annonce) => annonce.categorie === "chez-vous"),
  );

  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "Chez vous", chemin: "/chez-vous" },
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
              <span className="text-petita-brick">Chez vous</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              C&apos;est chez vous, c&apos;est chez nous… on adore&nbsp;!
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Elles sont passées par notre atelier, elles vivent désormais chez
              vous. Merci à toutes celles et ceux qui nous envoient une photo de
              leur pièce, installée dans son nouveau décor.
            </p>
          </div>
        </div>

        {/* Grille des pièces chez leurs propriétaires */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <AnnoncesGrille
            annonces={annonces}
            messageVide="Les premières photos de nos pièces chez vous arrivent bientôt."
          />

          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Une de nos pièces vit chez vous ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Envoyez-nous une photo : nous serions ravis de la voir dans son
              nouveau décor, et de la partager ici avec votre accord.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Nous écrire
              </Link>
              <Link
                href="/luminaires/en-vente"
                className="inline-flex min-h-12 items-center rounded-md border border-petita-gold/60 px-8 py-3.5 font-display text-lg text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Voir les pièces en vente
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
