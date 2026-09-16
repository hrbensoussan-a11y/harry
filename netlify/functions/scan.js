/* ============================================================
   Bachote — fonction serverless « scan »
   Reçoit une image (data URL), la fait lire par un modèle de
   vision, et renvoie le texte extrait, mis en lignes
   « terme : définition » prêtes à devenir des cartes.

   Active seulement sur le site déployé (Netlify), avec les
   variables d'environnement :
     - ANTHROPIC_API_KEY : ta clé API
     - ANTHROPIC_MODEL   : l'identifiant du modèle de vision à utiliser
   Sans clé configurée, la fonction répond 501 et le site
   bascule tout seul sur la reconnaissance du navigateur / le mode manuel.
   ============================================================ */

exports.handler = async function (event) {
  var JSON_HEADERS = { "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: "method" }) };
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  var model = process.env.ANTHROPIC_MODEL;
  if (!apiKey || !model) {
    // Non configuré : le client comprend qu'il n'y a pas d'IA et bascule ailleurs.
    return { statusCode: 501, headers: JSON_HEADERS, body: JSON.stringify({ error: "not-configured" }) };
  }

  var image;
  try { image = JSON.parse(event.body || "{}").image; } catch (e) { image = null; }
  if (!image || typeof image !== "string" || image.indexOf("data:image/") !== 0) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "no-image" }) };
  }

  // data:image/png;base64,XXXX  →  media type + données
  var m = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!m) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "bad-image" }) };
  }
  var mediaType = m[1], base64 = m[2];

  var prompt =
    "Tu lis une photo de notes de cours (souvent manuscrites). " +
    "Extrais les couples terme → définition. " +
    "Réponds UNIQUEMENT par des lignes au format « terme : définition », une par carte, sans numérotation, " +
    "sans titre, sans commentaire. Conserve la langue d'origine. " +
    "Si la photo ne contient pas de définitions, renvoie le texte tel quel, une idée par ligne.";

  try {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!res.ok) {
      var detail = await res.text();
      return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ error: "upstream", detail: detail.slice(0, 500) }) };
    }
    var data = await res.json();
    var text = (data && Array.isArray(data.content))
      ? data.content.filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("\n").trim()
      : "";
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ text: text }) };
  } catch (e) {
    return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ error: "fetch", detail: String(e).slice(0, 300) }) };
  }
};
