export function About() {
  return (
    <section
      id="apropos"
      className="border-y border-petita-gold/30 bg-petita-cream"
    >
      <div
        data-reveal
        className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-10 lg:py-[90px]"
      >
        <h2 className="m-0 max-w-[22ch] text-balance font-display text-3xl font-semibold leading-[1.25] text-petita-brick sm:text-4xl lg:text-[42px]">
          Éclairer avec goût c&apos;est tout un Art.
          <br />
          Meubler avec élégance c&apos;est toute une histoire.
        </h2>
        <div className="my-6.5 h-0.5 w-15 bg-petita-gold" />
        <div className="flex max-w-[65ch] flex-col gap-4.5 text-left text-[1.02em]">
          <p className="m-0">
            Passionnés de luminaires anciens, nous chinons et restaurons des pièces uniques : opalines
            délicates, verres de Clichy, tulipes gracieuses et globes soufflés. Festonnés, bullés,
            ambrés ou irisés… chaque abat-jour transforme la lumière en émotion.
          </p>
          <p className="m-0">
            Nous donnons une seconde vie aux lustres, appliques et lampes vintage en les revisitant avec soin.
          </p>
          <p className="m-0">
            Tout aussi attachés aux vieux meubles, nous les restaurons avec patience : ponçage, peinture,
            pochoir, grattoir et cires naturelles. Armoires, buffets, tables, coiffeuses ou chevets
            reprennent vie pour apporter du caractère à votre intérieur.
          </p>
        </div>
      </div>
    </section>
  );
}
