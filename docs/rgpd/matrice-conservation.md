# Matrice de conservation et de purge

**Version :** 1.1 — 16 août 2026  
**Propriétaire :** Philippe Lopez

Une durée se calcule depuis l'événement de départ indiqué, pas depuis une date
arbitraire. En cas de litige ou d'obligation légale, seules les données
nécessaires sont placées dans une archive séparée à accès limité ; la raison,
la durée et les personnes habilitées sont consignées.

| Catégorie | Stockage | Durée ou critère | Déclencheur | Mode d'effacement | Preuve attendue |
|---|---|---|---|---|---|
| Message sans suite commerciale | Proton Mail | 6 mois | Dernier échange émanant de la personne ou clôture explicite | Règle de boîte ou revue manuelle mensuelle | Journal mensuel : date, nombre supprimé, anomalie, sans recopier le contenu |
| Copie technique du message | Resend | 30 jours annoncés sur tous les forfaits | Envoi | Purge fournisseur ; vérifier le réglage et le contrat | Capture du réglage et test annuel de recherche après échéance |
| Demande menant à un devis sans commande | Dossier commercial privé | 1 an au maximum, sauf besoin de preuve documenté | Émission ou dernier échange relatif au devis | Revue annuelle et suppression | Journal de revue |
| Échanges nécessaires à une prestation | Dossier commercial privé | Relation commerciale, puis délai légal applicable à la preuve ou obligation concernée | Fin de relation ou événement légal | Archivage intermédiaire séparé, puis suppression | Référence au texte, date d'échéance et journal de destruction |
| Empreinte anti-rafale | Mémoire de la fonction | 15 minutes | Première tentative de la fenêtre | Expiration automatique ou redémarrage | Test automatisé ou recette |
| Empreinte de message identique | Mémoire de la fonction | 30 minutes | Premier envoi accepté | Expiration automatique ou redémarrage | Test automatisé ou recette |
| Journaux runtime Vercel accessibles | Vercel | Durée du forfait, maximum interne 30 jours | Émission du journal | Expiration fournisseur ; ne jamais exporter en vrac | Capture semestrielle du forfait et de la durée |
| Web Analytics | Vercel | Fenêtre du forfait : Hobby 1 mois, Pro 12 mois, Plus/Enterprise 24 mois ; le fournisseur indique pouvoir stocker plus longtemps pour un changement de forfait | Visite d'une page publique | Expiration fournisseur des statistiques agrégées ; aucun identifiant individuel accessible à Atelier Petita | Capture du forfait et demande écrite au fournisseur sur la durée résiduelle |
| Speed Insights | Vercel | Hobby 7 jours, Pro 30 jours, Enterprise 90 jours | Mesure de performance sur 20 % des visites publiques | Expiration fournisseur des statistiques agrégées | Capture du forfait |
| Cookie d'administration | Navigateur administrateur | 30 jours au maximum | Authentification | Expiration ou déconnexion | Test cookie |
| Image publiée | Vercel Blob | Tant que la publication est utile | Retrait de l'annonce ou du visuel | Suppression immédiate tentée ; reprise par cron si échec | Journal action et bilan cron |
| Image envoyée puis abandonnée | Vercel Blob | Au moins 24 h pour finir la saisie, puis jusqu'au prochain cron quotidien | Envoi sans publication | Balayage quotidien des orphelines | Bilan cron images |
| Version précédente du catalogue | Vercel Blob | Au moins 24 h pour les lectures CDN, puis jusqu'au prochain cron quotidien | Écriture d'une nouvelle version | Purge quotidienne ; la version courante est toujours conservée | Bilan cron versions |
| Ancien fichier de données non versionné | Vercel Blob | Jusqu'à la première purge après existence d'une version datée | Migration au format versionné | Purge quotidienne | Bilan cron versions |
| Politique et registre | Git pour les modèles, espace privé pour les preuves signées | Durée de l'activité puis archivage probatoire défini | Nouvelle version ou fin d'activité | Conservation versionnée ; aucune donnée de demande/incident dans Git | Historique des versions |
| Demande d'exercice d'un droit | Registre privé | Temps nécessaire au traitement, puis preuve minimale pendant 5 ans si nécessaire à la défense de droits ; à valider selon le contexte | Clôture de la demande | Supprimer pièces d'identité immédiatement après vérification ; réduire le registre aux dates, droit, décision et preuve d'envoi | Registre privé |
| Registre des violations | Registre privé | 5 ans retenus comme règle interne, à réévaluer selon risques et prescriptions | Clôture de l'incident | Revue annuelle et destruction sécurisée à échéance | Registre privé |

## Procédure mensuelle

Le premier jour ouvré de chaque mois :

1. rechercher les conversations de contact sans échange depuis six mois ;
2. vérifier qu'aucune relation, obligation ou procédure en cours ne justifie une
   conservation séparée ;
3. supprimer les conversations concernées et vider la corbeille selon le
   fonctionnement de la boîte ;
4. vérifier le dernier bilan du cron Blob et traiter toute ligne en échec ;
5. noter dans le journal privé la date, le volume, l'opérateur et les anomalies,
   sans copier les noms, e-mails ou messages.

La route planifiée renvoie un statut non réussi si le store n'est pas configuré
ou si au moins une opération échoue. Une réponse `200` accompagnée des deux
bilans constitue ainsi une preuve exploitable, pas seulement l'absence d'erreur
visible.

## Contrôle semestriel

- comparer les durées ci-dessus aux forfaits Vercel, Resend et Proton actifs ;
- vérifier si un fournisseur conserve des sauvegardes ou données au-delà de la
  fenêtre affichée ;
- tester une suppression complète sur un contact fictif ;
- raccourcir toute durée qui n'est plus nécessaire ;
- mettre à jour simultanément registre, politique publique et historique.

Référence : [guide CNIL sur les durées de conservation](https://www.cnil.fr/sites/default/files/atoms/files/guide_durees_de_conservation.pdf).
