const TONES = {
  blush: "bg-[repeating-linear-gradient(135deg,#EBD6CE_0_12px,#F6E4DE_12px_24px)]",
  sand: "bg-[repeating-linear-gradient(135deg,#E9D2C9_0_12px,#F6E4DE_12px_24px)]",
  rose: "bg-[repeating-linear-gradient(135deg,#9E5D56_0_12px,#A96B63_12px_24px)]",
} as const;

/**
 * Aplat décoratif tenant la place d'une photo absente : les emplacements fixes
 * de la page d'accueil s'en servent tant qu'aucune photo n'y a été déposée, et
 * « Nos dernières ventes » pour une annonce publiée sans photo.
 */
export function PlaceholderImage({
  alt,
  ratio,
  tone = "blush",
  className = "",
}: {
  alt: string;
  ratio: string;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`${ratio} ${TONES[tone]} transition-transform duration-700 ease-out hover:scale-[1.04] ${className}`}
    />
  );
}
