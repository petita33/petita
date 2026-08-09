"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Petit carrousel : une annonce peut avoir plusieurs photos.
 *
 * `variante="carte"` (défaut) tient dans une vignette de grille et se repère
 * avec des pastilles ; `variante="detail"` occupe la largeur d'une page et
 * ajoute une bande de miniatures.
 *
 * Les commandes sont en `z-10` : sur une carte, elles doivent rester
 * cliquables au-dessus du lien étiré qui recouvre toute la carte.
 */
export function GalerieAnnonce({
  images,
  titre,
  variante = "carte",
}: {
  images: string[];
  titre: string;
  variante?: "carte" | "detail";
}) {
  const [index, setIndex] = useState(0);
  const position = Math.min(index, images.length - 1);
  const courante = images[position];
  const detail = variante === "detail";

  function decaler(pas: number) {
    setIndex((precedent) => (precedent + pas + images.length) % images.length);
  }

  function legende(rang: number) {
    return images.length > 1
      ? `${titre} — photo ${rang + 1} sur ${images.length}`
      : titre;
  }

  return (
    <div className={detail ? "flex flex-col gap-3" : undefined}>
      <div
        className={`group relative aspect-[4/3] overflow-hidden bg-petita-blush ${
          detail ? "rounded-xl border border-petita-gold/25" : ""
        }`}
      >
        <Image
          src={courante}
          alt={legende(position)}
          fill
          priority={detail}
          sizes={
            detail
              ? "(min-width: 1024px) 60vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          className={`object-cover ${
            detail
              ? ""
              : "transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          }`}
        />

        {images.length > 1 ? (
          <>
            <FlecheGalerie cote="gauche" onClick={() => decaler(-1)} />
            <FlecheGalerie cote="droite" onClick={() => decaler(1)} />

            {!detail && (
              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
                {images.map((url, rang) => (
                  <button
                    key={url}
                    type="button"
                    aria-label={`Voir la photo ${rang + 1}`}
                    aria-current={rang === position}
                    onClick={() => setIndex(rang)}
                    className={`h-2.5 w-2.5 rounded-full border border-petita-cream/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold ${
                      rang === position ? "bg-petita-cream" : "bg-petita-cream/35"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {detail && images.length > 1 ? (
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {images.map((url, rang) => (
            <li key={url}>
              <button
                type="button"
                aria-label={`Voir la photo ${rang + 1}`}
                aria-current={rang === position}
                onClick={() => setIndex(rang)}
                className={`relative block h-20 w-24 overflow-hidden rounded-lg border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold ${
                  rang === position
                    ? "border-petita-brick"
                    : "border-petita-gold/30 hover:border-petita-gold"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FlecheGalerie({
  cote,
  onClick,
}: {
  cote: "gauche" | "droite";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={cote === "gauche" ? "Photo précédente" : "Photo suivante"}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-petita-cream/85 font-display text-lg text-petita-brick hover:bg-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold ${
        cote === "gauche" ? "left-3" : "right-3"
      }`}
    >
      <span aria-hidden="true">{cote === "gauche" ? "‹" : "›"}</span>
    </button>
  );
}
