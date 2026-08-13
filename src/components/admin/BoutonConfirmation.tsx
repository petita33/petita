"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { classeBoutonPrincipal, classeBoutonSecondaire } from "./ui";

type Props = {
  /** Bouton posé dans la page ; il ouvre la demande de confirmation. */
  libelle: string;
  /** Ce que dit ce même bouton pendant l'envoi. */
  libelleEnCours: string;
  /** Classes du bouton de la page — la modale, elle, a les siennes. */
  classe: string;
  titre: string;
  message: string;
  /** Bouton de la modale qui déclenche vraiment l'action. */
  confirmation: string;
};

/**
 * Bouton d'envoi qui demande confirmation dans une modale aux couleurs du site,
 * à la place du `confirm()` du navigateur.
 *
 * À placer dans le `<form>` de l'action : c'est lui qui est envoyé une fois la
 * confirmation donnée, et c'est son état qui met le bouton en attente.
 */
export function BoutonConfirmation({
  libelle,
  libelleEnCours,
  classe,
  titre,
  message,
  confirmation,
}: Props) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const declencheur = useRef<HTMLButtonElement>(null);
  const identifiantTitre = useId();
  const { pending } = useFormStatus();

  const fermer = () => dialogue.current?.close();

  return (
    <>
      <button
        ref={declencheur}
        // Volontairement `submit` : sans JavaScript, le bouton envoie le
        // formulaire comme avant. La confirmation est un garde-fou, elle n'est
        // jamais le seul chemin vers l'action.
        type="submit"
        disabled={pending}
        onClick={(evenement) => {
          evenement.preventDefault();
          dialogue.current?.showModal();
        }}
        className={classe}
      >
        {pending ? libelleEnCours : libelle}
      </button>

      <dialog
        ref={dialogue}
        aria-labelledby={identifiantTitre}
        // La boîte ne couvre pas tout l'écran : un clic à côté vise le
        // `<dialog>` lui-même, et vaut « annuler ».
        onClick={(evenement) => {
          if (evenement.target === dialogue.current) fermer();
        }}
        // `m-auto` recentre la boîte : le `preflight` de Tailwind remet à zéro
        // les marges, y compris celles qui centrent une modale native.
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-petita-gold/40 bg-petita-cream p-6 text-petita-brown shadow-2xl backdrop:bg-petita-brown/50 sm:p-8"
      >
        <h2
          id={identifiantTitre}
          className="m-0 font-display text-2xl font-semibold text-petita-brick"
        >
          {titre}
        </h2>
        <p className="mb-0 mt-3 text-[15px] leading-relaxed">{message}</p>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          {/* « Annuler » d'abord : c'est lui que `showModal()` met au clavier. */}
          <button type="button" onClick={fermer} className={classeBoutonSecondaire}>
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              fermer();
              declencheur.current?.form?.requestSubmit();
            }}
            className={classeBoutonPrincipal}
          >
            {confirmation}
          </button>
        </div>
      </dialog>
    </>
  );
}
