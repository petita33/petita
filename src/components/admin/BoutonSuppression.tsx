"use client";

import { BoutonConfirmation } from "./BoutonConfirmation";
import { classeBoutonSecondaire } from "./ui";

export function BoutonSuppression({ titre }: { titre: string }) {
  return (
    <BoutonConfirmation
      libelle="Supprimer définitivement"
      libelleEnCours="Suppression…"
      classe={classeBoutonSecondaire}
      titre="Supprimer définitivement ?"
      message={`« ${titre} » et ses photos seront effacées du site et du stockage. Rien ne permettra de les récupérer.`}
      confirmation="Supprimer"
    />
  );
}
