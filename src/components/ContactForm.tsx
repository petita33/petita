"use client";

import { useState } from "react";

const inputClasses =
  "rounded-md border border-petita-brown/45 bg-white px-4 py-3.5 font-body text-lg text-petita-brown focus-visible:border-petita-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold";

export function ContactForm() {
  const [statut, setStatut] = useState("");

  return (
    <section id="contact" className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <div data-reveal className="mb-10 flex flex-col items-center text-center">
        <h2 className="m-0 font-display text-[30px] font-semibold text-petita-brick sm:text-4xl lg:text-[44px]">
          Parlons de votre pièce
        </h2>
        <div className="my-5 h-0.5 w-15 bg-petita-gold" />
        <p className="m-0 max-w-[52ch]">
          Une lampe à remettre en état, un meuble à relooker, une envie encore floue ? Écrivez-nous,
          nous répondons sous 48 heures.
        </p>
      </div>
      <form
        data-reveal
        onSubmit={(e) => {
          e.preventDefault();
          setStatut("Merci, votre message est bien parti. Nous répondons sous 48 heures.");
        }}
        className="flex flex-col gap-5.5 rounded-xl border border-petita-gold/50 bg-petita-cream p-6 sm:p-10"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="nom" className="font-display text-lg text-petita-brick">
            Votre nom
          </label>
          <input id="nom" name="nom" type="text" required autoComplete="name" className={`min-h-12 ${inputClasses}`} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-display text-lg text-petita-brick">
            Votre adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`min-h-12 ${inputClasses}`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="font-display text-lg text-petita-brick">
            Votre message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className={`resize-y leading-[1.6] ${inputClasses}`}
          />
        </div>
        <button
          type="submit"
          className="min-h-14 rounded-md border-none bg-petita-brick px-7 py-4.5 font-display text-xl tracking-wide text-petita-cream hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold"
        >
          Envoyer ma demande
        </button>
        <p role="status" className="m-0 min-h-6 text-center text-[17px] text-petita-brick">
          {statut}
        </p>
      </form>
    </section>
  );
}
