"use client";

import { useFormStatus } from "react-dom";
import { classeBoutonSecondaire } from "./ui";

export function BoutonSuppression({ titre }: { titre: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(evenement) => {
        if (
          !confirm(
            `Supprimer définitivement « ${titre} » ainsi que ses photos ?`,
          )
        ) {
          evenement.preventDefault();
        }
      }}
      className={classeBoutonSecondaire}
    >
      {pending ? "Suppression…" : "Supprimer définitivement"}
    </button>
  );
}
