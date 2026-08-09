const ITEMS = [
  "Pièces uniques",
  "Restauration artisanale",
  "Envoi soigné et protégé",
  "Conseil personnalisé",
];

export function Reassurance() {
  return (
    <section className="border-y border-petita-gold/40 bg-petita-cream">
      <ul className="mx-auto grid max-w-7xl list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5.5 px-4 py-8.5 text-center sm:px-6 lg:px-10">
        {ITEMS.map((item) => (
          <li key={item} className="font-display text-[19px] text-petita-brick">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
