// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la Variable de Entorno: NoticiasAPI' });
  }

  const prompt = modo === 'resumir' 
    ? `SINTESIS ESTRATÉGICA: Analiza estos titulares y dime en una frase corta cuál es el tema o nombre propio que más se repite en los medios: ${titulos}`
    : `ANÁLISIS DE TENDENCIAS Y REPETICIONES:
       1. TEMA DOMINANTE: ¿De qué se habla en este momento? Identifica patrones o nombres propios que se repitan en varios diarios.
       2. VEREDICTO: Redacta un resumen de 4 o más oraciones sobre la tendencia más caliente.
       3. OTROS TEMAS: Menciona una segunda tendencia relevante.
       4. ECONOMÍA: Solo si hay datos de cotizaciones (dólar, inflación) explícitos y claros, menciónalos al final.
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
          { role: "system", content: "Eres un analista de tendencias. Tu prioridad es encontrar qué noticias se repiten en diferentes portales." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error de análisis' });
  }
}