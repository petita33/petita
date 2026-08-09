import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export const metadata: Metadata = {
  title: "Nos luminaires vendus — Atelier Petita",
  description:
    "Galerie des luminaires anciens restaurés qui ont trouvé leur maison. Une source d'inspiration pour découvrir notre savoir-faire.",
};

const luminairesVendus = [
  { id: 1, titre: "Lustre à pendeloques", epoque: "XIXe siècle", details: "Bronze doré · Cristal taillé" },
  { id: 2, titre: "Suspension émaillée bleue", epoque: "Années 1900", details: "Émail industriel · Câblage neuf" },
  { id: 3, titre: "Applique à bras articulé", epoque: "Années 1940", details: "Laiton massif · Abat-jour verre" },
  { id: 4, titre: "Plafonnier art nouveau", epoque: "Début XXe siècle", details: "Fer forgé · Verre soufflé" },
  { id: 5, titre: "Lampe à pétrole électrifiée", epoque: "Fin XIXe siècle", details: "Opaline blanche · Socle marbre" },
  { id: 6, titre: "Chandelier d'église", epoque: "XIXe siècle", details: "Bronze patiné · Huit bras" },
];

export default function LuminairesVendus() {
  return (
    <div className="overflow-x-hidden">
      <Header />

      <main>
        {/* En-tête de page */}
        <div className="bg-petita-cream/60 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-2 font-display text-sm text-petita-brown/70">
              <a href="/" className="no-underline hover:text-petita-brick">Accueil</a>
              <span aria-hidden="true">›</span>
              <span className="text-petita-brick">Nos luminaires vendus</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Nos luminaires vendus
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Ces pièces ont trouvé leur foyer. Une galerie pour s'inspirer et découvrir l'étendue de
              notre travail de restauration.
            </p>
          </div>
        </div>

        {/* Grille des luminaires */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {luminairesVendus.map((l) => (
              <article
                key={l.id}
                className="flex flex-col overflow-hidden rounded-xl border border-petita-gold/20 bg-petita-cream"
              >
                <div className="relative overflow-hidden">
                  <PlaceholderImage
                    ratio="aspect-[4/3]"
                    alt={l.titre}
                    label={`vendu ${l.id}`}
                    tone="sand"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-petita-brick/90 px-3.5 py-1 font-display text-sm text-petita-cream">
                    Vendu
                  </span>
                </div>
                <div className="flex flex-grow flex-col gap-2 p-5">
                  <h2 className="m-0 font-display text-xl font-semibold text-petita-brick">
                    {l.titre}
                  </h2>
                  <p className="m-0 font-display text-sm italic text-petita-rose">
                    {l.epoque}
                  </p>
                  <p className="m-0 text-sm text-petita-brown">
                    {l.details}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* CTA vers les pièces en vente */}
          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Vous avez un coup de cœur ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Découvrez nos pièces actuellement disponibles à la vente, ou contactez-nous pour nous parler de votre projet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/luminaires/en-vente"
                className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Voir les luminaires en vente
              </a>
              <a
                href="/#contact"
                className="inline-flex min-h-12 items-center rounded-md border border-petita-gold/60 px-8 py-3.5 font-display text-lg text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
