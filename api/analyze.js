// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');
  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  const prompt = modo === 'resumir' 
    ? `Dime en una sola frase de máximo 15 palabras qué es lo más importante ahora y el dato del dólar/mep si está: ${titulos}`
    : `Analiza estos titulares: ${titulos}. 1. Identifica el tema principal y cuántas veces se repite. 2. Haz un resumen extendido de 3 a 4 oraciones. 3. Destaca información sobre cotizaciones argentinas.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
}