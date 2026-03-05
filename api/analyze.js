// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const { titulos } = req.body;
  
  // Vercel busca automáticamente la clave que pusiste en "Environment Variables"
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la configuración NoticiasAPI en Vercel' });
  }

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
          content: `Analiza estos titulares y resume en una frase de máximo 15 palabras la noticia que más se repite o tendencia clave: ${titulos}`
        }]
      })
    });

    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error en la conexión con la IA' });
  }
}