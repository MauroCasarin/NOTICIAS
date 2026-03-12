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
    ? `SINTESIS: Tema más repetido en una frase corta: ${titulos}`
    : `Actúa como analista senior. Genera 4 VEREDICTOS técnicos basados en la FRECUENCIA.

       REGLAS DE ORO:
       1. CERO RELLENO: Prohibido usar frases introductorias, saludos o conclusiones. Prohibido explicar por qué no hay datos.
       2. DATOS: No inventes números. Si no hay cifras en los titulares, describe la tendencia de forma puramente cualitativa.
       3. JERARQUÍA Y NO REPETICIÓN: TEMA 1 es el más frecuente. Prohibido repetir temas, activos o personas entre los 4 puntos. Cada veredicto debe ser sobre un asunto totalmente diferente.
       
       FORMATO (ESTRICTO):
       TEMA 1 (Máxima frecuencia): [Análisis técnico directo en 2 oraciones]
       TEMA 2: [Análisis técnico directo en 2 oraciones]
       TEMA 3: [Análisis técnico directo en 2 oraciones]
       TEMA 4: [Análisis técnico directo en 2 oraciones]

       Lenguaje: Financiero argentino (MEP, CCL, Lecaps, Brecha).
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
              content: "Eres un analista implacable. No rellenas con texto innecesario. No das excusas sobre falta de datos. Vas directo al grano." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1 // Mantenemos baja para evitar creatividad innecesaria
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ resumen: data.choices[0].message.content });
      }
    } catch (error) {
      console.error("Error en llave, reintentando...");
    }
  }

  res.status(500).json({ error: 'Fallo total de API' });
}