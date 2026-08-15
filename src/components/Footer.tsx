import { Logo } from "./Logo";
import { InstagramIcon } from "./InstagramIcon";
import Link from "next/link";

const linkClasses =
  "flex min-h-12 items-center text-petita-blush no-underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold";

export function Footer() {
  return (
    <footer className="bg-petita-rose text-petita-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-9 px-4 py-10 sm:px-6 lg:px-10 lg:py-[72px]">
        <div className="flex flex-col gap-3.5">
          <Logo className="h-19 w-19 rounded-lg bg-petita-cream p-1.5" />
          <p className="m-0 font-display text-[15px] tracking-[0.14em]">
            ATELIER PETITA — LUMIÈRE &amp; DÉCO
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="m-0 mb-1.5 font-display text-xl text-petita-cream">Nous joindre</h3>
          <a href="mailto:petita-lumieres@protonmail.com" className={linkClasses}>
            petita-lumieres@protonmail.com
          </a>
          <a href="tel:+33613359497" className={linkClasses}>
            06 13 35 94 97
          </a>
          <a href="https://www.instagram.com/petita_lumieres/" target="_blank" rel="noopener" className={`gap-2.5 ${linkClasses}`}>
            <InstagramIcon size={20} />
            Instagram
          </a>
        </div>

        <nav aria-label="Plan du site" className="flex flex-col gap-2.5">
          <h3 className="m-0 mb-1.5 font-display text-xl text-petita-cream">Plan du site</h3>
          <Link href="/luminaires/en-vente" className={linkClasses}>
            Voir tous les luminaires
          </Link>
          <Link href="/meubles/en-vente" className={linkClasses}>
            Voir tous les meubles
          </Link>
          <Link href="/en-cours" className={linkClasses}>
            En cours de rénovation
          </Link>
          <Link href="/apropos" className={linkClasses}>
            Notre histoire
          </Link>
        </nav>

        <div className="flex flex-col gap-2.5">
          <h3 className="m-0 mb-1.5 font-display text-xl text-petita-cream">Informations</h3>
          <Link href="/mentions-legales" className={linkClasses}>
            Mentions légales
          </Link>
          <Link href="/cgu-cgv" className={linkClasses}>
            CGU / CGV
          </Link>
          <p className="mb-0 mt-2 text-[15px] text-petita-blush">© 2026 Atelier Petita</p>
        </div>
      </div>
    </footer>
  );
}
