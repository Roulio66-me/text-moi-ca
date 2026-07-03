# Texte-moi ça — Guide de déploiement

## Structure du projet
```
/
├── texte-moi-ca-mvp.html    ← le site (page unique)
└── api/
    └── generate.js            ← fonction serverless (appel IA sécurisé)
```

## Étapes pour déployer sur Vercel

### 1. Récupère ta clé API Anthropic
- Va sur https://console.anthropic.com
- Crée une clé API (section "API Keys")
- Ajoute du crédit (quelques euros suffisent largement pour commencer, vu le coût par génération)

### 2. Déploie sur Vercel
- Pousse ce dossier sur un repo GitHub
- Connecte le repo sur https://vercel.com (import project)
- Vercel détectera automatiquement le dossier `/api` comme des fonctions serverless

### 3. Ajoute ta clé API en variable d'environnement
- Dans le dashboard Vercel : **Project Settings → Environment Variables**
- Ajoute :
  - Nom : `ANTHROPIC_API_KEY`
  - Valeur : ta clé API (celle de l'étape 1)
  - Environnements : Production, Preview, Development
- Redéploie le projet pour que la variable soit prise en compte

### 4. Renomme le fichier HTML si besoin
- Si tu veux que le site s'ouvre sur `/`, renomme `texte-moi-ca-mvp.html` en `index.html`

## Vérifications avant lancement

- [ ] Le plafond de 100 messages/mois est actif (voir `MONTHLY_LIMIT` dans le `<script>` du HTML)
- [ ] Les prix affichés correspondent à ta vraie grille tarifaire (3,99€/mois, 2,49€/mois annuel)
- [ ] Le paiement réel n'est **pas encore implémenté** — le bouton "Commencer mon essai gratuit" n'est qu'une démo visuelle pour l'instant. Il faudra intégrer un vrai prestataire de paiement (Stripe est le plus simple pour un abonnement avec essai gratuit + carte requise) avant le lancement public.
- [ ] Le compte à rebours utilise le `localStorage` du navigateur — teste bien en dehors de l'aperçu Claude pour vérifier qu'il fonctionne comme prévu.

## Coût réel estimé

Avec le modèle Claude Sonnet et un plafond de 100 messages/mois/utilisateur :
- Coût max par utilisateur actif : ~0,60-0,70€/mois
- Marge sur l'abonnement à 3,99€/mois : ~85%+
