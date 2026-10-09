import { NextResponse } from "next/server";
import { blobConfigure } from "@/lib/blob";
import { effectuerMenage } from "@/lib/menage";

/** Le décompte doit refléter l'état du store, jamais une réponse mise en cache. */
export const dynamic = "force-dynamic";

/**
 * Purge planifiée des photos orphelines et anciennes versions de données.
 *
 * Le ménage se déclenchait uniquement après un enregistrement : une photo
 * envoyée puis abandonnée alors que la patronne ne publie plus rien restait
 * indéfiniment dans le store — et sur la facture. Vercel appelle donc cette
 * route une fois par jour (voir `vercel.json`) avec l'en-tête
 * `Authorization: Bearer $CRON_SECRET`, ce qui donne au nettoyage une échéance
 * qui ne dépend plus de l'activité.
 *
 * Les photos de moins de 24 heures sont toujours épargnées : c'est la fenêtre
 * de récupération d'une saisie commencée la veille. Une version précédente du
 * catalogue suit le même minimum de 24 heures pour laisser expirer les caches.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(
      "CRON_SECRET est absent : le balayage planifié des images orphelines ne peut pas s'authentifier.",
    );
    return NextResponse.json({ error: "Non configuré" }, { status: 503 });
  }

  if (!blobConfigure()) {
    console.error(
      "Store Blob absent : la purge planifiée ne peut pas vérifier les données.",
    );
    return NextResponse.json({ error: "Store non configuré" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const bilan = await effectuerMenage();
  const enEchec = bilan.images.echecs > 0 || bilan.versions.echecs > 0;
  return NextResponse.json(bilan, { status: enEchec ? 500 : 200 });
}
