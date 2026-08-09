"use client";

import Image from "next/image";
import { useState } from "react";

/** Petit carrousel : une annonce peut avoir plusieurs photos. */
export function GalerieAnnonce({
  images,
  titre,
}: {
  images: string[];
  titre: string;
}) {
  const [index, setIndex] = useState(0);
  const courante = images[Math.min(index, images.length - 1)];

  function decaler(pas: number) {
    setIndex((precedent) => (precedent + pas + images.length) % images.length);
  }

  return (
    <div className="group relative aspect-[4/3] overflow-hidden bg-petita-blush">
      <Image
        src={courante}
        alt={
          images.length > 1
            ? `${titre} — photo ${index + 1} sur ${images.length}`
            : titre
        }
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {images.length > 1 ? (
        <>
          <FlecheGalerie cote="gauche" onClick={() => decaler(-1)} />
          <FlecheGalerie cote="droite" onClick={() => decaler(1)} />

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((url, position) => (
              <button
                key={url}
                type="button"
                aria-label={`Voir la photo ${position + 1}`}
                aria-current={position === index}
                onClick={() => setIndex(position)}
                className={`h-2.5 w-2.5 rounded-full border border-petita-cream/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold ${
                  position === index ? "bg-petita-cream" : "bg-petita-cream/35"
                }`}
              />
            ))}
          </div>
        </>
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
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-petita-cream/85 font-display text-lg text-petita-brick hover:bg-petita-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petita-gold ${
        cote === "gauche" ? "left-3" : "right-3"
      }`}
    >
      <span aria-hidden="true">{cote === "gauche" ? "‹" : "›"}</span>
    </button>
  );
}
