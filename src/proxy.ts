import { NextResponse, type NextRequest } from "next/server";
import { NOM_COOKIE, jetonValide } from "@/lib/session";

export const config = {
  matcher: "/admin/:path*",
};

/**
 * Redirection optimiste : évite d'afficher l'admin à un visiteur non connecté.
 * La vraie autorisation est refaite dans chaque Server Action (`exigerAdmin`).
 */
export async function proxy(request: NextRequest) {
  const connecte = await jetonValide(request.cookies.get(NOM_COOKIE)?.value);
  const surLaPageConnexion = request.nextUrl.pathname === "/admin/connexion";

  if (!connecte && !surLaPageConnexion) {
    const destination = new URL("/admin/connexion", request.url);
    destination.searchParams.set(
      "suite",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(destination);
  }

  if (connecte && surLaPageConnexion) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}
