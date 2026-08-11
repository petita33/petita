"use client";

import { useActionState, useState } from "react";
import { enregistrerAnnonce } from "@/app/admin/actions";
import {
  categoriesDuGroupe,
  CATEGORIES,
  GROUPES,
  GROUPES_ORDRE,
  type Annonce,
  type Groupe,
} from "@/lib/annonces";
import { FORMAT_PAR_DEFAUT, type FormatImage } from "@/lib/formats";
import { ChampImages } from "./ChampImages";
import {
  classeAide,
  classeBoutonPrincipal,
  classeBoutonSecondaire,
  classeChamp,
  classeErreur,
  classeLabel,
} from "./ui";

/**
 * `groupe` ne restreint pas les emplacements proposés — une pièce sortie de
 * l'atelier doit pouvoir passer en vente sans être ressaisie — il décide
 * seulement de l'emplacement présélectionné à la création.
 */
export function FormulaireAnnonce({
  annonce,
  groupe = "annonces",
}: {
  annonce?: Annonce;
  groupe?: Groupe;
}) {
  const [etat, action, enCours] = useActionState(enregistrerAnnonce, undefined);
  const categorieParDefaut = annonce?.categorie ?? categoriesDuGroupe(groupe)[0];
  const [images, setImages] = useState<string[]>(annonce?.images ?? []);
  const [format, setFormat] = useState<FormatImage>(
    annonce?.format ?? FORMAT_PAR_DEFAUT,
  );
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
        <div className="mt-3 flex flex-col gap-6">
          {GROUPES_ORDRE.map((cle) => (
            <fieldset key={cle} className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 font-display text-sm uppercase tracking-[0.12em] text-petita-brown/70">
                {GROUPES[cle].titre}
              </legend>
              <div className="flex flex-col gap-2">
                {categoriesDuGroupe(cle).map((categorie) => (
                  <label
                    key={categorie}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-petita-gold/40 bg-petita-cream px-4 py-3 font-display text-[17px] text-petita-brown hover:border-petita-gold has-checked:border-petita-brick has-checked:text-petita-brick"
                  >
                    <input
                      type="radio"
                      name="categorie"
                      value={categorie}
                      required
                      defaultChecked={categorie === categorieParDefaut}
                      className="h-4 w-4 accent-petita-brick"
                    />
                    {CATEGORIES[categorie].label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="prix" className={classeLabel}>
          Prix <span className="font-normal text-petita-brown/70">(facultatif)</span>
        </label>
        <p className={classeAide}>
          Laissez vide pour ne rien afficher. Jamais affiché sur les pages
          « vendus » ni « en cours de rénovation ».
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

      <div>
        <label htmlFor="lienExterne" className={classeLabel}>
          Lien vers la plateforme{" "}
          <span className="font-normal text-petita-brown/70">(facultatif)</span>
        </label>
        <p className={classeAide}>
          L&apos;adresse de l&apos;annonce sur Vinted, leboncoin, Selency… Un
          bouton d&apos;achat apparaîtra sur la page de détail de
          l&apos;annonce — et nulle part ailleurs.
        </p>
        <input
          id="lienExterne"
          name="lienExterne"
          type="url"
          inputMode="url"
          maxLength={2000}
          defaultValue={annonce?.lienExterne ?? ""}
          placeholder="https://www.vinted.fr/items/123456789"
          className={classeChamp}
        />
      </div>

      <ChampImages
        images={images}
        setImages={setImages}
        format={format}
        setFormat={setFormat}
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
