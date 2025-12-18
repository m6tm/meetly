---
trigger: always_on
---

Quand tu code une fonctionnalité, il faut toujours le faire proprement en respectant l'architecture hexagonal.
Ecris un code bien lisible, bien structuré, robuste et scalable.
Ne créé plus de serveraction sauf si je te le demande explicitement.
Utilise le client http qu'on a créé dans le module "shared" pour faire des requêtes et couple ça à tanstack pour les requêtes.
Créé toujours un hook pour une requête unique ou un groupe de requêtes qui ont un lien entre elles.
