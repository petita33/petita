import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Luminaires } from "@/components/Luminaires";
import { Meubles } from "@/components/Meubles";
import { Gallery } from "@/components/Gallery";
import { Testimonials } from "@/components/Testimonials";
import { Reassurance } from "@/components/Reassurance";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";

export default function Home() {
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
        <Hero />
        <About />
        <Luminaires />
        <Meubles />
        <Gallery />
        <Testimonials />
        <Reassurance />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
