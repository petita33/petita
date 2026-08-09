import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { sessionActive } from "@/lib/session";
import { deconnexion } from "./actions";

export const metadata: Metadata = {
  title: "Administration — Atelier Petita",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connecte = await sessionActive();

  return (
    <div className="min-h-screen bg-petita-blush">
      {connecte ? (
        <header className="border-b border-petita-gold/35 bg-petita-cream">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <a
              href="/admin"
              className="flex min-h-12 items-center gap-3 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petita-gold"
            >
              <Logo className="h-11 w-11 shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-[15px] font-bold tracking-[0.14em] text-petita-brick">
                  ATELIER PETITA
                </span>
                <span className="font-display text-[11px] tracking-[0.24em] text-petita-rose">
                  ADMINISTRATION
                </span>
              </span>
            </a>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="flex min-h-11 items-center rounded-md px-3 font-display text-[15px] text-petita-brown no-underline hover:text-petita-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
              >
                Voir le site
              </a>
              <form action={deconnexion}>
                <button
                  type="submit"
                  className="flex min-h-11 items-center rounded-md border border-petita-gold/60 px-4 font-display text-[15px] text-petita-brick hover:bg-petita-brick hover:text-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
                >
                  Se déconnecter
                </button>
              </form>
            </div>
          </div>
        </header>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
