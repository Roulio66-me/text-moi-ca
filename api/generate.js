
// api/generate.js
// Fonction serverless Vercel — appelle l'API Anthropic côté serveur.
// La clé API reste secrète (jamais exposée au navigateur).
//
// DÉPLOIEMENT :
// 1. Place ce fichier dans un dossier /api à la racine de ton projet Vercel.
// 2. Dans les paramètres du projet Vercel > Environment Variables, ajoute :
//    ANTHROPIC_API_KEY = ta_clé_api (créée sur console.anthropic.com)
// 3. Le front-end appelle POST /api/generate au lieu d'appeler Anthropic directement.

module.exports = async (req, res) => {
  // On n'accepte que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilise POST.' });
  }

  const { situation, tone } = req.body || {};

  // Validation basique des entrées
  if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ "situation" est requis.' });
  }
  if (!tone || typeof tone !== 'string') {
    return res.status(400).json({ error: 'Le champ "tone" est requis.' });
  }
  // On limite la taille pour éviter les abus / coûts anormaux
  if (situation.length > 2000) {
    return res.status(400).json({ error: 'Situation trop longue (2000 caractères max).' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API non configurée côté serveur.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        // Sonnet offre le meilleur compromis qualité/prix pour capter les nuances
        // de ton en français (voir la discussion pricing du projet).
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system:
          "Tu es un assistant qui aide des francophones à formuler des messages personnels difficiles (conflits, demandes, mises au point). Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après, sans balises markdown, au format exact : {\"variants\": [\"message 1\", \"message 2\"]}. Fournis exactement 2 propositions de message, chacune courte (2 à 4 phrases), naturelles, prêtes à copier-coller telles quelles, dans le ton demandé par l'utilisateur.",
        messages: [
          { role: 'user', content: `Situation : ${situation}\n\nTon souhaité : ${tone}` }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur API Anthropic:', errText);
      return res.status(502).json({ error: "La génération a échoué, réessaie dans un instant." });
    }

    const data = await response.json();
    const textBlocks = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');
    const clean = textBlocks.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('Réponse IA non parsable:', clean);
      return res.status(502).json({ error: "Réponse invalide, réessaie." });
    }

    return res.status(200).json({ variants: parsed.variants });

  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ error: "Erreur serveur, réessaie dans un instant." });
  }
};
