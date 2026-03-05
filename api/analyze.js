// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la Variable de Entorno: NoticiasAPI' });
  }

  // Instrucciones críticas para evitar errores en las cotizaciones
  const prompt = modo === 'resumir' 
    ? `SINTESIS FLASH: Analiza y resume en máximo 15 palabras. Si mencionas el dólar, usa EXACTAMENTE el valor que figure en los titulares como precio de venta actual. Si no hay un precio claro, ignóralo: ${titulos}`
    : `VEREDICTO DE MEDIOS:
       1. TEMA CENTRAL: Qué es lo más repetido hoy.
       2. RESUMEN: 4 oraciones de análisis estratégico.
       3. FINANZAS: Busca Dólar Blue, MEP y Oficial. 
       REGLA DE ORO: No inventes números. No confundas "subió $10" con el precio. Solo reporta si el texto dice "cotiza a", "está en", "cerró a" o similar. Si el dato es dudoso, no lo incluyas.
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
          { role: "system", content: "Eres un analista financiero de alta precisión. Tu objetivo es la exactitud matemática. No redondees ni supongas valores que no estén escritos." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1 // Precisión máxima para evitar errores numéricos
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error interno de análisis' });
  }
}