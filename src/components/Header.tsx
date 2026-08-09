"use client";

import { useState, useRef, useEffect } from "react";
import { Logo } from "./Logo";
import { InstagramIcon } from "./InstagramIcon";

const LUMINAIRES_SUBMENU = [
  { href: "/luminaires/en-vente", label: "Nos luminaires en vente" },
  { href: "/luminaires/vendus", label: "Nos luminaires vendus" },
];

const NAV_LINKS = [
  { href: "#meubles", label: "Meubles" },
  { href: "/apropos", label: "À propos" },
  { href: "#contact", label: "Contact" },
];

const navLinkClass =
  "flex min-h-12 items-center border-b-2 border-transparent px-2.5 py-3.5 font-display text-[17px] tracking-wide text-petita-brown no-underline [font-variant:small-caps] hover:border-petita-gold hover:text-petita-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lumOpen, setLumOpen] = useState(false);
  const [mobileLumOpen, setMobileLumOpen] = useState(false);
  const lumRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (lumRef.current && !lumRef.current.contains(e.target as Node)) {
        setLumOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-petita-gold/35 bg-petita-blush/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2.5 sm:px-6 lg:px-10">
          <a
            href="/"
            className="flex min-h-12 items-center gap-3.5 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petita-gold"
          >
            <Logo className="h-14 w-14 shrink-0" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[17px] font-bold tracking-[0.14em] text-petita-brick">
                ATELIER PETITA
              </span>
              <span className="font-display text-[11px] tracking-[0.24em] text-petita-rose">
                LUMIÈRE &amp; DÉCO
              </span>
            </span>
          </a>

          {/* Bouton burger mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            className="flex h-13 w-13 flex-col items-center justify-center gap-1.5 rounded-md border border-petita-gold/60 bg-transparent hover:bg-petita-gold/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold lg:hidden"
          >
            <span className="block h-0.5 w-6 bg-petita-brick" />
            <span className="block h-0.5 w-6 bg-petita-brick" />
            <span className="block h-0.5 w-6 bg-petita-brick" />
          </button>

          {/* Navigation desktop */}
          <nav
            aria-label="Navigation principale"
            className="hidden items-center justify-end gap-1 lg:flex lg:gap-3"
          >
            <a
              href="/#accueil"
              className={`${navLinkClass} border-petita-gold text-petita-brick`}
            >
              Accueil
            </a>

            {/* Luminaires avec dropdown */}
            <div ref={lumRef} className="relative">
              <button
                type="button"
                onClick={() => setLumOpen((v) => !v)}
                aria-expanded={lumOpen}
                aria-haspopup="true"
                className={`${navLinkClass} flex items-center gap-1.5`}
              >
                Luminaires
                <svg
                  viewBox="0 0 10 6"
                  className={`h-2.5 w-2.5 shrink-0 transition-transform duration-200 ${lumOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </button>

              {lumOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[240px] overflow-hidden rounded-xl border border-petita-gold/30 bg-petita-cream shadow-lg">
                  {LUMINAIRES_SUBMENU.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setLumOpen(false)}
                      className="flex min-h-11 items-center border-b border-petita-gold/15 px-5 font-display text-[15px] tracking-wide text-petita-brown no-underline last:border-b-0 hover:bg-petita-blush hover:text-petita-brick"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={navLinkClass}
              >
                {link.label}
              </a>
            ))}

            <a
              href="https://www.instagram.com/petita_lumieres/"
              target="_blank"
              rel="noopener"
              aria-label="Atelier Petita sur Instagram (nouvelle fenêtre)"
              className="ml-1.5 flex h-12 w-12 items-center justify-center rounded-full border border-petita-gold/60 text-petita-brick no-underline hover:border-petita-gold hover:bg-petita-gold hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
            >
              <InstagramIcon size={22} />
            </a>
          </nav>
        </div>
      </header>

      {/* Menu mobile plein écran */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-petita-blush px-4 pb-10 pt-5 sm:px-8 lg:hidden">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-14 w-14 items-center justify-center rounded-md border border-petita-gold/60 bg-transparent font-display text-3xl leading-none text-petita-brick hover:bg-petita-gold/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
            >
              ×
            </button>
          </div>

          <nav aria-label="Navigation mobile" className="mt-5 flex flex-col">
            <a
              href="/#accueil"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-15 items-center border-b border-petita-gold/35 px-1.5 font-display text-2xl leading-tight text-petita-brick no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
            >
              Accueil
            </a>

            {/* Luminaires accordéon mobile */}
            <div className="border-b border-petita-gold/35">
              <button
                type="button"
                onClick={() => setMobileLumOpen((v) => !v)}
                aria-expanded={mobileLumOpen}
                className="flex min-h-15 w-full items-center justify-between px-1.5 font-display text-2xl leading-tight text-petita-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
              >
                Luminaires
                <svg
                  viewBox="0 0 10 6"
                  className={`h-3 w-3 shrink-0 transition-transform duration-200 ${mobileLumOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </button>

              {mobileLumOpen && (
                <div className="mb-2 flex flex-col gap-1 pl-4">
                  {LUMINAIRES_SUBMENU.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center gap-3 px-1.5 font-display text-xl leading-tight text-petita-brown no-underline hover:text-petita-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
                    >
                      <span className="text-petita-gold text-base">—</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-15 items-center border-b border-petita-gold/35 px-1.5 font-display text-2xl leading-tight text-petita-brick no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
              >
                {link.label}
              </a>
            ))}

            <a
              href="https://www.instagram.com/petita_lumieres/"
              target="_blank"
              rel="noopener"
              className="flex min-h-15 items-center gap-3 px-1.5 font-display text-xl text-petita-rose no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
            >
              <InstagramIcon size={24} />
              Instagram
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
