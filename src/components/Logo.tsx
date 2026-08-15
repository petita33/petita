import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo Atelier Petita"
      width={128}
      height={128}
      sizes="76px"
      className={className}
    />
  );
}
