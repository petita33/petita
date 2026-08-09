"use client";

import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { upload } from "@vercel/blob/client";
import { compresserImage } from "./compresserImage";
import { classeAide, classeErreur, classeLabel } from "./ui";

const FORMATS_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGES = 12;

type EnvoiEnCours = {
  cle: string;
  apercu: string;
  progression: number;
};

/**
 * Le SDK client remplace le corps de nos réponses d'erreur par « Failed to
 * retrieve the client token ». On interroge la route pour retrouver la cause.
 */
async function causeReelle(message: string) {
  if (!/client token/i.test(message)) return message;
  try {
    const reponse = await fetch("/api/admin/upload");
    if (reponse.status === 401) {
      return "session expirée, reconnectez-vous puis réessayez";
    }
    const { raison } = (await reponse.json()) as { raison: string | null };
    if (raison) return raison;
  } catch {
    // On retombe sur le message d'origine.
  }
  return `${message} (détail dans les logs Vercel de /api/admin/upload)`;
}

/**
 * Sélecteur de photos : compresse puis envoie chaque fichier directement à
 * Vercel Blob, et expose les URLs obtenues dans un champ caché `images`.
 */
export function ChampImages({
  images,
  setImages,
  onOccupeChange,
}: {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  onOccupeChange: (occupe: boolean) => void;
}) {
  const idChamp = useId();
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
      const prepare = await compresserImage(fichier);
      if (!FORMATS_ACCEPTES.includes(prepare.type)) {
        throw new Error(
          `format non pris en charge (${prepare.type || "inconnu"}), utilisez JPG, PNG, WebP ou AVIF`,
        );
      }

      const resultat = await upload(`annonces/${prepare.name}`, prepare, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: prepare.type,
        onUploadProgress: ({ percentage }) =>
          setEnvois((precedents) =>
            precedents.map((envoi) =>
              envoi.cle === cle ? { ...envoi, progression: percentage } : envoi,
            ),
          ),
      });

      setImages((precedentes) => [...precedentes, resultat.url]);
    } catch (cause) {
      const detail = await causeReelle((cause as Error).message);
      setErreur(`« ${fichier.name} » n'a pas pu être envoyée : ${detail}`);
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
              className="aspect-[4/3] w-full object-cover"
            />
            {index === 0 ? (
              <figcaption className="absolute left-2 top-2 rounded-full bg-petita-brick/90 px-3 py-0.5 font-display text-xs text-petita-cream">
                Vignette
              </figcaption>
            ) : null}
            <div className="flex items-center justify-between gap-1 p-1.5">
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
              className="aspect-[4/3] w-full object-cover opacity-45"
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
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-petita-gold/50 bg-petita-cream/50 font-display text-[15px] text-petita-brick hover:border-petita-gold hover:bg-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold"
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
      className="flex h-9 w-9 items-center justify-center rounded-md border border-petita-gold/40 font-display text-base text-petita-brick hover:bg-petita-brick hover:text-petita-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-petita-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petita-gold"
    >
      {children}
    </button>
  );
}
