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

       REGLAS ESTRICTAS:
       1. SIN VALORES NUMÉRICOS: Está terminantemente prohibido dar precios, cotizaciones, tasas o porcentajes. 
       2. TENDENCIAS: Puedes mencionar si un activo subió, bajó o está estable, pero nunca digas cuánto ni a qué precio.
       3. CERO EXCUSAS: Prohibido decir "no hay datos" o "faltan cifras". Si no hay números, analiza el impacto o la tendencia cualitativa directamente.
       4. NO REPETICIÓN: Cada uno de los 4 temas debe ser diferente (no repetir Dólar, ni la misma empresa o persona).
       
       FORMATO:
       TEMA 1: [Análisis de tendencia en 2 oraciones]
       TEMA 2: [Análisis de tendencia en 2 oraciones]
       TEMA 3: [Análisis de tendencia en 2 oraciones]
       TEMA 4: [Análisis de tendencia en 2 oraciones]

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
              content: "Eres un analista mudo. Prohibido usar las palabras 'datos', 'cifras', 'números' o 'específicos'. Puedes decir que algo sube o baja, pero tienes prohibido dar el valor o el porcentaje." 
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

  res.status(500).json({ error: 'Error de conexión con IA' });
}