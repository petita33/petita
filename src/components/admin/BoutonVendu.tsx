"use client";

import { BoutonConfirmation } from "./BoutonConfirmation";
import { classeBoutonCompact } from "./ui";

/**
 * Fait passer une annonce de la page « en vente » à la page « vendus ».
 *
 * `classe` complète le bouton compact, le temps que l'appelant l'accorde à sa
 * mise en page — pleine largeur dans une carte empilée, par exemple.
 */
export function BoutonVendu({
  titre,
  classe = "",
}: {
  titre: string;
  classe?: string;
}) {
  return (
    <BoutonConfirmation
      libelle="Marquer comme vendu"
      libelleEnCours="Déplacement…"
      classe={`${classeBoutonCompact} ${classe}`}
      titre="Marquer comme vendu ?"
      message={`« ${titre} » quittera la page « en vente » pour rejoindre les annonces vendues. Vous pourrez la remettre en vente en la modifiant.`}
      confirmation="Déplacer"
    />
  );
}
