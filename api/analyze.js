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
    : `Genera 4 VEREDICTOS técnicos basados en la FRECUENCIA.

       REGLAS ESTRICTAS DE CONTENIDO:
       1. NO REPETICIÓN DE TEMAS: Si un activo (ej. Dólar), persona o empresa ya fue tratado en un tema anterior, está PROHIBIDO mencionarlo en los puntos siguientes. Cada tema debe ser totalmente independiente.
       2. PROHIBIDO VALORES: No des precios, cotizaciones, porcentajes ni tasas. Puedes decir si algo subió o bajó, pero nunca el valor numérico.
       3. CERO EXCUSAS: Prohibido usar palabras como "datos", "específicos", "información", "cifras" o "titulares" para justificar falta de precisión. Analiza la tendencia directamente.
       
       FORMATO DE SALIDA (SIN INTRODUCCIONES):
       TEMA 1: [Análisis técnico en 2 oraciones]
       TEMA 2: [Análisis técnico en 2 oraciones]
       TEMA 3: [Análisis técnico en 2 oraciones]
       TEMA 4: [Análisis técnico en 2 oraciones]

       Lenguaje: Mercado argentino (MEP, CCL, Lecaps, Brecha).
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
              content: "Eres un analista financiero mudo. Tu respuesta empieza directamente en 'TEMA 1'. Tienes terminantemente prohibido usar las palabras 'datos', 'específicos', 'información' o 'cifras'. No incluyes números ni símbolos de porcentaje bajo ninguna circunstancia." 
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
      console.error("Error en llave, probando siguiente...");
    }
  }

  res.status(500).json({ error: 'Fallo total de conexión con IA' });
}