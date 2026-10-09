# Décision relative aux mesures d'audience et de performance

**Version :** 1.1 — 16 août 2026  
**Décisionnaire :** Philippe Lopez  
**Outils :** Vercel Web Analytics et Vercel Speed Insights

## Décision actuelle

Les deux outils sont utilisés sans bandeau ni consentement préalable dans la
configuration décrite ci-dessous. Atelier Petita retient l'exemption de
consentement prévue par l'article 82 de la loi Informatique et Libertés pour les
solutions strictement limitées à la mesure d'audience et de performance.

Cette décision repose sur les caractéristiques publiées par Vercel et sur les
mesures supplémentaires appliquées dans le site. Elle ne doit jamais être
présentée comme une certification ou une validation de la CNIL. La copie signée
de l'auto-évaluation et les preuves fournisseur doivent être conservées dans le
dossier privé.

## Analyse des conditions d'exemption

| Condition | Application à Atelier Petita |
|---|---|
| Finalité strictement limitée | Audience des pages publiques, détection des lenteurs, problèmes de navigation et amélioration de l'ergonomie uniquement. |
| Compte exclusif de l'éditeur | Les tableaux servent seulement à Atelier Petita ; aucune publicité, prospection, tarification individualisée ou profilage. |
| Statistiques anonymes | Vercel annonce des points anonymes, non associés à un visiteur ou à son IP et non réidentifiables dans les interfaces. |
| Aucun suivi individuel ou entre sites | Aucun événement personnalisé ; Vercel annonce l'absence de reconstruction de session entre pages pour Speed Insights et une empreinte Web Analytics renouvelée après 24 heures, sans suivi entre sites ou jours. |
| Aucun recoupement ou réutilisation | Les pages de conformité Vercel annoncent des statistiques agrégées uniquement. Leur version et la confirmation contractuelle de non-réutilisation doivent être archivées. |
| Minimisation | Paramètres et fragments des URL retirés ; routes admin/API exclues ; Speed Insights limité à 20 % des visites publiques. |
| Information | La politique publique décrit les outils, données, finalités, destinataire, transferts, durées et exemption retenue. |

## Configuration mise en œuvre

| Contrôle | État |
|---|---|
| Bandeau ou préférence locale | Aucun : aucun choix n'est demandé ou stocké dans le navigateur. |
| Pages mesurées | Pages publiques uniquement. |
| Routes privées | Admin et API exclues au montage et de nouveau filtrées avant chaque envoi. |
| URL | Paramètres et fragments retirés avant envoi. |
| Événements personnalisés | Aucun. |
| Speed Insights | Échantillon de 20 % des visites publiques. |
| URL mal formée | Événement refusé. |

## Données annoncées par Vercel

Web Analytics peut produire des agrégats par date, chemin, route, référent,
pays ou région dérivée, navigateur, système et type d'appareil. Le code retire
les paramètres et fragments. Vercel annonce ne pas attacher les points à une
personne ou à une adresse IP et remplacer l'empreinte visiteur après 24 heures.

Speed Insights reçoit des Web Vitals, le chemin, le navigateur, l'appareil, le
système, le pays et les métadonnées nécessaires à l'interprétation de la
performance. Vercel annonce que ces points sont anonymes, non associés à un
visiteur ou à son IP et insuffisants pour reconstruire sa navigation.

Les traitements techniques généraux de Vercel — fourniture de la page,
sécurité et journaux — sont distincts et décrits dans le registre RT-01. Le
fait que les statistiques soient anonymes ne dispense pas de vérifier le
contrat, les transferts internationaux et les sous-traitants.

## Recette obligatoire

Réaliser dans un profil de navigateur propre, en production ou préproduction
reliée aux mêmes fonctions :

1. ouvrir une page publique et confirmer le chargement de Web Analytics et de
   Speed Insights sans bannière ni écriture de préférence locale ;
2. visiter une URL contenant des paramètres et un fragment, puis vérifier leur
   absence dans l'événement transformé ;
3. confirmer qu'aucun événement personnalisé n'est transmis ;
4. naviguer côté client vers l'administration et confirmer qu'aucun événement
   admin n'est envoyé, même si les scripts publics restent en mémoire ;
5. charger directement une route admin et confirmer l'absence des scripts ;
6. vérifier que Speed Insights reste échantillonné à 20 % ;
7. conserver capture réseau, date, version déployée, navigateur et résultat
   dans le dossier privé.

## Réexamen obligatoire

L'exemption cesse d'être présumée et les scripts doivent être bloqués dans
l'attente d'une nouvelle décision si l'un de ces événements survient :

- ajout d'un événement personnalisé, identifiant, paramètre d'URL ou donnée
  métier ;
- publicité, profilage, personnalisation individuelle ou mesure multi-sites ;
- réutilisation ou recoupement des données par Vercel ou un sous-traitant ;
- modification des déclarations de confidentialité, du contrat, des durées ou
  des pays de traitement ;
- ajout d'un autre outil de mesure ;
- impossibilité de produire l'auto-évaluation et les preuves de configuration.

Références officielles :

- [Exemption pour les outils de mesure d'audience — CNIL](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies-solutions-pour-les-outils-de-mesure-daudience)
- [Confidentialité de Vercel Web Analytics](https://vercel.com/docs/analytics/privacy-policy)
- [Confidentialité de Vercel Speed Insights](https://vercel.com/docs/speed-insights/privacy-policy)
- [Gestion de l'usage Speed Insights](https://vercel.com/docs/speed-insights/managing-usage)
