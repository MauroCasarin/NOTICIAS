// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const { titulos } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Analiza estos titulares y realiza un resumen extenso (aproximadamente 3 o 4 oraciones). Primero identifica cuál es el tema más repetido en todos los medios y luego explica brevemente por qué es noticia hoy: ${titulos}`
        }]
      })
    });

    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error en la IA' });
  }
}