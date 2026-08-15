import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  creerMetadataPage,
  filArianeJsonLd,
  grapheSchema,
} from "@/lib/seo";

const DESCRIPTION =
  "Consultez les mentions légales d’Atelier Petita : éditeur, propriété intellectuelle, données personnelles et responsabilités.";

export const metadata = creerMetadataPage({
  titre: "Mentions légales — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/mentions-legales",
});

const sectionClasses = "flex flex-col gap-3";
const headingClasses =
  "m-0 font-display text-2xl font-semibold text-petita-brick sm:text-[1.75rem]";

export default function MentionsLegales() {
  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            { nom: "Mentions légales", chemin: "/mentions-legales" },
          ]),
        )}
      />
      <Header />

      <main>
        <div className="bg-petita-cream/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <nav
              aria-label="Fil d’Ariane"
              className="mb-6 flex items-center gap-2 font-display text-sm text-petita-brown/70"
            >
              <Link href="/" className="no-underline hover:text-petita-brick">
                Accueil
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-petita-brick">Mentions légales</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Mentions légales
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
          </div>
        </div>

        <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-10 rounded-2xl bg-petita-cream/70 p-6 shadow-[0_20px_55px_rgba(126,43,38,0.10)] sm:p-10 lg:p-12">
            <section className={sectionClasses} aria-labelledby="editeur">
              <h2 id="editeur" className={headingClasses}>
                Éditeur du site
              </h2>
              <address className="not-italic">
                <p className="m-0 font-semibold text-petita-brick">Philippe Lopez</p>
                <p className="m-0">Auto-entrepreneur</p>
                <p className="m-0">27 allée du Carretey à Cestas</p>
                <p className="m-0">
                  <a href="tel:+33613359497">06 13 35 94 97</a>
                </p>
                <p className="m-0 break-words">
                  <a href="mailto:petita-lumieres@protonmail.com">
                    petita-lumieres@protonmail.com
                  </a>
                </p>
              </address>
              <dl className="m-0 grid gap-x-4 gap-y-1 sm:grid-cols-[max-content_1fr]">
                <dt className="font-semibold text-petita-brick">SIRET</dt>
                <dd className="m-0">999 086 226 00019</dd>
                <dt className="font-semibold text-petita-brick">Code APE/NAF</dt>
                <dd className="m-0">9524Z</dd>
              </dl>
            </section>

            <section className={sectionClasses} aria-labelledby="propriete-intellectuelle">
              <h2 id="propriete-intellectuelle" className={headingClasses}>
                Propriété intellectuelle
              </h2>
              <p className="m-0">
                L’ensemble des contenus présents sur ce site (textes, images, logos, designs,
                etc.) est protégé par le droit d’auteur. Toute reproduction, représentation,
                modification, publication ou adaptation de tout ou partie des éléments du site,
                quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation
                écrite préalable de l’éditeur.
              </p>
            </section>

            <section className={sectionClasses} aria-labelledby="donnees-personnelles">
              <h2 id="donnees-personnelles" className={headingClasses}>
                Protection des données personnelles (RGPD)
              </h2>
              <p className="m-0">
                Les données personnelles collectées via ce site sont traitées conformément au
                Règlement Général sur la Protection des Données (RGPD). Elles sont utilisées
                uniquement pour répondre à vos demandes ou vous informer sur nos services.
              </p>
              <p className="m-0">
                Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation,
                d’opposition et de portabilité de vos données. Pour exercer ces droits,
                contactez-nous à l’adresse suivante :{" "}
                <a href="mailto:petita-lumieres@protonmail.com" className="break-words">
                  petita-lumieres@protonmail.com
                </a>
                .
              </p>
            </section>

            <section className={sectionClasses} aria-labelledby="conservation">
              <h2 id="conservation" className={headingClasses}>
                Durée de conservation
              </h2>
              <p className="m-0">
                Les données sont conservées pendant 3 ans à compter de leur collecte.
              </p>
            </section>

            <section className={sectionClasses} aria-labelledby="responsabilite">
              <h2 id="responsabilite" className={headingClasses}>
                Limitation de responsabilité
              </h2>
              <p className="m-0">
                Les informations contenues sur ce site sont fournies à titre indicatif et ne
                sauraient engager la responsabilité de l’éditeur en cas d’inexactitude,
                d’omission ou d’erreur. L’éditeur ne peut être tenu responsable des dommages
                directs ou indirects résultant de l’utilisation du site.
              </p>
            </section>

            <section className={sectionClasses} aria-labelledby="litiges">
              <h2 id="litiges" className={headingClasses}>
                Litiges
              </h2>
              <p className="m-0">En cas de litige, les tribunaux français seront seuls compétents.</p>
            </section>

            <section className={sectionClasses} aria-labelledby="mise-a-jour">
              <h2 id="mise-a-jour" className={headingClasses}>
                Mise à jour des mentions légales
              </h2>
              <p className="m-0">
                Ces mentions légales peuvent être modifiées à tout moment. Nous vous invitons à
                les consulter régulièrement.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
