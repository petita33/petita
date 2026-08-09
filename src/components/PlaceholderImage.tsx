const TONES = {
  blush: "bg-[repeating-linear-gradient(135deg,#EBD6CE_0_12px,#F6E4DE_12px_24px)]",
  sand: "bg-[repeating-linear-gradient(135deg,#E9D2C9_0_12px,#F6E4DE_12px_24px)]",
  rose: "bg-[repeating-linear-gradient(135deg,#9E5D56_0_12px,#A96B63_12px_24px)]",
} as const;

export function PlaceholderImage({
  alt,
  label,
  ratio,
  tone = "blush",
  className = "",
}: {
  alt: string;
  label?: string;
  ratio: string;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`${ratio} ${TONES[tone]} flex items-end justify-center p-4 transition-transform duration-700 ease-out hover:scale-[1.04] ${className}`}
    >
      {label ? (
        <span className="rounded bg-petita-cream px-3 py-2 font-mono text-xs tracking-wide text-petita-brown">
          {label}
        </span>
      ) : null}
    </div>
  );
}
