# Dossier de conformité RGPD — Atelier Petita

**Responsable du dossier :** Philippe Lopez  
**Version :** 1.1  
**Date de revue :** 16 août 2026  
**Prochaine revue planifiée :** 16 février 2027, ou avant toute nouvelle
collecte, tout nouveau prestataire ou toute modification substantielle du site.

Ce dossier transforme la partie RGPD de l'audit du 16 août 2026 en règles
opérationnelles. Il ne contient volontairement aucune demande de droit, aucun
incident réel, aucun contrat fournisseur et aucun secret : ces preuves doivent
être conservées dans un espace privé à accès limité, jamais dans Git.

## État des six constats

| Constat | Correction dans le dépôt | Preuve ou action hors dépôt |
|---|---|---|
| RGPD-01 — information article 13 | Notice avant le bouton, nom facultatif, champs obligatoires identifiés, avertissement données sensibles et politique détaillée versionnée. | Vérifier après chaque mise en ligne que la notice reste visible au clavier, sur mobile et au lecteur d'écran. |
| RGPD-02 — prestataires et transferts | Vercel, Resend et Proton sont décrits au public et inventoriés dans ce dossier. | Vérifier le forfait Vercel, accepter et archiver les DPA, listes de sous-traitants et analyses de transfert. |
| RGPD-03 — conservation et effacement | Matrice par finalité, purge quotidienne des images orphelines et des anciennes versions Blob, délai distinct Resend/boîte finale. | Créer la règle de purge de la boîte Proton, contrôler les fenêtres Vercel/Resend et conserver un journal mensuel de purge. |
| RGPD-04 — audience et texte cookies | Exemption de consentement documentée pour les statistiques anonymes ; aucun bandeau ni stockage de choix ; admin/API et paramètres d'URL exclus ; aucun événement personnalisé ; Speed Insights échantillonné à 20 %. | Archiver les déclarations de confidentialité Vercel, confirmer l'absence de réutilisation et refaire la recette après chaque modification des outils. |
| RGPD-05 — responsabilité démontrable | Registre, matrice, procédures droits/violations, inventaire fournisseurs et décision sur les mesures sont présents dans ce dossier. | Jouer les deux exercices, attribuer un suppléant et conserver leurs comptes rendus dans l'espace privé. |
| RGPD-06 — minimisation | Nom facultatif, avertissement sur le texte libre, réencodage systématique des images, suppression EXIF/nom et rappel dans l'administration. | Confirmer par écrit que l'adresse et le téléphone publiés sont volontaires et nécessaires ; contrôler périodiquement un échantillon de photos. |

## Documents

- [Registre des traitements](./registre-traitements.md)
- [Matrice de conservation et de purge](./matrice-conservation.md)
- [Prestataires et transferts](./prestataires-transferts.md)
- [Procédure d'exercice des droits](./procedure-droits.md)
- [Procédure de gestion des violations](./procedure-violations.md)
- [Décision relative aux mesures d'audience](./mesures-audience.md)
- [Historique de la politique publique](./historique-politique.md)

## Contrôles bloquants avant mise en production

Ces cases exigent un accès aux comptes fournisseurs et ne peuvent pas être
validées par le code.

- [ ] Confirmer le nom du forfait Vercel de production. Le DPA Vercel daté du
  17 mars 2026 annonce couvrir les forfaits Pro et Enterprise : si le projet
  est en Hobby, obtenir une couverture contractuelle écrite ou migrer avant de
  présenter le DPA comme applicable.
- [ ] Télécharger les versions effectivement acceptées des DPA Vercel et
  Resend, leurs clauses contractuelles types et leurs listes de sous-traitants.
  Conserver date, source, empreinte du fichier et compte auquel ils s'appliquent.
- [ ] Vérifier la région Resend et garder à l'esprit qu'elle ne change pas le
  stockage des métadonnées, journaux et données de compte aux États-Unis.
- [ ] Désactiver le suivi d'ouverture et de clic dans Resend ; faire une capture
  datée du réglage.
- [ ] Configurer dans Proton Mail une suppression des demandes sans suite six
  mois après le dernier échange, ou inscrire une revue manuelle mensuelle au
  calendrier.
- [ ] Vérifier les durées du forfait Vercel actif : journaux, Web Analytics et
  Speed Insights. Reporter la preuve dans la matrice.
- [ ] Archiver les pages de confidentialité Web Analytics et Speed Insights,
  confirmer contractuellement que les données ne sont ni réutilisées ni
  recoupées pour le compte de Vercel, et dater l'auto-évaluation CNIL.
- [ ] S'abonner aux notifications de changement de sous-traitants de Vercel et
  Resend ; inscrire un propriétaire et un délai de revue de 15 jours.
- [ ] Désigner un suppléant capable de traiter une demande de droit et un
  incident lorsque Philippe Lopez est indisponible.
- [ ] Jouer un exercice de droit et un exercice de violation de bout en bout.
- [ ] Confirmer par écrit que l'adresse postale et le téléphone publics sont
  volontairement publiés et limités à ce qu'exigent l'activité et la loi.

## Preuves techniques attendues à chaque version

1. Capture du formulaire montrant la notice avant l'envoi.
2. Capture de la politique avec son numéro de version.
3. Test réseau public : scripts présents et aucun événement personnalisé.
4. Inspection des événements : statistiques anonymes et URL sans paramètre ni
   fragment.
5. Test des routes privées : aucun script au chargement et aucun événement
   admin ou API après une navigation côté client.
6. Journal du cron quotidien montrant le bilan images et versions.
7. Test d'une photo avec EXIF/GPS confirmant l'absence de métadonnées en sortie.
8. Résultats de lint, build et inspection des gardes de session compilées.

## Références de pilotage

- [Article 13 du RGPD présenté par la CNIL](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3)
- [Registre des activités de traitement — CNIL](https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement)
- [Répondre aux demandes d'exercice des droits — CNIL](https://www.cnil.fr/fr/respecter-les-droits-des-personnes/repondre-aux-demandes-dexercice-des-droits)
- [Gérer les incidents et violations — CNIL](https://www.cnil.fr/fr/securite-gerer-les-incidents-et-les-violations)
- [Exemption de consentement pour la mesure d'audience — CNIL](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)
