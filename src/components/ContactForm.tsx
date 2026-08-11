"use client";

import { useActionState } from "react";
import { envoyerContact } from "@/app/contact/actions";

const inputClasses =
  "rounded-md border border-petita-brown/45 bg-white px-4 py-3.5 font-body text-lg text-petita-brown focus-visible:border-petita-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold";

export function ContactForm() {
  const [etat, action, enCours] = useActionState(envoyerContact, undefined);
  // Après une action, React réinitialise le formulaire sur ses `defaultValue` :
  // les renvoyer en cas d'échec conserve la saisie, les omettre après un envoi
  // réussi vide les champs.
  const saisie = etat?.valeurs;

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
        action={action}
        className="flex flex-col gap-5.5 rounded-xl border border-petita-gold/50 bg-petita-cream p-6 sm:p-10"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="nom" className="font-display text-lg text-petita-brick">
            Votre nom
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            autoComplete="name"
            defaultValue={saisie?.nom}
            className={`min-h-12 ${inputClasses}`}
          />
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
            defaultValue={saisie?.email}
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
            defaultValue={saisie?.message}
            className={`resize-y leading-[1.6] ${inputClasses}`}
          />
        </div>

        {/* Leurre à robots : hors du flux et hors du parcours clavier, jamais
            vu ni atteint par un visiteur. Rempli ⇒ le message est ignoré. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="site">Ne remplissez pas ce champ</label>
          <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={enCours}
          className="min-h-14 rounded-md border-none bg-petita-brick px-7 py-4.5 font-display text-xl tracking-wide text-petita-cream hover:bg-petita-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-petita-gold disabled:opacity-70"
        >
          {enCours ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
        {/* Deux nœuds distincts (`key`) : un `role` qui change sur un élément
            réutilisé n'est pas annoncé de façon fiable par les lecteurs d'écran. */}
        {etat && !etat.ok ? (
          <p
            key="erreur"
            role="alert"
            className="m-0 rounded-md border border-petita-brick/40 bg-petita-brick/10 px-4 py-3 text-center text-[17px] text-petita-brick"
          >
            {etat.message}
          </p>
        ) : (
          <p key="statut" role="status" className="m-0 min-h-6 text-center text-[17px] text-petita-brick">
            {etat?.message ?? ""}
          </p>
        )}
      </form>
    </section>
  );
}
