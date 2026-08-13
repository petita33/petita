"use client";

import { BoutonConfirmation } from "./BoutonConfirmation";
import { classeBoutonCompact } from "./ui";

/** Fait passer une annonce de la page « en vente » à la page « vendus ». */
export function BoutonVendu({ titre }: { titre: string }) {
  return (
    <BoutonConfirmation
      libelle="Marquer comme vendu"
      libelleEnCours="Déplacement…"
      classe={classeBoutonCompact}
      titre="Marquer comme vendu ?"
      message={`« ${titre} » quittera la page « en vente » pour rejoindre les annonces vendues. Vous pourrez la remettre en vente en la modifiant.`}
      confirmation="Déplacer"
    />
  );
}
