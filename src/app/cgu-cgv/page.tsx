import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CGU / CGV — Atelier Petita",
  description:
    "Consultez les conditions générales d’utilisation et de vente d’Atelier Petita.",
};

const sectionClasses = "flex flex-col gap-3";
const headingClasses =
  "m-0 font-display text-2xl font-semibold text-petita-brick sm:text-[1.75rem]";
const listClasses = "m-0 flex list-disc flex-col gap-2 pl-6";

export default function CguCgv() {
  return (
    <div className="overflow-x-hidden">
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
              <span className="text-petita-brick">CGU / CGV</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              CGU / CGV
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
          </div>
        </div>

        <div className="mx-auto max-w-[920px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-14 rounded-2xl bg-petita-cream/70 p-6 shadow-[0_20px_55px_rgba(126,43,38,0.10)] sm:p-10 lg:p-12">
            <article className="flex flex-col gap-9" aria-labelledby="cgu">
              <div>
                <p className="m-0 mb-2 font-display text-sm font-semibold uppercase tracking-[0.18em] text-petita-gold-fonce">
                  Utilisation du site
                </p>
                <h2 id="cgu" className="m-0 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
                  Conditions Générales d’Utilisation (CGU)
                </h2>
              </div>

              <section className={sectionClasses} aria-labelledby="cgu-objet">
                <h3 id="cgu-objet" className={headingClasses}>
                  1. Objet
                </h3>
                <p className="m-0">
                  Les présentes CGU définissent les conditions d’utilisation du site Atelier
                  Petita (ci-après « le Site »), édité par Philippe Lopez, auto-entrepreneur.
                </p>
                <p className="m-0">
                  L’accès et l’utilisation du Site impliquent l’acceptation pleine et entière des
                  présentes CGU.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-acces">
                <h3 id="cgu-acces" className={headingClasses}>
                  2. Accès au Site
                </h3>
                <p className="m-0">
                  L’accès au Site est gratuit et ouvert à tout utilisateur disposant d’un accès à
                  Internet.
                </p>
                <p className="m-0">
                  L’éditeur se réserve le droit de modifier, suspendre ou interrompre l’accès au
                  Site à tout moment, sans préavis.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-propriete">
                <h3 id="cgu-propriete" className={headingClasses}>
                  3. Propriété intellectuelle
                </h3>
                <p className="m-0">
                  Tous les contenus du Site (textes, images, logos, designs, etc.) sont protégés
                  par le droit d’auteur et appartiennent à Philippe Lopez et Séverine Delmon.
                </p>
                <p className="m-0">
                  Toute reproduction, représentation ou utilisation non autorisée des contenus
                  du Site est interdite et constitue une contrefaçon.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-utilisateur">
                <h3 id="cgu-utilisateur" className={headingClasses}>
                  4. Responsabilité de l’utilisateur
                </h3>
                <p className="m-0">
                  L’utilisateur s’engage à utiliser le Site de manière licite et à ne pas porter
                  atteinte aux droits de tiers.
                </p>
                <p className="m-0">
                  Il est interdit d’utiliser le Site à des fins frauduleuses, malveillantes ou
                  contraires à l’ordre public.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-responsabilite">
                <h3 id="cgu-responsabilite" className={headingClasses}>
                  5. Limitation de responsabilité
                </h3>
                <p className="m-0">L’éditeur ne peut être tenu responsable :</p>
                <ul className={listClasses}>
                  <li>des dommages directs ou indirects résultant de l’utilisation du Site ;</li>
                  <li>des erreurs, omissions ou inexactitudes des informations publiées ;</li>
                  <li>des interruptions ou dysfonctionnements du Site.</li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-donnees">
                <h3 id="cgu-donnees" className={headingClasses}>
                  6. Données personnelles
                </h3>
                <p className="m-0">
                  Les données personnelles collectées via le Site (formulaire de contact,
                  newsletter, etc.) sont traitées conformément au RGPD.
                </p>
                <p className="m-0">
                  L’utilisateur dispose d’un droit d’accès, de rectification, d’effacement et
                  d’opposition à ses données. Pour exercer ces droits, contactez-nous à{" "}
                  <a href="mailto:petita-lumieres@protonmail.com" className="break-words">
                    petita-lumieres@protonmail.com
                  </a>
                  .
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-cookies">
                <h3 id="cgu-cookies" className={headingClasses}>
                  7. Cookies
                </h3>
                <p className="m-0">
                  Le Site utilise des cookies pour améliorer l’expérience utilisateur et analyser
                  le trafic. L’utilisateur peut désactiver les cookies dans les paramètres de son
                  navigateur.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-modification">
                <h3 id="cgu-modification" className={headingClasses}>
                  8. Modification des CGU
                </h3>
                <p className="m-0">
                  Les présentes CGU peuvent être modifiées à tout moment par l’éditeur.
                </p>
                <p className="m-0">
                  Les utilisateurs sont invités à consulter régulièrement cette page pour prendre
                  connaissance des éventuelles mises à jour.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgu-litiges">
                <h3 id="cgu-litiges" className={headingClasses}>
                  9. Droit applicable et litiges
                </h3>
                <p className="m-0">Les présentes CGU sont régies par le droit français.</p>
                <p className="m-0">
                  En cas de litige, les tribunaux français seront seuls compétents.
                </p>
              </section>
            </article>

            <div className="h-px bg-petita-gold/50" />

            <article className="flex flex-col gap-9" aria-labelledby="cgv">
              <div>
                <p className="m-0 mb-2 font-display text-sm font-semibold uppercase tracking-[0.18em] text-petita-gold-fonce">
                  Vente des créations
                </p>
                <h2 id="cgv" className="m-0 font-display text-3xl font-semibold text-petita-brick sm:text-4xl">
                  Conditions Générales de Vente (CGV)
                </h2>
              </div>

              <section className={sectionClasses} aria-labelledby="cgv-objet">
                <h3 id="cgv-objet" className={headingClasses}>
                  1. Objet
                </h3>
                <p className="m-0">
                  Les présentes CGV s’appliquent à toutes les ventes de luminaires réalisées par
                  Philippe Lopez, auto-entrepreneur, via les plateformes tierces (Vinted,
                  Leboncoin, etc.).
                </p>
                <p className="m-0">
                  Elles complètent les conditions générales des plateformes utilisées, qui
                  restent applicables en priorité.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-vendeur">
                <h3 id="cgv-vendeur" className={headingClasses}>
                  2. Identification du vendeur
                </h3>
                <p className="m-0">
                  Le vendeur est Philippe Lopez, auto-entrepreneur. Ses coordonnées et
                  informations d’immatriculation figurent dans les{" "}
                  <Link href="/mentions-legales">mentions légales</Link> du Site.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-produits">
                <h3 id="cgv-produits" className={headingClasses}>
                  3. Produits et prix
                </h3>
                <ul className={listClasses}>
                  <li>
                    Les produits proposés sont des luminaires artisanaux, décrits dans chaque
                    annonce.
                  </li>
                  <li>
                    Les prix sont indiqués en euros (TTC) et incluent les frais de commission des
                    plateformes.
                  </li>
                  <li>
                    Les frais de livraison sont précisés dans chaque annonce sur les plateformes
                    et sont à la charge de l’acheteur.
                  </li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-commande">
                <h3 id="cgv-commande" className={headingClasses}>
                  4. Commande et paiement
                </h3>
                <ul className={listClasses}>
                  <li>
                    Les commandes sont passées directement via la plateforme utilisée (Vinted,
                    Leboncoin, etc.).
                  </li>
                  <li>
                    Le paiement est sécurisé par la plateforme. Aucune transaction en direct
                    (hors plateforme) n’est autorisée.
                  </li>
                  <li>
                    La vente est considérée comme définitive après confirmation par la plateforme.
                  </li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-livraison">
                <h3 id="cgv-livraison" className={headingClasses}>
                  5. Livraison
                </h3>
                <ul className={listClasses}>
                  <li>Les délais de livraison sont indiqués dans chaque annonce.</li>
                  <li>
                    En cas de retard, l’acheteur sera informé via la messagerie de la plateforme.
                  </li>
                  <li>
                    Les frais de livraison et les risques liés au transport sont régis
                    conformément à chaque plateforme.
                  </li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-retractation">
                <h3 id="cgv-retractation" className={headingClasses}>
                  6. Droit de rétractation
                </h3>
                <ul className={listClasses}>
                  <li>
                    Conformément à la loi, l’acheteur dispose du délai prévu par chaque plateforme
                    pour se rétracter (sauf pour les produits personnalisés).
                  </li>
                  <li>Les frais de retour sont à la charge de l’acheteur.</li>
                  <li>Le remboursement sera effectué via la plateforme utilisée.</li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-garanties">
                <h3 id="cgv-garanties" className={headingClasses}>
                  7. Garanties légales
                </h3>
                <ul className={listClasses}>
                  <li>Garantie de conformité : 2 ans à compter de la livraison.</li>
                  <li>Garantie des vices cachés : conformément au Code civil.</li>
                  <li>Pour toute réclamation, contactez le vendeur via la plateforme.</li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-images">
                <h3 id="cgv-images" className={headingClasses}>
                  8. Droits d’utilisation des images après vente
                </h3>
                <p className="m-0">
                  L’acheteur reconnaît que le vendeur conserve le droit d’utiliser les images des
                  créations vendues (photographies, vidéos, etc.) à des fins de promotion,
                  notamment sur son site internet, ses réseaux sociaux, ses supports publicitaires
                  ou tout autre média.
                </p>
                <p className="m-0">
                  Ces images pourront être utilisées indéfiniment et sans limitation géographique,
                  dans le respect de la vie privée de l’acheteur (aucune mention de son identité ou
                  de son domicile ne sera publiée sans son accord explicite).
                </p>
                <p className="m-0">
                  En achetant une création, l’acheteur accepte cette utilisation et renonce à toute
                  réclamation ultérieure liée à l’exploitation de ces images.
                </p>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-donnees">
                <h3 id="cgv-donnees" className={headingClasses}>
                  9. Protection des données
                </h3>
                <ul className={listClasses}>
                  <li>
                    Les données personnelles des acheteurs sont traitées conformément au RGPD et
                    aux conditions des plateformes utilisées.
                  </li>
                  <li>
                    Pour exercer vos droits (accès, rectification, suppression), contactez :{" "}
                    <a href="mailto:petita-lumieres@protonmail.com" className="break-words">
                      petita-lumieres@protonmail.com
                    </a>
                    .
                  </li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-litiges">
                <h3 id="cgv-litiges" className={headingClasses}>
                  10. Litiges
                </h3>
                <ul className={listClasses}>
                  <li>
                    En cas de litige, une médiation pourra être proposée via la plateforme
                    concernée.
                  </li>
                  <li>À défaut, les tribunaux français seront compétents.</li>
                </ul>
              </section>

              <section className={sectionClasses} aria-labelledby="cgv-acceptation">
                <h3 id="cgv-acceptation" className={headingClasses}>
                  11. Acceptation des CGV
                </h3>
                <p className="m-0">
                  L’achat via une annonce implique l’acceptation des présentes CGV et des
                  conditions de la plateforme utilisée.
                </p>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
