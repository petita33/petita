import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import {
  creerMetadataPage,
  filArianeJsonLd,
  grapheSchema,
} from "@/lib/seo";

const DESCRIPTION =
  "Politique de confidentialité d’Atelier Petita : données collectées, finalités, prestataires, durées et droits RGPD.";

export const metadata = creerMetadataPage({
  titre: "Politique de confidentialité — Atelier Petita",
  description: DESCRIPTION,
  chemin: "/politique-confidentialite",
});

const sectionClasses = "flex scroll-mt-8 flex-col gap-3";
const headingClasses =
  "m-0 font-display text-2xl font-semibold text-petita-brick sm:text-[1.75rem]";
const subheadingClasses =
  "mb-0 mt-2 font-display text-xl font-semibold text-petita-brick";
const listClasses = "m-0 flex list-disc flex-col gap-2 pl-6";

export default function PolitiqueConfidentialite() {
  return (
    <div className="overflow-x-hidden">
      <JsonLd
        data={grapheSchema(
          filArianeJsonLd([
            { nom: "Accueil", chemin: "/" },
            {
              nom: "Politique de confidentialité",
              chemin: "/politique-confidentialite",
            },
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
              <span className="text-petita-brick">Politique de confidentialité</span>
            </nav>
            <h1 className="m-0 max-w-[18ch] font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Politique de confidentialité
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 text-base text-petita-brown/80">
              Version 1.1 — publiée le 16 août 2026
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[920px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="flex flex-col gap-10 rounded-2xl bg-petita-cream/70 p-6 shadow-[0_20px_55px_rgba(126,43,38,0.10)] sm:p-10 lg:p-12">
            <p className="m-0 text-lg">
              Cette politique explique quelles données sont utilisées sur le site
              Atelier Petita, pourquoi, pendant combien de temps et comment exercer
              vos droits. Les données du formulaire ne sont pas réutilisées pour
              envoyer de la publicité ou une newsletter.
            </p>

            <nav
              aria-label="Sommaire de la politique"
              className="rounded-lg border border-petita-gold/40 bg-white/50 p-5"
            >
              <p className="m-0 font-display text-lg font-semibold text-petita-brick">
                Accès rapide
              </p>
              <ul className="mb-0 mt-3 grid gap-2 pl-5 sm:grid-cols-2">
                <li><a href="#responsable">Responsable du traitement</a></li>
                <li><a href="#contact">Formulaire de contact</a></li>
                <li><a href="#technique">Fonctionnement et sécurité</a></li>
                <li><a href="#mesures">Mesures anonymes</a></li>
                <li><a href="#destinataires">Prestataires et transferts</a></li>
                <li><a href="#droits">Vos droits</a></li>
              </ul>
            </nav>

            <section id="responsable" className={sectionClasses} aria-labelledby="titre-responsable">
              <h2 id="titre-responsable" className={headingClasses}>
                1. Responsable du traitement
              </h2>
              <p className="m-0">
                Le responsable du traitement est Philippe Lopez, entrepreneur
                individuel exploitant Atelier Petita, 27 allée du Carretey,
                33610 Cestas.
              </p>
              <p className="m-0">
                Contact pour toute question ou demande relative aux données :{" "}
                <a href="mailto:petita-lumieres@protonmail.com" className="break-words">
                  petita-lumieres@protonmail.com
                </a>
                .
              </p>
              <p className="m-0">
                Atelier Petita n’a pas désigné de délégué à la protection des
                données, son activité actuelle n’entrant pas dans les cas où cette
                désignation est obligatoire.
              </p>
            </section>

            <section id="contact" className={sectionClasses} aria-labelledby="titre-contact">
              <h2 id="titre-contact" className={headingClasses}>
                2. Répondre à votre demande
              </h2>
              <h3 className={subheadingClasses}>Données et caractère obligatoire</h3>
              <p className="m-0">
                Le formulaire recueille votre adresse e-mail et votre message,
                nécessaires pour comprendre la demande et vous répondre. Sans eux,
                aucune réponse n’est possible. Le nom est facultatif. Merci de ne
                transmettre aucune donnée sensible ni donnée concernant un tiers
                dans le texte libre.
              </p>
              <h3 className={subheadingClasses}>Finalité et base légale</h3>
              <p className="m-0">
                Pour une demande de devis ou de prestation, le traitement est
                nécessaire aux mesures précontractuelles prises à votre demande
                (article 6, paragraphe 1, b du RGPD). Pour une question générale,
                il repose sur l’intérêt légitime d’Atelier Petita à recevoir la
                demande et à y répondre (article 6, paragraphe 1, f).
              </p>
              <h3 className={subheadingClasses}>Destinataires et conservation</h3>
              <p className="m-0">
                Le message est accessible à Atelier Petita et transite par Vercel,
                Resend puis la messagerie Proton Mail. Resend annonce conserver une
                copie technique pendant 30 jours. Si la demande ne débouche pas sur
                une relation commerciale, la conversation est supprimée de la boîte
                de réception au plus tard six mois après le dernier échange.
              </p>
              <p className="m-0">
                Si une prestation est préparée ou conclue, seuls les échanges
                nécessaires à son exécution, au respect d’une obligation légale ou
                à la défense de droits sont conservés pendant la relation, puis
                pendant le délai légal applicable. Ils sont alors séparés des
                demandes courantes et leur accès est limité.
              </p>
            </section>

            <section id="technique" className={sectionClasses} aria-labelledby="titre-technique">
              <h2 id="titre-technique" className={headingClasses}>
                3. Fournir et sécuriser le site
              </h2>
              <p className="m-0">
                Lors d’une visite, Vercel traite les informations nécessaires pour
                servir la page et protéger le service : adresse IP, date et heure,
                URL demandée, navigateur, système, statut de réponse et événements
                techniques. La base légale est l’intérêt légitime d’Atelier Petita
                à exploiter un site disponible, diagnostiquer une panne et lutter
                contre les abus.
              </p>
              <p className="m-0">
                Les journaux applicatifs accessibles à Atelier Petita sont
                conservés selon le forfait Vercel actif, au maximum 30 jours. Les
                repères anti-abus créés par l’application sont des empreintes
                temporaires et non réversibles : 15 minutes pour les compteurs et
                30 minutes pour reconnaître un message identique. Ils disparaissent
                au redémarrage de l’instance s’il survient avant.
              </p>
              <p className="m-0">
                L’espace d’administration utilise un cookie de session strictement
                nécessaire, nommé <code>petita_admin</code>, réservé à
                l’administrateur, protégé contre la lecture par JavaScript et
                valable au maximum 30 jours. Il n’est pas utilisé à des fins
                publicitaires ou de mesure d’audience.
              </p>
            </section>

            <section id="mesures" className={sectionClasses} aria-labelledby="titre-mesures">
              <h2 id="titre-mesures" className={headingClasses}>
                4. Mesures d’audience et de performance anonymes
              </h2>
              <p className="m-0">
                Vercel Web Analytics mesure les pages consultées, le référent, des
                caractéristiques du navigateur et de l’appareil ainsi qu’une
                géolocalisation approximative. Vercel Speed Insights reçoit des
                mesures de performance réelles (Web Vitals), sur un échantillon de
                20 % des visites publiques. Les paramètres et fragments des URL
                sont retirés, aucun événement personnalisé n’est envoyé et les
                routes <code>/admin</code> et <code>/api</code> sont exclues avant
                tout envoi.
              </p>
              <p className="m-0">
                Vercel indique que les points de données de ces deux outils sont
                anonymes, ne sont associés ni à une personne ni à son adresse IP et
                ne permettent pas de reconstituer sa navigation entre plusieurs
                sites. Atelier Petita les utilise uniquement pour produire ses
                propres statistiques d’audience et de performance, sans publicité,
                profilage ni suivi individuel ou entre sites.
              </p>
              <p className="m-0">
                Dans cette configuration strictement limitée, Atelier Petita retient
                l’exemption de consentement prévue pour la mesure d’audience par
                l’article 82 de la loi Informatique et Libertés. Aucun bandeau ni
                choix préalable n’est donc affiché. Cette décision n’est pas une
                certification de la CNIL et doit être réexaminée si l’outil, sa
                configuration, ses finalités ou ses destinataires changent.
              </p>
              <p className="m-0">
                D’après Vercel, Web Analytics n’utilise pas de cookie tiers et
                remplace son empreinte quotidienne après 24 heures. La fenêtre de
                consultation des statistiques agrégées dépend du forfait : de 1 à
                24 mois pour Web Analytics et de 7 à 90 jours pour Speed Insights.
              </p>
            </section>

            <section id="catalogue" className={sectionClasses} aria-labelledby="titre-catalogue">
              <h2 id="titre-catalogue" className={headingClasses}>
                5. Contenus et photographies du catalogue
              </h2>
              <p className="m-0">
                Les descriptions et photographies des créations sont publiées
                jusqu’à leur retrait par Atelier Petita. Les images sont décodées,
                redimensionnées et réencodées avant publication afin de retirer le
                nom du fichier et les métadonnées EXIF, dont les coordonnées GPS.
              </p>
              <p className="m-0">
                Les photographies ne doivent pas montrer une personne identifiable,
                une plaque, une adresse ou un document privé sans motif et
                information appropriés. Une version technique précédente du
                catalogue peut subsister le temps de vider les caches ; elle est
                purgée quotidiennement dès qu’elle a plus de 24 heures.
              </p>
            </section>

            <section id="destinataires" className={sectionClasses} aria-labelledby="titre-destinataires">
              <h2 id="titre-destinataires" className={headingClasses}>
                6. Destinataires, sous-traitants et transferts
              </h2>
              <ul className={listClasses}>
                <li>
                  <strong>Vercel Inc. (États-Unis)</strong> : hébergement,
                  fonctions, journaux, stockage Blob, Analytics et Speed Insights.
                </li>
                <li>
                  <strong>Plus Five Five, Inc., opérant Resend
                  (États-Unis)</strong> : transmission du formulaire vers la boîte
                  de réception.
                </li>
                <li>
                  <strong>Proton AG (Suisse)</strong> : messagerie qui reçoit et
                  conserve les échanges selon la durée décrite plus haut.
                </li>
              </ul>
              <p className="m-0">
                Vercel et Resend annoncent des traitements aux États-Unis et
                auprès de sous-traitants situés dans plusieurs pays. Leurs accords
                de traitement intègrent les clauses contractuelles types de la
                Commission européenne pour les transferts qui les nécessitent.
                Proton traite le service en Suisse, pays reconnu comme assurant un
                niveau de protection adéquat par la Commission européenne.
              </p>
              <p className="m-0">
                Vous pouvez demander une copie des garanties applicables à{" "}
                <a href="mailto:petita-lumieres@protonmail.com" className="break-words">
                  petita-lumieres@protonmail.com
                </a>
                . Les secrets commerciaux ou informations de sécurité peuvent être
                masqués dans la copie communiquée.
              </p>
            </section>

            <section id="droits" className={sectionClasses} aria-labelledby="titre-droits">
              <h2 id="titre-droits" className={headingClasses}>
                7. Vos droits
              </h2>
              <p className="m-0">
                Selon le traitement et les conditions prévues par le RGPD, vous
                pouvez demander l’accès à vos données, leur rectification, leur
                effacement, la limitation de leur utilisation, vous opposer au
                traitement fondé sur l’intérêt légitime et exercer votre droit à
                la portabilité. Vous pouvez retirer à tout moment un consentement,
                sans remettre en cause les traitements déjà effectués licitement.
              </p>
              <p className="m-0">
                Envoyez votre demande à{" "}
                <a href="mailto:petita-lumieres@protonmail.com" className="break-words">
                  petita-lumieres@protonmail.com
                </a>
                . Une pièce d’identité n’est demandée qu’en cas de doute raisonnable
                et uniquement dans la mesure nécessaire. Atelier Petita répond en
                principe sous un mois.
              </p>
              <p className="m-0">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez
                introduire une réclamation auprès de la{" "}
                <a href="https://www.cnil.fr/fr/plaintes" rel="external">
                  Commission nationale de l’informatique et des libertés (CNIL)
                </a>
                .
              </p>
              <p className="m-0">
                Aucun profilage ni aucune décision produisant un effet juridique
                n’est réalisé automatiquement à partir de vos données.
              </p>
            </section>

            <section className={sectionClasses} aria-labelledby="titre-modifications">
              <h2 id="titre-modifications" className={headingClasses}>
                8. Modifications de cette politique
              </h2>
              <p className="m-0">
                La date et le numéro de version figurent en haut de la page. Une
                modification substantielle des finalités, outils ou destinataires
                entraîne une nouvelle information et, lorsque nécessaire, un
                nouveau choix avant toute collecte.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
