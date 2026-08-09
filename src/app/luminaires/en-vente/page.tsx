import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export const metadata: Metadata = {
  title: "Nos luminaires en vente — Atelier Petita",
  description:
    "Découvrez notre sélection de luminaires anciens restaurés, disponibles à la vente. Pièces uniques remises aux normes à la main.",
};

const luminaires = [
  { id: 1, titre: "Suspension opaline festonnée", prix: "", details: "Câblage neuf · Laiton poli main" },
  { id: 2, titre: "Lustre bronze à cinq bras", prix: "", details: "Électrifié · Patine d'origine conservée" },
  { id: 3, titre: "Applique art déco", prix: "", details: "Verre moulé · Douille E27" },
  { id: 4, titre: "Lampe de bureau articulée", prix: "", details: "Métal laqué · Câble tissu" },
  { id: 5, titre: "Suspension cloche émaillée", prix: "", details: "Émail blanc · Câblage neuf" },
  { id: 6, titre: "Chandelier à pampilles", prix: "", details: "Cristal taillé · Or patiné" },
];

export default function LuminairesEnVente() {
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
              <span className="text-petita-brick">Nos luminaires en vente</span>
            </nav>
            <h1 className="m-0 font-display text-4xl font-semibold text-petita-brick sm:text-5xl">
              Luminaire ancien chiné en brocante, restauré et sublimé à quatre mains par l&apos;Atelier Petita — pièce unique
            </h1>
            <div className="my-5 h-0.5 w-16 bg-petita-gold" />
            <p className="m-0 max-w-[52ch] text-petita-brown">
              Écumant brocantes et vide-greniers, nous dénichons des pièces qui ont une âme.
              Lustres, appliques, suspensions… chacune renaît sous d'autres formes, entre nos quatre mains,
              avec patience et passion, pour devenir une création unique.
            </p>
          </div>
        </div>

        {/* Grille des luminaires */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {luminaires.map((l) => (
              <article
                key={l.id}
                className="flex flex-col overflow-hidden rounded-xl border border-petita-gold/20 bg-petita-cream transition-shadow hover:shadow-md"
              >
                <div className="overflow-hidden">
                  <PlaceholderImage
                    ratio="aspect-[4/3]"
                    alt={l.titre}
                    label={`luminaire ${l.id}`}
                  />
                </div>
                <div className="flex flex-grow flex-col gap-2 p-5">
                  <h2 className="m-0 font-display text-xl font-semibold text-petita-brick">
                    {l.titre}
                  </h2>
                  <p className="m-0 font-display text-lg font-semibold text-petita-gold">
                    € {l.prix}
                  </p>
                  <p className="m-0 text-sm text-petita-brown">
                    {l.details}
                  </p>
                  <div className="mt-auto pt-4">
                    <a
                      href="#contact"
                      className="inline-flex min-h-11 items-center rounded-md border border-petita-gold/60 px-5 py-2.5 font-display text-[15px] text-petita-brick no-underline hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
                    >
                      Nous contacter
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-petita-gold/30 bg-petita-cream p-8 text-center sm:p-12">
            <h2 className="m-0 font-display text-2xl font-semibold text-petita-brick">
              Vous cherchez une pièce particulière ?
            </h2>
            <p className="mx-auto my-4 max-w-[48ch] text-petita-brown">
              Contactez-nous pour nous décrire votre projet. Nous sélectionnons régulièrement de nouvelles pièces lors de nos chines.
            </p>
            <a
              href="/#contact"
              className="inline-flex min-h-12 items-center rounded-md bg-petita-brick px-8 py-3.5 font-display text-lg text-petita-cream no-underline hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              Nous écrire
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
