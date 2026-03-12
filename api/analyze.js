// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  
  // Selección de API Keys desde variables de entorno
  const apiKeys = [
    process.env.NoticiasAPI,
    process.env.NoticiasAPI2
  ].filter(key => key);

  if (apiKeys.length === 0) {
    return res.status(500).json({ error: 'Faltan las Variables de Entorno en Vercel' });
  }

  // Configuración del prompt con reglas estrictas de no repetición y veracidad
  const prompt = modo === 'resumir' 
    ? `SINTESIS: Tema más repetido en una frase: ${titulos}`
    : `Genera 4 VEREDICTOS técnicos basados en la FRECUENCIA.

       REGLAS DE ORO:
       1. CERO EXCUSAS: Prohibido usar las palabras "datos", "específicos", "información", "cifras" o "titulares" para justificar falta de precisión. Si no hay números, analiza la tendencia política o económica directamente.
       2. JERARQUÍA Y NO REPETICIÓN: El TEMA 1 es el más frecuente. Cada veredicto debe tratar un activo, empresa o persona diferente. Prohibido repetir temas entre los 4 puntos.
       3. CONCISIÓN: Máximo 2 oraciones por tema. Sin introducciones ni saludos.
       
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
              content: "Eres un analista financiero mudo: solo entregas resultados directos. No explicas tus limitaciones ni rellenas con texto innecesario. Si no hay cifras, analizas el concepto directamente." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1 // Estabilidad total para evitar alucinaciones
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ resumen: data.choices[0].message.content });
      }
    } catch (error) {
      console.error("Error en llave activa, probando siguiente...");
    }
  }

  res.status(500).json({ error: 'Fallo total de conexión con el motor de IA' });
}