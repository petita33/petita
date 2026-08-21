import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GalerieAnnonce } from "@/components/GalerieAnnonce";
import { JsonLd } from "@/components/JsonLd";
import {
  CATEGORIES,
  formaterPrix,
  hrefAnnonce,
  nomPlateforme,
  segmentAnnonce,
  type Annonce,
} from "@/lib/annonces";
import { lireAnnonce, lireAnnonces } from "@/lib/annonces-store";
import {
  creerMetadataPage,
  descriptionMeta,
  filArianeJsonLd,
  grapheSchema,
  produitJsonLd,
} from "@/lib/seo";

// La copie CDN expire au bout d'une heure et l'admin l'invalide à chaque
// modification ; les URLs inconnues sont générées à la première visite.
export const revalidate = 3600;

export async function generateStaticParams() {
  const annonces = await lireAnnonces();

  return annonces.map((annonce) => ({
    id: segmentAnnonce(annonce),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const annonce = await lireAnnonce(id);
  if (!annonce) return { title: "Annonce introuvable — Atelier Petita" };

  const repli =
    `${annonce.titre}, pièce unique restaurée à la main par l'Atelier Petita.`;
  const description = descriptionMeta(annonce.description, repli);

  return creerMetadataPage({
    titre: `${annonce.titre} — Atelier Petita`,
    description,
    chemin: hrefAnnonce(annonce),
    image: annonce.images[0],
  });
}

export default async function PageAnnonce({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const annonce = await lireAnnonce(id);
  if (!annonce) notFound();
  if (id !== segmentAnnonce(annonce)) permanentRedirect(hrefAnnonce(annonce));

  const categorie = CATEGORIES[annonce.categorie];
  const prix = categorie.enVente ? formaterPrix(annonce.prix) : null;
  const enRenovation = categorie.groupe === "en-cours";

  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: categorie.label, chemin: categorie.href },
            { nom: annonce.titre, chemin: hrefAnnonce(annonce) },
          ]),
          produitJsonLd(annonce),
        )}
      />
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <nav
          aria-label="Fil d'Ariane"
          className="mb-8 flex flex-wrap items-center gap-2 font-display text-sm text-petita-brown/70"
        >
          <Link href="/" className="no-underline hover:text-petita-brick">
            Accueil
          </Link>
          <span aria-hidden="true">›</span>
          <Link href={categorie.href} className="no-underline hover:text-petita-brick">
            {categorie.label}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-petita-brick">{annonce.titre}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[3fr_2fr] lg:gap-14">
          <GalerieAnnonce
            images={annonce.images}
            titre={annonce.titre}
            format={annonce.format}
            variante="detail"
          />

          <div>
            {categorie.pastille ? (
              <p className="m-0 mb-4 inline-flex rounded-full bg-petita-brick/90 px-3.5 py-1 font-display text-sm text-petita-cream">
                {categorie.pastille}
              </p>
            ) : null}

            <h1 className="m-0 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
              {annonce.titre}
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />

            {prix ? (
              <p className="m-0 mb-5 font-display text-2xl font-semibold text-petita-gold-fonce">
                {prix}
              </p>
            ) : null}

            {annonce.description ? (
              <section aria-labelledby="description-piece">
                <h2
                  id="description-piece"
                  className="mb-3 mt-0 font-display text-2xl font-semibold text-petita-brick"
                >
                  À propos de cette pièce
                </h2>
                <p className="m-0 whitespace-pre-line text-petita-brown">
                  {annonce.description}
                </p>
              </section>
            ) : null}

            <BoutonsAction annonce={annonce} enVente={categorie.enVente} />

            <p className="mt-8 text-sm text-petita-brown/70">
              {enRenovation
                ? "Restauration en cours dans notre atelier. Écrivez-nous pour suivre son avancée ou la réserver."
                : "Pièce unique chinée puis restaurée à la main dans notre atelier."}
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-petita-gold/25 pt-8">
          <Link
            href={categorie.href}
            className="font-display text-[15px] text-petita-brown no-underline hover:text-petita-brick"
          >
            ← Retour à « {categorie.label} »
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Le lien vers la plateforme de vente n'existe que sur cette page : les
 * grilles renvoient uniquement vers le détail.
 */
function BoutonsAction({
  annonce,
  enVente,
}: {
  annonce: Annonce;
  enVente: boolean;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {annonce.lienExterne ? (
        <a
          href={annonce.lienExterne}
          target="_blank"
          rel="noopener nofollow"
          className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-7 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
        >
          {enVente ? "Acheter" : "Voir"} sur {nomPlateforme(annonce.lienExterne)}
          <span className="sr-only"> (nouvelle fenêtre)</span>
        </a>
      ) : null}

      <Link
        href="/#contact"
        className={`inline-flex min-h-12 items-center rounded-md px-7 py-3.5 font-display text-lg no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold ${
          annonce.lienExterne
            ? "border border-petita-gold/60 text-petita-brick hover:bg-petita-brick hover:text-petita-cream"
            : "bg-petita-brick text-petita-cream hover:bg-petita-rose"
        }`}
      >
        Nous contacter
      </Link>
    </div>
  );
}
