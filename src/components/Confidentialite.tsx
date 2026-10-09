"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CLE_PREFERENCE_HERITEE = "petita:mesures-audience:v1";

function estCheminPrive(chemin: string) {
  return (
    chemin === "/admin" ||
    chemin.startsWith("/admin/") ||
    chemin === "/api" ||
    chemin.startsWith("/api/")
  );
}

/**
 * Minimise chaque mesure avant son envoi : les routes privées ne partent
 * jamais et les paramètres/fragments sont retirés, car ils pourraient un jour
 * contenir un identifiant ou un jeton.
 */
function preparerEvenement<T extends { url: string }>(evenement: T): T | null {
  try {
    const url = new URL(evenement.url, window.location.origin);
    if (estCheminPrive(url.pathname)) return null;

    url.search = "";
    url.hash = "";
    return { ...evenement, url: url.toString() };
  } catch {
    // Une URL que l'on ne sait pas borner ne doit pas quitter le navigateur.
    return null;
  }
}

function filtrerAnalytics(evenement: BeforeSendEvent) {
  return preparerEvenement(evenement);
}

/**
 * Mesures anonymes limitées aux pages publiques. Le dossier RGPD documente
 * l'exemption de consentement retenue et les critères à revérifier lorsque
 * Vercel, la configuration ou les finalités changent.
 */
export function GestionConfidentialite() {
  const chemin = usePathname();

  useEffect(() => {
    // La version 1.0 demandait un choix. Depuis le passage à l'exemption, cette
    // préférence n'a plus de finalité et doit disparaître chez les visiteurs
    // qui l'avaient déjà enregistrée.
    try {
      localStorage.removeItem(CLE_PREFERENCE_HERITEE);
    } catch {
      // Un stockage inaccessible n'empêche ni le site ni les mesures anonymes.
    }
  }, []);

  if (estCheminPrive(chemin)) return null;

  return (
    <>
      <Analytics beforeSend={filtrerAnalytics} />
      <SpeedInsights
        sampleRate={0.2}
        beforeSend={(evenement) => preparerEvenement(evenement)}
      />
    </>
  );
}
