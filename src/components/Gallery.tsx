import { PlaceholderImage } from "./PlaceholderImage";

const VENTES = [
  { label: "Lampe bleu opalescent", alt: "Lampe à globe bleu opalescent posée sur une table en bois" },
  { label: "Lampe danseuse", alt: "Lampe danseuse en bronze avec tulipe en verre dépoli" },
  { label: "Table en noyer", alt: "Table ronde en noyer dressée dans un jardin" },
  {
    label: "Buffet Art déco",
    alt: "Buffet Art déco en chêne clair sculpté, dans un intérieur lumineux",
  },
];

export function Gallery() {
  return (
    <section id="ventes" className="bg-petita-rose text-petita-cream">
      <div data-reveal className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-[90px]">
        <div className="mb-11 flex flex-col items-center">
          <h2 className="m-0 text-center font-display text-[30px] font-semibold text-petita-cream sm:text-4xl lg:text-[44px]">
            Nos dernières ventes
          </h2>
          <div className="mt-5 h-0.5 w-15 bg-petita-gold" />
        </div>
        <div className="flex snap-x snap-mandatory gap-4.5 overflow-x-auto pb-1.5 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 lg:gap-7">
          {VENTES.map((item) => (
            <figure key={item.label} className="m-0 min-w-[min(78vw,260px)] snap-start sm:min-w-0">
              <div className="overflow-hidden rounded-xl">
                <PlaceholderImage ratio="aspect-[3/4]" tone="rose" alt={item.alt} />
              </div>
              <figcaption className="relative -mt-5.5 rounded-md bg-petita-cream px-3 py-3.5 text-center font-display text-[19px] text-petita-brick shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
