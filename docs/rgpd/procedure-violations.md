# Procédure de gestion des incidents et violations de données

**Version :** 1.0 — 16 août 2026  
**Décideur :** Philippe Lopez  
**Suppléant :** à désigner avant production  
**Point de départ du délai :** moment où Atelier Petita a une certitude
raisonnable qu'un incident de sécurité a compromis des données personnelles.

Toute violation, même sans notification à la CNIL, est inscrite dans un registre
privé. Aucun détail d'incident, donnée personnelle, secret, jeton ou preuve
technique sensible ne doit être commité dans ce dépôt.

## 1. Signaler et contenir immédiatement

Exemples : boîte mail compromise, clé Resend ou Blob exposée, cookie
administrateur volé, publication accidentelle d'une photo personnelle, accès
indu aux journaux, suppression ou altération de données, message envoyé au
mauvais destinataire.

1. Noter heure de découverte, déclarant, système, faits observés et actions.
2. Protéger les personnes avant la continuité de service : couper la fonction
   concernée si nécessaire.
3. Révoquer les sessions, clés et accès compromis ; changer les secrets sans
   recopier leur valeur dans le registre.
4. Retirer un contenu public, suspendre le formulaire ou la mesure si le flux
   est en cause.
5. Préserver les seules preuves nécessaires dans un espace privé en lecture
   limitée, avec date et empreinte ; ne pas altérer les originaux utiles.
6. Contacter sans délai le support sécurité du fournisseur concerné et demander
   périmètre, dates, données, destinataires, mesures et journaux.

## 2. Qualifier sous 24 heures

Une violation est une destruction, perte, altération, divulgation non autorisée
ou un accès non autorisé à des données personnelles, accidentel ou illicite.

Consigner :

- nature : confidentialité, intégrité et/ou disponibilité ;
- source et cause probable ;
- date de début, date de fin et date de connaissance ;
- catégories et volume approximatif de personnes ;
- catégories et volume approximatif de données ;
- caractère public, chiffré, pseudonymisé ou directement lisible ;
- destinataires réels ou possibles et possibilité de récupération ;
- conséquences possibles : fraude, hameçonnage, atteinte à la vie privée,
  usurpation, perte financière, réputation ou impossibilité d'exercer un droit ;
- probabilité et gravité pour les personnes ;
- mesures prises et risque résiduel.

## 3. Décider des notifications

| Risque pour les personnes | Registre interne | Notification CNIL | Information des personnes |
|---|---:|---:|---:|
| Aucun risque | Oui | Non, avec justification | Non |
| Risque | Oui | Oui, si possible sous 72 heures | Selon le contexte |
| Risque élevé | Oui | Oui, si possible sous 72 heures | Oui, dans les meilleurs délais, sauf exception légale documentée |

La notification CNIL appartient au responsable de traitement, même si
l'incident vient d'un sous-traitant. Si toutes les informations ne sont pas
disponibles, notifier progressivement. Au-delà de 72 heures, expliquer le
retard.

Portail : [notifier une violation à la CNIL](https://notifications.cnil.fr/notifications/index).

## 4. Contenu de la notification CNIL

Préparer au minimum :

1. nature de la violation ;
2. catégories et nombre approximatif de personnes ;
3. catégories et nombre approximatif d'enregistrements ;
4. coordonnées du contact Atelier Petita ;
5. conséquences probables ;
6. mesures prises ou proposées pour remédier et atténuer ;
7. chronologie et raisons de tout retard.

Conserver le récépissé et les échanges dans le dossier privé.

## 5. Information des personnes

En cas de risque élevé, utiliser des mots simples et un canal direct. Indiquer :

- ce qui s'est passé et quand ;
- quelles données sont concernées ;
- les conséquences probables ;
- ce qu'Atelier Petita a déjà fait ;
- les actions concrètes recommandées à la personne ;
- un contact pour les questions et les droits ;
- les mises à jour à venir.

Ne pas minimiser ni spéculer. Ne pas inclure de secret, détail exploitable ou
donnée d'une autre personne.

## 6. Rétablir et clôturer

1. Vérifier la révocation de toutes les clés/sessions et le retrait des données
   exposées, y compris caches, versions et corbeilles.
2. Restaurer depuis une sauvegarde vérifiée si nécessaire.
3. Surveiller les signes de réutilisation sans accroître indûment la collecte.
4. Documenter la cause racine, les actions, propriétaires et échéances.
5. Mettre à jour registre, analyse de risque, fournisseurs, code et formation.
6. Tester les corrections et revoir leur efficacité sous 30 jours.
7. Clore avec une décision signée et planifier la suppression des preuves selon
   la matrice.

## Contacts à renseigner dans le dossier privé

- Suppléant Atelier Petita :
- Conseil juridique / assurance :
- Vercel sécurité/support :
- Resend sécurité/support :
- Proton sécurité/support :
- Hébergeur DNS / registraire :
- CNIL :

## Exercice annuel

Scénario recommandé : un jeton Resend est exposé et des messages de contact des
30 derniers jours sont potentiellement accessibles.

Chronométrer : détection, révocation, contact fournisseur, qualification,
décision CNIL, projet d'information des personnes et clôture. Conserver le
compte rendu sans valeur secrète ni donnée réelle.

Références :

- [Sécurité : gérer les incidents et les violations — CNIL](https://www.cnil.fr/fr/securite-gerer-les-incidents-et-les-violations)
- [Violations de données : les règles à suivre — CNIL](https://www.cnil.fr/fr/violations-de-donnees-personnelles-les-regles-suivre)
