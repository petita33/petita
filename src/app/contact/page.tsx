import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { InstagramIcon } from "@/components/InstagramIcon";
import { JsonLd } from "@/components/JsonLd";
import {
  creerMetadataPage,
  filArianeJsonLd,
  grapheSchema,
} from "@/lib/seo";

const DESCRIPTION =
  "Une lampe à restaurer ou un meuble à relooker autour de Cestas et Bordeaux ? Écrivez à l'Atelier Petita, réponse sous 48 heures.";

export const metadata = creerMetadataPage({
  titre: "Contact — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/contact",
});

export default function Contact() {
  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "Contact", chemin: "/contact" },
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
              <span className="text-petita-brick">Contact</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Contact
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
          </div>
        </div>

        <ContactForm />

        {/* Autres moyens de nous joindre */}
        <section className="mx-auto max-w-[760px] px-4 pb-16 sm:px-6 lg:pb-24">
          <div
            data-reveal
            className="flex flex-col items-center gap-5 rounded-xl border border-petita-gold/50 bg-petita-blush/60 p-6 text-center sm:p-10"
          >
            <h2 className="m-0 font-display text-[26px] font-semibold text-petita-brick sm:text-3xl">
              Suivez l’atelier
            </h2>
            <p className="m-0 max-w-[46ch]">
              Nos dernières trouvailles, les restaurations en cours et les pièces tout juste
              terminées sont à découvrir sur Instagram.
            </p>
            <a
              href="https://www.instagram.com/petita_lumieres/"
              target="_blank"
              rel="noopener"
              aria-label="Atelier Petita sur Instagram (nouvelle fenêtre)"
              className="inline-flex min-h-14 items-center gap-3 rounded-md bg-petita-brick px-7 py-4 font-display text-xl tracking-wide text-petita-cream no-underline hover:bg-petita-rose hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              <InstagramIcon size={24} />
              @petita_lumieres
            </a>

            <div className="my-1 h-0.5 w-15 bg-petita-gold" />

            <address className="not-italic text-petita-brown">
              <span className="block font-display text-lg font-semibold text-petita-brick">
                Atelier à Cestas, en Gironde
              </span>
              <span className="block">27 allée du Carretey — sur rendez-vous</span>
              <span className="block text-sm">
                Déplacements possibles dans la métropole bordelaise.
              </span>
            </address>

            <div className="flex flex-col items-center gap-1.5">
              <a
                href="mailto:petita-lumieres@protonmail.com"
                className="flex min-h-12 items-center font-display text-lg text-petita-brick"
              >
                petita-lumieres@protonmail.com
              </a>
              <a
                href="tel:+33613359497"
                className="flex min-h-12 items-center font-display text-lg text-petita-brick"
              >
                06 13 35 94 97
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
