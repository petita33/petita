import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Luminaires } from "@/components/Luminaires";
import { Meubles } from "@/components/Meubles";
import { Gallery } from "@/components/Gallery";
import { Testimonials } from "@/components/Testimonials";
import { Reassurance } from "@/components/Reassurance";
import { Services } from "@/components/Services";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { lireVisuels } from "@/lib/visuels-store";
import { lireAnnonces } from "@/lib/annonces-store";
import { dernieresVentes } from "@/lib/annonces";
import { creerMetadataPage } from "@/lib/seo";

const DESCRIPTION =
  "Des pièces anciennes chinées puis restaurées à la main dans notre atelier de Cestas : luminaires et meubles uniques en Gironde.";

export const metadata = creerMetadataPage({
  titre: "Atelier Petita — Luminaires & mobilier revisités",
  description: DESCRIPTION,
  chemin: "/",
});

// Copie CDN renouvelée au plus tard chaque heure ; les actions d'administration
// l'invalident immédiatement après une modification.
export const revalidate = 3600;

export default async function Home() {
  const [visuels, annonces] = await Promise.all([lireVisuels(), lireAnnonces()]);
  const ventes = dernieresVentes(annonces);

  return (
    <div className="overflow-x-hidden">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-100 focus:rounded-md focus:bg-petita-brick focus:px-4.5 focus:py-3 focus:text-petita-cream focus:no-underline"
      >
        Aller au contenu
      </a>

      <Header />

      <main id="contenu">
        <Hero visuels={visuels} />
        <About />
        <Luminaires visuels={visuels} />
        <Meubles visuels={visuels} />
        <Services />
        <Gallery ventes={ventes} />
        <Testimonials />
        <Reassurance />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
