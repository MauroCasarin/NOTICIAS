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
          content: `Analiza estos titulares: ${titulos}. 
          1. Identifica el tema principal y cuántas veces aproximadamente se repite en los medios.
          2. Haz un resumen extendido de 3 a 4 oraciones sobre de qué se está hablando más.
          3. Busca y destaca si hay información sobre cotizaciones (Dólar, MEP, Blue, BCRA, Inflación). 
          Responde con un tono informativo y estructurado.`
        }]
      })
    });

    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error en la IA' });
  }
}