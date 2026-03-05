// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  const apiKey = process.env.NoticiasAPI; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la Variable de Entorno: NoticiasAPI' });
  }

  // Lógica enfocada en repetición de temas y palabras clave
  const prompt = modo === 'resumir' 
    ? `SINTESIS ESTRATÉGICA: Analiza estos titulares y dime en una frase corta cuál es el tema o nombre propio que más se repite. No hables del dólar a menos que sea el único tema presente: ${titulos}`
    : `ANÁLISIS DE TENDENCIAS Y REPETICIONES:
       1. TEMA DOMINANTE: ¿De qué se habla en este momento? Busca patrones, palabras o nombres propios que se repitan en 3 o más diarios diferentes.
       2. VEREDICTO: Redacta un resumen de 4 oraciones sobre el tema más caliente, explicando qué está pasando según el volumen de noticias que coinciden.
       3. OTROS TEMAS: Identifica una segunda tendencia que también tenga varias repeticiones.
       4. DATOS NUMÉRICOS: Solo si aparecen datos de economía (dólar, inflación, etc.) muy claros en los titulares, menciónalos al final, pero que NO sean el centro del resumen.
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
          { role: "system", content: "Eres un analista experto en detectar patrones y tendencias mediáticas. Tu prioridad es identificar qué temas se repiten más en los portales." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1 // Precisión total para no inventar temas
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    
    res.status(200).json({ resumen: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Error de análisis' });
  }
}