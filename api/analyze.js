// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la Variable de Entorno: NoticiasAPI' });
  }

  const prompt = modo === 'resumir' 
    ? `SINTESIS ESTRATÉGICA: Analiza estos titulares y dime en una frase corta cuál es el tema o nombre propio que más se repite entre los medios ahora: ${titulos}`
    : `ANÁLISIS DE REPETICIONES Y TENDENCIAS:
       1. PATRÓN PRINCIPAL: Identifica qué noticia o nombre se repite en la mayoría de los diarios.
       2. VEREDICTO: Redacta un resumen de al menos 4 oraciones sobre esa tendencia dominante.
       3. NOTICIAS SECUNDARIAS: Menciona otros temas con múltiples menciones.
       4. ECONOMÍA: Datos de dólar o inflación solo si son explícitos en los textos.
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
          { role: "system", content: "Eres un analista de tendencias. Tu prioridad es encontrar patrones de repetición en diferentes portales de noticias." },
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