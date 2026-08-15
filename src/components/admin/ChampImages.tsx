"use client";

import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { DOSSIER_ANNONCES } from "@/lib/annonces";
import { classeDuFormat, type FormatImage } from "@/lib/formats";
import { ChampFormat } from "./ChampFormat";
import { envoyerImage } from "./envoyerImage";
import { classeAide, classeErreur, classeLabel } from "./ui";

const MAX_IMAGES = 12;

type EnvoiEnCours = {
  cle: string;
  apercu: string;
  progression: number;
};

/**
 * Sélecteur de photos : compresse puis envoie chaque fichier directement à
 * Vercel Blob, et expose les URLs obtenues dans un champ caché `images`.
 *
 * Le format choisi vaut pour toutes les photos de l'annonce — les aperçus
 * ci-dessous montrent exactement le cadre qu'aura le site.
 */
export function ChampImages({
  images,
  setImages,
  format,
  setFormat,
  onOccupeChange,
}: {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  format: FormatImage;
  setFormat: Dispatch<SetStateAction<FormatImage>>;
  onOccupeChange: (occupe: boolean) => void;
}) {
  const idChamp = useId();
  const cadre = classeDuFormat(format);
  const inputRef = useRef<HTMLInputElement>(null);
  const [envois, setEnvois] = useState<EnvoiEnCours[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    onOccupeChange(envois.length > 0);
  }, [envois.length, onOccupeChange]);

  // Les aperçus sont des object URLs : on libère celles qui traînent au démontage.
  const apercusRef = useRef(new Set<string>());
  useEffect(() => {
    const apercus = apercusRef.current;
    return () => apercus.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function ajouterFichiers(fichiers: File[]) {
    setErreur(null);

    const placeLibre = MAX_IMAGES - images.length - envois.length;
    if (placeLibre <= 0) {
      setErreur(`Maximum ${MAX_IMAGES} photos par annonce.`);
      return;
    }
    if (fichiers.length > placeLibre) {
      setErreur(
        `Seules les ${placeLibre} premières photos ont été retenues (maximum ${MAX_IMAGES}).`,
      );
      fichiers = fichiers.slice(0, placeLibre);
    }

    await Promise.all(fichiers.map(envoyerUnFichier));
  }

  async function envoyerUnFichier(fichier: File) {
    const cle = crypto.randomUUID();
    const apercu = URL.createObjectURL(fichier);
    apercusRef.current.add(apercu);

    setEnvois((precedents) => [...precedents, { cle, apercu, progression: 0 }]);

    try {
      const url = await envoyerImage(fichier, DOSSIER_ANNONCES, (progression) =>
        setEnvois((precedents) =>
          precedents.map((envoi) =>
            envoi.cle === cle ? { ...envoi, progression } : envoi,
          ),
        ),
      );

      setImages((precedentes) => [...precedentes, url]);
    } catch (cause) {
      setErreur(
        `« ${fichier.name} » n'a pas pu être envoyée : ${(cause as Error).message}`,
      );
    } finally {
      URL.revokeObjectURL(apercu);
      apercusRef.current.delete(apercu);
      setEnvois((precedents) => precedents.filter((envoi) => envoi.cle !== cle));
    }
  }

  function deplacer(index: number, decalage: number) {
    setImages((precedentes) => {
      const cible = index + decalage;
      if (cible < 0 || cible >= precedentes.length) return precedentes;
      const suivantes = [...precedentes];
      [suivantes[index], suivantes[cible]] = [suivantes[cible], suivantes[index]];
      return suivantes;
    });
  }

  return (
    <div>
      <span className={classeLabel}>Photos</span>
      <p className={classeAide}>
        La première photo sert de vignette sur le site ; réordonnez-les avec les
        flèches. {MAX_IMAGES} photos maximum.
      </p>

      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="format" value={format} />

      <div className="mt-6">
        <ChampFormat
          titre="Format des photos"
          aide="Les proportions dans lesquelles les photos seront montrées sur le site. Choisissez celui utilisé pour la prise de vue : la photo remplit alors le cadre sans être rognée. Il vaut pour toutes les photos de cette annonce."
          valeur={format}
          // Sans option « format conseillé », `ChampFormat` ne renvoie jamais "".
          onChange={(choisi) => choisi && setFormat(choisi)}
        />
      </div>

      <input
        ref={inputRef}
        id={idChamp}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(evenement) => {
          const fichiers = Array.from(evenement.target.files ?? []);
          evenement.target.value = "";
          void ajouterFichiers(fichiers);
        }}
      />

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((url, index) => (
          <figure
            key={url}
            className="relative m-0 overflow-hidden rounded-lg border border-petita-gold/30 bg-petita-cream"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className={`${cadre} w-full object-cover`}
            />
            {index === 0 ? (
              <figcaption className="absolute left-2 top-2 rounded-full bg-petita-brick/90 px-3 py-0.5 font-display text-xs text-petita-cream">
                Vignette
              </figcaption>
            ) : null}
            {/* `flex-wrap` : à 320 px, trois cibles de 44 px ne tiennent pas
                sur la largeur d'une vignette — le « ✕ » passe dessous plutôt
                que de déborder de l'écran. */}
            <div className="flex flex-wrap items-center justify-between gap-1 p-1.5">
              <div className="flex gap-1">
                <BoutonIcone
                  label={`Déplacer la photo ${index + 1} vers la gauche`}
                  disabled={index === 0}
                  onClick={() => deplacer(index, -1)}
                >
                  ←
                </BoutonIcone>
                <BoutonIcone
                  label={`Déplacer la photo ${index + 1} vers la droite`}
                  disabled={index === images.length - 1}
                  onClick={() => deplacer(index, 1)}
                >
                  →
                </BoutonIcone>
              </div>
              <BoutonIcone
                label={`Retirer la photo ${index + 1}`}
                onClick={() =>
                  setImages((precedentes) =>
                    precedentes.filter((autre) => autre !== url),
                  )
                }
              >
                ✕
              </BoutonIcone>
            </div>
          </figure>
        ))}

        {envois.map((envoi) => (
          <figure
            key={envoi.cle}
            className="relative m-0 overflow-hidden rounded-lg border border-petita-gold/30 bg-petita-cream"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={envoi.apercu}
              alt=""
              className={`${cadre} w-full object-cover opacity-45`}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-petita-cream/95 px-2 py-2 font-display text-xs text-petita-brown">
              Envoi… {Math.round(envoi.progression)} %
              <span
                aria-hidden="true"
                className="mt-1 block h-1 rounded-full bg-petita-gold/25"
              >
                <span
                  className="block h-1 rounded-full bg-petita-gold transition-[width]"
                  style={{ width: `${envoi.progression}%` }}
                />
              </span>
            </figcaption>
          </figure>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex ${cadre} flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-petita-gold/50 bg-petita-cream/50 font-display text-[15px] text-petita-brick hover:border-petita-gold hover:bg-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold`}
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            +
          </span>
          Ajouter des photos
        </button>
      </div>

      {erreur ? (
        <p role="alert" className={`mt-4 ${classeErreur}`}>
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

function BoutonIcone({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      // 44 px au doigt, la taille compacte d'origine à la souris.
      className="flex h-11 w-11 items-center justify-center rounded-md border border-petita-gold/40 font-display text-base text-petita-brick sm:h-9 sm:w-9 hover:bg-petita-brick hover:text-petita-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-petita-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petita-gold"
    >
      {children}
    </button>
  );
}
