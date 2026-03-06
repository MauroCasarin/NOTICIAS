// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la Variable de Entorno: NoticiasAPI' });
  }

  // Configuración de la IA para detectar repeticiones y tendencias reales
  const prompt = modo === 'resumir' 
    ? `SINTESIS ESTRATÉGICA: Analiza estos titulares y dime en una frase corta cuál es el tema o nombre propio que más se repite entre los medios ahora: ${titulos}`
    : `ANÁLISIS DE TENDENCIAS (VEREDICTO TOTAL):
       1. TEMA DOMINANTE: ¿De qué hablan la mayoría de los diarios? Identifica la noticia con más repeticiones.
       2. ANÁLISIS: Redacta un veredicto de 4 o 5 oraciones sobre por qué ese tema es tendencia.
       3. SEGUNDA TENDENCIA: Menciona otro tema que aparezca en al menos 3 fuentes distintas.
       4. FINANZAS: Si Bull Market o los diarios económicos mencionan cotizaciones claras (Dólar, MEP, Bonos), dalas al final como dato de cierre.
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
          { role: "system", content: "Eres un analista de medios experto. Tu misión es encontrar qué noticias se repiten en diferentes portales y dar un veredicto unificado." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1 // Máxima precisión
      })
    });

    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error de análisis en la nube' });
  }
}