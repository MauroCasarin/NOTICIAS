// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la Variable de Entorno: NoticiasAPI' });
  }

  // Prompt optimizado para un "Veredicto Total" y búsqueda de cotizaciones
  const prompt = modo === 'resumir' 
    ? `VEREDICTO FLASH: Basado en estos titulares, dime en máximo 15 palabras lo más importante y el dólar/mep: ${titulos}`
    : `VEREDICTO TOTAL: Analiza todos estos titulares. 
       1. Identifica el tema más repetido y cuántas veces aparece.
       2. Resume en 4 oraciones la tendencia informativa del momento.
       3. Detalla cotizaciones argentinas (Dólar Blue, MEP, Oficial) si figuran.
       Titulares: ${titulos}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Eres un analista de medios experto. Das veredictos precisos y detectas repeticiones." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3 // Baja temperatura para mayor precisión en el veredicto
      })
    });

    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error en el proceso de análisis' });
  }
}