"use client";

import { useActionState, useId, useRef, useState } from "react";
import { enregistrerVisuel } from "@/app/admin/visuels/actions";
import { classeDuFormat, type FormatImage } from "@/lib/formats";
import {
  DOSSIER_VISUELS,
  EMPLACEMENTS,
  SECTIONS,
  type EmplacementId,
  type Visuel,
} from "@/lib/visuels";
import { ChampFormat } from "./ChampFormat";
import { envoyerImage } from "./envoyerImage";
import { MaquetteSection } from "./MaquetteSection";
import {
  classeAide,
  classeBoutonPrincipal,
  classeBoutonSecondaire,
  classeChamp,
  classeErreur,
  classeLabel,
} from "./ui";

/**
 * Un emplacement photo de la page d'accueil : le repère visuel, la photo
 * actuelle, et de quoi la remplacer ou la retirer.
 *
 * L'emplacement lui-même ne se crée ni ne se supprime — seule la photo change,
 * d'où l'absence de bouton « supprimer l'emplacement ».
 */
export function CarteVisuel({
  emplacement,
  visuel,
}: {
  emplacement: EmplacementId;
  visuel?: Visuel;
}) {
  const cadre = EMPLACEMENTS[emplacement];
  const [etat, action, enregistrement] = useActionState(
    enregistrerVisuel,
    undefined,
  );

  // Ce que le formulaire enverra ; `""` signifie « vider l'emplacement ».
  const [image, setImage] = useState(visuel?.url ?? "");
  const [alt, setAlt] = useState(visuel?.alt ?? "");
  // `""` : garder le cadre conseillé pour cet emplacement.
  const [format, setFormat] = useState<FormatImage | "">(visuel?.format ?? "");
  const [progression, setProgression] = useState<number | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);

  const idAlt = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const enCoursDEnvoi = progression !== null;
  const modifiee =
    image !== (visuel?.url ?? "") ||
    alt !== (visuel?.alt ?? "") ||
    format !== (visuel?.format ?? "");
  const ratio = format ? classeDuFormat(format) : cadre.conseille.classe;

  async function choisirFichier(fichier: File) {
    setErreurEnvoi(null);
    setProgression(0);
    try {
      setImage(await envoyerImage(fichier, DOSSIER_VISUELS, setProgression));
    } catch (cause) {
      setErreurEnvoi(
        `« ${fichier.name} » n'a pas pu être envoyée : ${(cause as Error).message}`,
      );
    } finally {
      setProgression(null);
    }
  }

  return (
    <form
      action={action}
      className="rounded-xl border border-petita-gold/30 bg-petita-cream/60 p-4 sm:p-6"
    >
      <input type="hidden" name="emplacement" value={emplacement} />
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="format" value={format} />

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Repérage : où cette photo apparaît-elle ? */}
        <div>
          <h3 className="m-0 font-display text-[17px] font-semibold text-petita-brick sm:text-lg">
            {cadre.position}
          </h3>
          <p className="mt-1 text-sm text-petita-brown/80">
            Section « {SECTIONS[cadre.section].titre} » —{" "}
            {SECTIONS[cadre.section].reperage}
          </p>

          <div className="mt-4">
            <MaquetteSection emplacement={emplacement} />
          </div>

          <p className="mt-3 text-sm text-petita-brown/80">
            <span className="font-display text-petita-brick">
              {cadre.conseille.libelle}.
            </span>{" "}
            {cadre.conseil}
          </p>
        </div>

        {/* La photo elle-même */}
        <div>
          {image ? (
            <figure className="m-0 overflow-hidden rounded-lg border border-petita-gold/30 bg-petita-blush">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                className={`${ratio} w-full object-cover ${
                  enCoursDEnvoi ? "opacity-45" : ""
                }`}
              />
            </figure>
          ) : (
            <p className="m-0 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-petita-gold/50 px-4 py-10 text-center text-sm text-petita-brown/80">
              <span className="font-display text-[15px] text-petita-brick">
                Aucune photo pour l&apos;instant
              </span>
              Un fond décoratif tient la place sur le site.
            </p>
          )}

          {progression !== null ? (
            <p className="mt-3 m-0 font-display text-sm text-petita-brown">
              Envoi… {Math.round(progression)} %
              <span
                aria-hidden="true"
                className="mt-1 block h-1 rounded-full bg-petita-gold/25"
              >
                <span
                  className="block h-1 rounded-full bg-petita-gold transition-[width]"
                  style={{ width: `${progression}%` }}
                />
              </span>
            </p>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(evenement) => {
              const fichier = evenement.target.files?.[0];
              evenement.target.value = "";
              if (fichier) void choisirFichier(fichier);
            }}
          />

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={enCoursDEnvoi}
              onClick={() => inputRef.current?.click()}
              className={classeBoutonSecondaire}
            >
              {image ? "Changer la photo" : "Choisir une photo"}
            </button>
            {image ? (
              <button
                type="button"
                disabled={enCoursDEnvoi}
                onClick={() => setImage("")}
                className={classeBoutonSecondaire}
              >
                Retirer la photo
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <ChampFormat
              titre="Format de la photo"
              aide="Les proportions du cadre à cet endroit de la page d'accueil. Choisissez le format de la prise de vue pour que la photo ne soit pas rognée."
              valeur={format}
              onChange={setFormat}
              auto={{
                label: "Conseillé",
                orientation: cadre.conseille.libelle,
                largeur: cadre.conseille.largeur,
                hauteur: cadre.conseille.hauteur,
              }}
              desactive={enCoursDEnvoi}
            />
          </div>

          <div className="mt-5">
            <label htmlFor={idAlt} className={classeLabel}>
              Description de la photo{" "}
              <span className="font-normal text-petita-brown/70">(facultatif)</span>
            </label>
            <p className={classeAide}>
              Lue par les personnes malvoyantes et par Google. Sans description,
              « {cadre.altParDefaut} » est utilisé.
            </p>
            <input
              id={idAlt}
              name="alt"
              type="text"
              maxLength={300}
              value={alt}
              onChange={(evenement) => setAlt(evenement.target.value)}
              placeholder={cadre.altParDefaut}
              className={classeChamp}
            />
          </div>
        </div>
      </div>

      {erreurEnvoi ? (
        <p role="alert" className={`mt-5 ${classeErreur}`}>
          {erreurEnvoi}
        </p>
      ) : null}
      {etat?.erreur ? (
        <p role="alert" className={`mt-5 ${classeErreur}`}>
          {etat.erreur}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enregistrement || enCoursDEnvoi || !modifiee}
          className={classeBoutonPrincipal}
        >
          {enregistrement ? "Enregistrement…" : "Enregistrer cet emplacement"}
        </button>
        {modifiee ? (
          <span className="font-display text-[15px] text-petita-brick">
            Modification non enregistrée
          </span>
        ) : etat?.succes ? (
          <span role="status" className="font-display text-[15px] text-petita-brown">
            {etat.succes}
          </span>
        ) : null}
      </div>
    </form>
  );
}
