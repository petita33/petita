"use client";

import { useId } from "react";
import { FORMATS, FORMATS_ORDRE, type FormatImage } from "@/lib/formats";
import { classeAide, classeLabel } from "./ui";

/**
 * Choix des proportions dans lesquelles la (ou les) photo(s) seront montrées.
 *
 * `auto` ajoute une option en tête de liste — « le format conseillé pour cet
 * emplacement » — pour les photos de la page d'accueil, dont le cadre est
 * dessiné par le site. Les annonces, elles, choisissent toujours un format.
 */
export function ChampFormat({
  titre,
  aide,
  valeur,
  onChange,
  auto,
  desactive = false,
}: {
  titre: string;
  aide: string;
  /** `""` désigne l'option `auto` quand elle existe. */
  valeur: FormatImage | "";
  onChange: (format: FormatImage | "") => void;
  auto?: { label: string; orientation: string; largeur: number; hauteur: number };
  desactive?: boolean;
}) {
  // Un nom unique par instance : plusieurs cartes cohabitent sur la page des
  // photos d'accueil, leurs boutons radio ne doivent pas se répondre.
  const nom = useId();

  return (
    <fieldset className="m-0 border-0 p-0" disabled={desactive}>
      <legend className={`${classeLabel} p-0`}>{titre}</legend>
      <p className={classeAide}>{aide}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {auto ? (
          <OptionFormat
            nom={nom}
            valeur=""
            coche={valeur === ""}
            onChange={onChange}
            label={auto.label}
            orientation={auto.orientation}
            largeur={auto.largeur}
            hauteur={auto.hauteur}
          />
        ) : null}

        {FORMATS_ORDRE.map((format) => (
          <OptionFormat
            key={format}
            nom={nom}
            valeur={format}
            coche={valeur === format}
            onChange={onChange}
            label={FORMATS[format].label}
            orientation={FORMATS[format].orientation}
            largeur={FORMATS[format].largeur}
            hauteur={FORMATS[format].hauteur}
          />
        ))}
      </div>
    </fieldset>
  );
}

/** Côté du carré dans lequel s'inscrit la vignette de proportions, en pixels. */
const COTE_APERCU = 26;

function OptionFormat({
  nom,
  valeur,
  coche,
  onChange,
  label,
  orientation,
  largeur,
  hauteur,
}: {
  nom: string;
  valeur: FormatImage | "";
  coche: boolean;
  onChange: (format: FormatImage | "") => void;
  label: string;
  orientation: string;
  largeur: number;
  hauteur: number;
}) {
  // Le rectangle s'inscrit dans un carré : le plus grand côté fait la taille
  // de référence, l'autre est réduit d'autant.
  const cote = Math.max(largeur, hauteur);

  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-md border border-petita-gold/40 bg-petita-cream px-3 py-2 font-display text-[15px] text-petita-brown hover:border-petita-gold has-checked:border-petita-brick has-checked:text-petita-brick has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        type="radio"
        name={nom}
        value={valeur}
        checked={coche}
        onChange={() => onChange(valeur)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center"
        style={{ width: COTE_APERCU, height: COTE_APERCU }}
      >
        <span
          className={`block rounded-[3px] border-2 ${
            coche ? "border-petita-brick bg-petita-brick/15" : "border-petita-gold/70"
          }`}
          style={{
            width: (COTE_APERCU * largeur) / cote,
            height: (COTE_APERCU * hauteur) / cote,
          }}
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-semibold">{label}</span>
        <span className="text-xs font-normal text-petita-brown/70">
          {orientation}
        </span>
      </span>
    </label>
  );
}
