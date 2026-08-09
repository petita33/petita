"use client";

import { useActionState, useState } from "react";
import { enregistrerAnnonce } from "@/app/admin/actions";
import { CATEGORIES, CATEGORIES_ORDRE, type Annonce } from "@/lib/annonces";
import { ChampImages } from "./ChampImages";
import {
  classeAide,
  classeBoutonPrincipal,
  classeBoutonSecondaire,
  classeChamp,
  classeErreur,
  classeLabel,
} from "./ui";

export function FormulaireAnnonce({ annonce }: { annonce?: Annonce }) {
  const [etat, action, enCours] = useActionState(enregistrerAnnonce, undefined);
  const [images, setImages] = useState<string[]>(annonce?.images ?? []);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-8">
      {annonce ? <input type="hidden" name="id" value={annonce.id} /> : null}

      <div>
        <label htmlFor="titre" className={classeLabel}>
          Titre
        </label>
        <input
          id="titre"
          name="titre"
          type="text"
          required
          maxLength={120}
          defaultValue={annonce?.titre}
          placeholder="Suspension opaline festonnée"
          className={classeChamp}
        />
      </div>

      <div>
        <label htmlFor="description" className={classeLabel}>
          Description
        </label>
        <p className={classeAide}>
          Matières, dimensions, époque, travaux réalisés… Les retours à la ligne
          sont conservés.
        </p>
        <textarea
          id="description"
          name="description"
          rows={7}
          maxLength={4000}
          defaultValue={annonce?.description}
          placeholder="Chinée en brocante puis entièrement remise aux normes : câblage neuf, douille E27, laiton poli à la main."
          className={`${classeChamp} resize-y`}
        />
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className={`${classeLabel} p-0`}>Emplacement sur le site</legend>
        <p className={classeAide}>La page sur laquelle l&apos;annonce apparaîtra.</p>
        <div className="mt-3 flex flex-col gap-2">
          {CATEGORIES_ORDRE.map((categorie, index) => (
            <label
              key={categorie}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-petita-gold/40 bg-petita-cream px-4 py-3 font-display text-[17px] text-petita-brown hover:border-petita-gold has-checked:border-petita-brick has-checked:text-petita-brick"
            >
              <input
                type="radio"
                name="categorie"
                value={categorie}
                required
                defaultChecked={
                  annonce ? annonce.categorie === categorie : index === 0
                }
                className="h-4 w-4 accent-petita-brick"
              />
              {CATEGORIES[categorie].label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="prix" className={classeLabel}>
          Prix <span className="font-normal text-petita-brown/70">(facultatif)</span>
        </label>
        <p className={classeAide}>
          Laissez vide pour ne rien afficher. Jamais affiché sur la page
          « Luminaires vendus ».
        </p>
        <div className="relative">
          <input
            id="prix"
            name="prix"
            type="text"
            inputMode="decimal"
            defaultValue={annonce?.prix ?? ""}
            placeholder="120"
            className={`${classeChamp} pr-10`}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center pt-2 font-display text-petita-brown/70"
          >
            €
          </span>
        </div>
      </div>

      <ChampImages
        images={images}
        setImages={setImages}
        onOccupeChange={setEnvoiEnCours}
      />

      {etat?.erreur ? (
        <p role="alert" className={classeErreur}>
          {etat.erreur}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours || envoiEnCours}
          className={classeBoutonPrincipal}
        >
          {enCours
            ? "Enregistrement…"
            : annonce
              ? "Enregistrer les modifications"
              : "Publier l'annonce"}
        </button>
        <a href="/admin" className={classeBoutonSecondaire}>
          Annuler
        </a>
        {envoiEnCours ? (
          <span className="font-display text-[15px] text-petita-brown">
            Envoi des photos en cours…
          </span>
        ) : null}
      </div>
    </form>
  );
}
