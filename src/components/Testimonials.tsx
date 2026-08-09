const TESTIMONIALS = [
  {
    quote:
      "Au top ! Très heureuse de mon achat ! Rapidité d'envoi, emballage impeccable et suspension superbe ! Merci",
    author: "Benedicte N. — Selency",
  },
  {
    quote: "Je suis ravie, si je vous avais trouvé avant, j'aurais tout acheté chez vous.",
    author: "Angélique pour Or Saison — Instagram",
  },
  {
    quote:
      "Deux fois que je fais un achat et toujours très satisfaite, Envoi soigné et toujours joli, je recommande, top !",
    author: "Marmotte 2408 — Vinted",
  },
  {
    quote: "Très jolie petite armoire, très joliment relookée, envoyée rapidement, merci beaucoup",
    author: "Cath — Le Bon Coin",
  },
  {
    quote:
      "La personne la plus patiente et compétente que j'aie jamais rencontrée dans ce domaine, elle a littéralement transformé un lustre, répondant à chacune de mes demandes jusque dans les moindres détails et créant un produit exactement comme je le souhaitais : splendide.",
    author: "Luanacly, Italie — Vinted",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
      <div data-reveal className="mb-11 flex flex-col items-center">
        <h2 className="m-0 text-center font-display text-[30px] font-semibold text-petita-brick sm:text-4xl lg:text-[44px]">
          Ce qu&apos;ils disent de nous
        </h2>
        <div className="mt-5 h-0.5 w-15 bg-petita-gold" />
      </div>
      <div data-reveal className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 snap-x snap-mandatory">
        {TESTIMONIALS.map((t) => (
          <blockquote
            key={t.author}
            className="m-0 flex w-[280px] flex-none flex-col gap-4 rounded-xl border border-petita-gold/45 bg-petita-cream p-6.5 snap-start lg:w-0 lg:flex-1"
          >
            <span aria-hidden="true" className="font-display text-5xl leading-[0.6] text-petita-gold">
              &ldquo;
            </span>
            <p className="m-0 text-[0.98em]">{t.quote}</p>
            <cite className="font-display text-base not-italic tracking-wide text-petita-brick">
              {t.author}
            </cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
