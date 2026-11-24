# Prestataires, sous-traitants et transferts

**Version :** 1.1 — 16 août 2026  
**Propriétaire :** Philippe Lopez  
**Fréquence de revue :** semestrielle et sous 15 jours après toute notification
de changement de sous-traitant.

Ce document est un inventaire de pilotage. Une page web fournisseur ne prouve
pas que le contrat s'applique au compte Atelier Petita : la preuve est la
version acceptée, reliée au bon compte et au bon forfait.

## Cloudflare (R2)

| Élément | État à documenter |
|---|---|
| Entité | Cloudflare, Inc., États-Unis ; Cloudflare Ltd pour les clients de l'EEE selon le contrat applicable. |
| Services | Stockage R2 des photos publiées et du catalogue (annonces, visuels), diffusion des photos par le domaine public du bucket. |
| Données | Photos publiées et leurs éventuelles métadonnées résiduelles ; textes du catalogue ; adresse IP et métadonnées techniques des requêtes de lecture et d'envoi. |
| Rôle | Sous-traitant pour les contenus stockés selon le DPA Cloudflare. |
| Lieux | Bucket à créer avec la juridiction **UE** : les objets sont alors stockés dans l'Union. La diffusion par le réseau Cloudflare et le support peuvent impliquer d'autres pays. |
| Garanties annoncées | DPA incorporé aux conditions, clauses contractuelles types, certification Data Privacy Framework. |
| Point bloquant | Confirmer la juridiction UE du bucket et archiver le DPA accepté par le compte. |
| Preuves privées à archiver | DPA, capture de la juridiction du bucket, liste des sous-traitants, jetons d'API existants et leur portée. |

Sources officielles :

- [DPA Cloudflare](https://www.cloudflare.com/cloudflare-customer-dpa/)
- [Juridictions R2](https://developers.cloudflare.com/r2/reference/data-location/)

## Vercel

| Élément | État à documenter |
|---|---|
| Entité | Vercel Inc., États-Unis. |
| Services | Hébergement Next.js, fonctions, journaux, Web Analytics et Speed Insights. |
| Données | Requêtes et métadonnées techniques ; points anonymes d'audience/performance des pages publiques ; données du compte administrateur. |
| Rôle | Sous-traitant pour les données client selon le contrat applicable ; responsable distinct pour certaines données générées par le service selon son DPA. |
| Lieux | Traitement principal annoncé aux États-Unis et chez les sous-traitants listés par Vercel. |
| Garanties annoncées | DPA et clauses contractuelles types 2021 ; mesures complémentaires et contrats avec les sous-traitants. |
| Point bloquant | Le DPA Vercel mis à jour le 17 mars 2026 indique s'appliquer aux comptes Pro et Enterprise. Confirmer le forfait de production et la prise d'effet contractuelle. |
| Preuves privées à archiver | Contrat/conditions, DPA signé ou incorporé, SCC, liste des sous-traitants, capture du forfait, durées logs/Analytics/Speed, analyse de transfert, notifications sous-traitants. |

Sources officielles :

- [DPA Vercel](https://vercel.com/legal/dpa)
- [Sous-traitants et sécurité Vercel](https://security.vercel.com/)
- [Confidentialité Web Analytics](https://vercel.com/docs/analytics/privacy-policy)
- [Confidentialité Speed Insights](https://vercel.com/docs/speed-insights/privacy-policy)
- [Tarification et fenêtres Web Analytics](https://vercel.com/docs/analytics/limits-and-pricing)
- [Fenêtres Speed Insights](https://vercel.com/docs/speed-insights/limits-and-pricing)
- [Durées des journaux runtime](https://vercel.com/docs/logs/runtime)

### Décision avant production

- [ ] Forfait exact :
- [ ] Date de prise d'effet du DPA :
- [ ] Version/empreinte du DPA archivé :
- [ ] SCC et analyse de transfert archivées :
- [ ] Notifications de sous-traitants activées :
- [ ] Fenêtre journaux :
- [ ] Fenêtre Web Analytics :
- [ ] Fenêtre Speed Insights :
- [ ] Absence de réutilisation/recoupement confirmée et auto-évaluation CNIL archivée :
- [ ] Compte et personnes habilitées revus :

Si le compte ne bénéficie pas du DPA annoncé, choisir avant production entre
un passage au forfait couvert, une confirmation contractuelle écrite ou un
hébergeur offrant le cadre requis. La publication du site commercial sur un
forfait réservé à un usage personnel/non commercial doit aussi être vérifiée
indépendamment du RGPD.

## Resend

| Élément | État à documenter |
|---|---|
| Entité | Plus Five Five, Inc., opérant Resend, États-Unis. |
| Service | Acheminement transactionnel du formulaire vers la boîte Proton. |
| Données | Nom facultatif, e-mail, message, destinataire, contenu et métadonnées de livraison. |
| Rôle | Sous-traitant pour l'acheminement ; rôles propres éventuels décrits par son DPA/politique. |
| Lieux | Données de compte, métadonnées, journaux et API annoncés comme stockés aux États-Unis, même si l'envoi passe par l'Irlande. |
| Garanties annoncées | DPA, clauses contractuelles types et mesures complémentaires. |
| Conservation annoncée | Données d'e-mail 30 jours sur tous les forfaits ; sauvegardes annoncées 30 jours. |
| Réglage à imposer | Suivi d'ouverture et de clic désactivé ; aucun webhook ni export de long terme sans nouvelle analyse. |
| Preuves privées à archiver | DPA applicable au compte, SCC, sous-traitants, région, captures tracking désactivé, durée, clé et habilitations revues. |

Sources officielles :

- [DPA Resend](https://resend.com/legal/dpa)
- [Liste des sous-traitants Resend](https://resend.com/legal/subprocessors)
- [Choix de région et stockage](https://resend.com/docs/dashboard/domains/regions)
- [Conservation de 30 jours](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data)
- [Sécurité et sauvegardes](https://resend.com/docs/security)

### Décision avant production

- [ ] DPA et SCC applicables archivés :
- [ ] Liste des sous-traitants archivée :
- [ ] Région d'envoi :
- [ ] Tracking ouverture/clic désactivé, capture :
- [ ] Aucun webhook/export non inventorié :
- [ ] Membres du compte et clés API revus :
- [ ] Notifications de sous-traitants activées :

## Proton Mail

| Élément | État à documenter |
|---|---|
| Entité | Proton AG, Route de la Galaise 32, 1228 Plan-les-Ouates, Suisse. |
| Service | Boîte finale recevant et conservant les échanges. |
| Données | Nom facultatif, e-mail, message et échanges ultérieurs. |
| Lieu/cadre | Suisse ; la Commission européenne a confirmé en 2024 le maintien de l'adéquation. |
| Rôle | Fournisseur de messagerie ; vérifier les conditions du forfait et le DPA Proton Business si applicable. |
| Réglage à imposer | Accès MFA, appareils/sessions revus, suppression à six mois pour les demandes sans suite, sauvegardes/corbeille comprises. |
| Preuves privées à archiver | Conditions et DPA applicables, capture de la règle de purge, liste d'accès, MFA et procédure d'export/suppression. |

Sources officielles :

- [Politique de confidentialité Proton](https://proton.me/legal/privacy)
- [Rapport de la Commission européenne sur l'adéquation de la Suisse](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:52024DC0007)

### Décision avant production

- [ ] Forfait et conditions applicables :
- [ ] DPA si disponible/applicable :
- [ ] Règle ou calendrier de purge à six mois :
- [ ] Corbeille et sauvegardes vérifiées :
- [ ] MFA actif et sessions revues :
- [ ] Suppléant habilité :

## Analyse de transfert à conserver dans l'espace privé

Pour Vercel et Resend, consigner séparément :

1. les catégories et volumes de données transférées ;
2. les finalités, fréquence et personnes concernées ;
3. les pays et sous-traitants ;
4. le mécanisme juridique invoqué pour chaque flux ;
5. l'applicabilité réelle du DPA et des SCC au compte ;
6. la législation et les risques d'accès public pertinents ;
7. les mesures supplémentaires : minimisation, chiffrement en transit,
   réencodage des images, absence de données sensibles, durée courte,
   habilitations et journalisation ;
8. le risque résiduel et la décision signée ;
9. la date de prochaine revue et le déclencheur de réexamen.

## Réaction à un changement fournisseur

Dans les 15 jours suivant une notification :

1. identifier les données et pays concernés ;
2. vérifier le contrat et le mécanisme de transfert ;
3. apprécier si le risque ou la politique publique change ;
4. s'opposer, désactiver la fonction ou remplacer le fournisseur si les
   garanties deviennent insuffisantes ;
5. dater la décision et mettre à jour registre, politique et historique.
