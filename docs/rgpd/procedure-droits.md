# Procédure d'exercice des droits

**Version :** 1.1 — 16 août 2026  
**Responsable :** Philippe Lopez  
**Canal public :** petita-lumieres@protonmail.com  
**Délai cible interne :** accusé de réception sous 3 jours ouvrés, réponse
complète sous 21 jours, sans dépasser un mois sauf prolongation justifiée.

Le registre réel des demandes est privé. Il ne doit pas être ajouté au dépôt.
Il contient uniquement : numéro interne, date de réception, droit demandé,
échéance, vérification d'identité effectuée, sources consultées, décision, date
de réponse et date d'effacement des pièces temporaires.

## 1. Recevoir et sécuriser la demande

1. Inscrire immédiatement la date de réception et calculer l'échéance d'un mois.
2. Accuser réception sans révéler de donnée et annoncer le délai.
3. Ne jamais demander automatiquement une pièce d'identité. Vérifier d'abord
   par une réponse depuis l'adresse utilisée lors du contact ou par une
   information déjà connue de la personne.
4. En cas de doute raisonnable, demander uniquement le justificatif strictement
   nécessaire, par un canal adapté, puis le supprimer dès la vérification.
5. Vérifier que la demande ne porte pas sur un tiers ; masquer les données de
   tiers dans toute copie.

## 2. Qualifier le droit

- **Accès :** confirmer l'existence ou non de données, fournir une copie
  intelligible et les informations sur finalités, sources, destinataires,
  transferts, durées et droits.
- **Rectification :** corriger les données inexactes dans toutes les copies
  actives et informer les destinataires lorsque cela est pertinent.
- **Effacement :** supprimer ce qui n'est plus nécessaire ou dont l'effacement
  est requis ; documenter précisément toute exception légale.
- **Limitation :** geler l'usage sans effacer pendant l'examen d'une
  contestation ou lorsqu'une obligation le requiert.
- **Opposition :** arrêter le traitement fondé sur l'intérêt légitime sauf motif
  légitime impérieux documenté. Aucune prospection n'est actuellement réalisée.
- **Portabilité :** fournir les données remises par la personne, dans un format
  courant, lorsque le traitement automatisé repose sur consentement ou contrat
  et que les conditions sont réunies.
- **Retrait du consentement :** aucune mesure d’audience du site ne repose sur
  le consentement. Si un autre traitement fondé sur celui-ci est identifié,
  arrêter les opérations futures concernées sans remettre en cause le passé
  licite.

## 3. Rechercher les données

Utiliser une adresse e-mail de test pour répéter cette recherche chaque année.

| Source | Recherche/action |
|---|---|
| Proton Mail | Rechercher adresse, nom éventuel et fils associés ; inclure envoyés, archives, libellés, corbeille et exports éventuels. |
| Resend | Rechercher l'envoi si moins de 30 jours ; exporter ou supprimer selon le droit et les fonctions du contrat. |
| Journaux Vercel | Rechercher uniquement si la demande fournit une date/heure et si l'identification est possible sans collecter davantage ; les fenêtres sont courtes. |
| Anti-abus applicatif | Les empreintes sont salées par instance, non réversibles et expirent sous 30 minutes : Atelier Petita ne peut normalement pas les rattacher à une personne. |
| Web Analytics/Speed Insights | Les interfaces fournissent des statistiques anonymes sans identifiant individuel accessible à Atelier Petita ; expliquer qu'aucune donnée propre à la personne ne peut être isolée, exportée ou supprimée. |
| Cloudflare R2/catalogue | Vérifier textes, descriptions et images si la personne indique le contenu public concerné ; retirer le contenu actif et contrôler la purge des versions/orphelins. |
| Dossiers commerciaux privés | Rechercher devis, commandes, factures et preuves séparées ; appliquer les obligations légales avant effacement. |

## 4. Décider et exécuter

1. Réunir les résultats sans les copier dans un outil non inventorié.
2. Appliquer le droit dans chaque source et chez chaque destinataire pertinent.
3. Pour un effacement R2, retirer d'abord la référence active, lancer ou
   attendre le cron, puis vérifier le bilan versions et images.
4. Pour une rectification ou un effacement, informer les destinataires auxquels
   les données ont été communiquées, sauf impossibilité ou effort
   disproportionné documenté.
5. Contrôler le résultat avec une seconde recherche.

## 5. Répondre

La réponse doit :

- être concise, compréhensible et transmise par un canal sûr ;
- préciser les actions, sources et dates d'exécution ;
- fournir les données dans un format courant si demandé ;
- expliquer toute donnée non retrouvable ou déjà agrégée ;
- justifier précisément tout refus ou limitation ;
- rappeler la possibilité de saisir la CNIL.

Une prolongation de deux mois n'est possible qu'en raison de la complexité ou du
nombre de demandes. La personne doit être informée de la prolongation et de ses
motifs dans le premier mois.

## 6. Clore

1. Consigner date, décision et preuve d'envoi dans le registre privé.
2. Supprimer immédiatement toute copie de pièce d'identité.
3. Réduire la preuve à ce qui est nécessaire pour démontrer le traitement de la
   demande.
4. Planifier l'échéance de suppression de cette preuve selon la matrice.
5. Noter toute difficulté révélant une lacune du registre ou d'un fournisseur.

## Exercice annuel

Avec un contact fictif :

1. envoyer un formulaire ;
2. retrouver le message chez Resend et Proton ;
3. préparer un export ;
4. rectifier le nom facultatif ;
5. effacer le fil et vérifier les corbeilles ;
6. mesurer les délais et conserver uniquement le compte rendu, sans les données
   du contact test.

Références :

- [Répondre à une demande de droit d'accès — CNIL](https://www.cnil.fr/fr/repondre-une-demande-de-droit-dacces)
- [Répondre aux demandes d'exercice des droits — CNIL](https://www.cnil.fr/fr/respecter-les-droits-des-personnes/repondre-aux-demandes-dexercice-des-droits)
