const SERVICES = [
  {
    title: "Restauration de luminaires",
    text: "Nettoyage du verre, remise en état du laiton, câblage électrique neuf et douilles conformes.",
    icon: (
      <path d="M12 2v3M6 11h12l-3-6H9zM12 11v7M12 20a2 2 0 1 0 0 .01" />
    ),
  },
  {
    title: "Relooking de meubles",
    text: "Ponçage, peinture, pochoir et cires naturelles pour redonner du caractère à vos pièces.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="1.5" />
        <path d="M3 12h18M8 9.2v.1M8 14.8v.1M16 9.2v.1M16 14.8v.1" />
      </>
    ),
  },
  {
    title: "Intervention à domicile",
    text: "Nous nous déplaçons pour poser, mesurer et conseiller directement chez vous.",
    icon: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5.5 9.6V20h13V9.6" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
];

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
      <div data-reveal className="mb-11 flex flex-col items-center">
        <h2 className="m-0 text-center font-display text-[30px] font-semibold text-petita-brick sm:text-4xl lg:text-[44px]">
          Nos services
        </h2>
        <div className="mt-5 h-0.5 w-15 bg-petita-gold" />
      </div>
      <div data-reveal className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 sm:gap-8">
        {SERVICES.map((service) => (
          <article
            key={service.title}
            className="rounded-xl border border-petita-gold/55 bg-petita-cream p-7.5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(126,43,38,0.14)]"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C08A2E"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              {service.icon}
            </svg>
            <h3 className="my-4.5 font-display text-2xl text-petita-brick">{service.title}</h3>
            <p className="m-0">{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
