// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  
  const apiKeys = [
    process.env.NoticiasAPI,
    process.env.NoticiasAPI2
  ].filter(key => key);

  if (apiKeys.length === 0) {
    return res.status(500).json({ error: 'Faltan las Variables de Entorno en Vercel' });
  }

  const prompt = modo === 'resumir' 
    ? `SINTESIS ESTRATÉGICA: Analiza estos titulares y dime en una frase corta cuál es el tema o nombre propio que más se repite: ${titulos}`
    : `Actúa como un analista financiero experto. Analiza estos titulares y genera exactamente 4 VEREDICTOS técnicos basados en la FRECUENCIA de aparición.

       REGLAS CRÍTICAS DE CONTENIDO:
       1. PROHIBIDO INVENTAR VALORES: Si un titular no menciona un número de cotización, precio o tasa específica, NO inventes datos. Si necesitas referenciar una cifra que no está, pon "Dato no disponible en los titulares".
       2. JERARQUÍA POR FRECUENCIA: El TEMA 1 debe ser el más mencionado en los medios, el TEMA 2 el segundo, y así sucesivamente.
       3. NO REPETICIÓN ABSOLUTA: Si un activo (ej. Dólar), empresa o persona ya fue analizado en un tema previo, queda PROHIBIDO mencionarlo en los siguientes veredictos. Cada punto debe tratar un asunto totalmente independiente.
       
       FORMATO DE SALIDA:
       - TEMA 1 (Máxima relevancia): [Análisis técnico de 3-4 líneas]
       - TEMA 2: [Análisis técnico de 3-4 líneas]
       - TEMA 3: [Análisis técnico de 3-4 líneas]
       - TEMA 4: [Análisis técnico de 3-4 líneas]

       ESTILO: Directo al grano. Usa terminología financiera argentina (MEP, CCL, Lecaps, Brecha). 
       
       Titulares: ${titulos}`;

  for (const key of apiKeys) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: "Eres un analista de mercados. Tu prioridad es la exactitud factual. Si no hay datos numéricos en el texto, no los generas." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ resumen: data.choices[0].message.content });
      }
    } catch (error) {
      console.error("Error con una de las llaves, probando la siguiente...");
    }
  }

  res.status(500).json({ error: 'Todas las API Keys fallaron' });
}