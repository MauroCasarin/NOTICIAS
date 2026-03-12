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
    ? `SINTESIS: Tema más repetido en una frase: ${titulos}`
    : `Genera 4 VEREDICTOS técnicos basados en la FRECUENCIA.

       REGLAS DE ORO:
       1. CERO EXPLICACIONES: Prohibido decir "no hay datos", "faltan cifras" o "según los titulares". Si no hay números, analiza la intención política o económica del tema sin mencionarlos.
       2. JERARQUÍA Y NO REPETICIÓN: TEMA 1 es el más frecuente. Prohibido repetir activos o personas entre los 4 puntos.
       3. CONCISIÓN: Máximo 2 oraciones por tema.
       
       FORMATO:
       TEMA 1: [Análisis]
       TEMA 2: [Análisis]
       TEMA 3: [Análisis]
       TEMA 4: [Análisis]

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
              content: "Eres una IA de análisis mudo: solo entregas resultados. Tienes terminantemente prohibido usar las palabras 'datos', 'específicos', 'información', 'cifras' o 'titulares' para excusarte. Si no hay números, analiza el concepto político/económico directamente." 
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
      console.error("Error en llave...");
    }
  }

  res.status(500).json({ error: 'Fallo total' });
}