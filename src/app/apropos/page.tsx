import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  creerMetadataPage,
  filArianeJsonLd,
  grapheSchema,
} from "@/lib/seo";

const DESCRIPTION =
  "Un couple passionné, deux maisons, des vide-greniers et des brocantes… Découvrez l'histoire derrière Atelier Petita.";

export const metadata = creerMetadataPage({
  titre: "Notre histoire — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/apropos",
});

export default function Apropos() {
  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "Notre histoire", chemin: "/apropos" },
          ]),
        )}
      />
      <Header />

      <main>
        {/* En-tête */}
        <div className="bg-petita-cream/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <nav
              aria-label="Fil d'Ariane"
              className="mb-6 flex items-center gap-2 font-display text-sm text-petita-brown/70"
            >
              <Link href="/" className="no-underline hover:text-petita-brick">
                Accueil
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-petita-brick">Notre histoire</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Notre histoire
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
          </div>
        </div>

        {/* Contenu principal */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* Photo */}
            <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(126,43,38,0.15)]">
              <Image
                src="/photo-apropos.avif"
                alt="Un couple passionné par les luminaires anciens et les vieux meubles"
                width={739}
                height={820}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Texte */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5 font-display text-[1.08em] leading-relaxed text-petita-brick">
                <p className="m-0 text-2xl font-semibold italic">
                  Un couple, contre vents et marées.
                </p>
                <p className="m-0">
                  Deux maisons, entre ville et campagne partagées.
                </p>
                <p className="m-0">
                  Des vide-greniers, des recycleries, des brocantes qui nous font découvrir les alentours.
                </p>
                <p className="m-0">
                  Des rencontres humaines, du partage et <span className="font-bold">SURTOUT</span>
                </p>
                <p className="m-0 text-2xl font-semibold text-petita-gold-fonce">
                  de l’amour…
                </p>
              </div>

              <div className="mt-4 h-0.5 w-16 bg-petita-gold" />

              <Link
                href="/#contact"
                className="inline-flex w-fit min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Nous contacter
              </Link>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
