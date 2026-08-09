"use client";

import { useActionState } from "react";
import { connexion } from "@/app/admin/actions";
import {
  classeBoutonPrincipal,
  classeChamp,
  classeErreur,
  classeLabel,
} from "./ui";

export function FormulaireConnexion({ suite }: { suite: string }) {
  const [etat, action, enCours] = useActionState(connexion, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="suite" value={suite} />

      <div>
        <label htmlFor="motDePasse" className={classeLabel}>
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className={classeChamp}
        />
      </div>

      {etat?.erreur ? (
        <p role="alert" className={classeErreur}>
          {etat.erreur}
        </p>
      ) : null}

      <button type="submit" disabled={enCours} className={classeBoutonPrincipal}>
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
