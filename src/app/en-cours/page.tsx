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
  "Meubles et luminaires anciens actuellement en restauration à l'Atelier Petita. Suivez leur transformation avant leur mise en vente.";

export const metadata = creerMetadataPage({
  titre: "En cours de rénovation — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/en-cours",
});

// La publication admin invalide cette copie sans attendre l'échéance horaire.
export const revalidate = 3600;

export default async function EnCours() {
  const annonces = trierParDateDecroissante(
    (await lireAnnonces()).filter((annonce) => annonce.categorie === "en-cours"),
  );

  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "En cours de rénovation", chemin: "/en-cours" },
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
              <span className="text-petita-brick">En cours de rénovation</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              En cours de rénovation
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Les pièces actuellement sur notre établi. Ponçage, réparation,
              peinture, câblage… Suivez leur transformation avant leur mise en
              vente — et n&apos;hésitez pas à nous écrire si l&apos;une
              d&apos;elles vous fait de l&apos;œil.
            </p>
          </div>
        </div>

        {/* Grille des pièces en cours */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <AnnoncesGrille
            annonces={annonces}
            messageVide="Aucune rénovation en cours pour le moment — revenez bientôt, l'atelier ne reste jamais vide très longtemps."
          />

          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Une pièce vous plaît déjà ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Écrivez-nous pour la réserver avant sa mise en vente, ou pour nous
              confier la restauration d&apos;un meuble qui vous est cher.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Nous écrire
              </Link>
              <Link
                href="/meubles/en-vente"
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
