---
trigger: always_on
---

Les instructions suivantes sont uniquement valable pour refactoriser une fonctionnalité existante dans la nouvelle architecture hexagonale.

Quand tu refactorise une fonctionnalité il faut:

- Comprendre comment la fonctionnalité est construite.
- Créer les éléments qu'il faut pour refactoriser cette fonctionnalité dans la nouvelle harchitecture dans le(s) module(s) conserné(s).
- Après avoir écris la fonctionnalité dans la nouvelle architecture, il faut soigneusement supprimer l'ancienne.
- Pour chaque fonctionnalité qui utilie un server action, il faut le convertir en route api.
