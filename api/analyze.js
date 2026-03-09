// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { titulos, modo } = req.body;
  
  // Cargamos ambas llaves desde Vercel
  const apiKeys = [
    process.env.NoticiasAPI,
    process.env.NoticiasAPI2
  ].filter(key => key); // Solo dejamos las que tengan contenido

  if (apiKeys.length === 0) {
    return res.status(500).json({ error: 'Faltan las Variables de Entorno en Vercel' });
  }

  const prompt = modo === 'resumir' 
    ? `SINTESIS ESTRATÉGICA: Analiza estos titulares y dime en una frase corta cuál es el tema o nombre propio que más se repite entre los medios ahora: ${titulos}`
    : `ANÁLISIS DE TENDENCIAS (VEREDICTO):
       1. TEMA DOMINANTE: Identifica la noticia con más repeticiones entre los diarios.
       2. ANÁLISIS: Redacta un veredicto de 4 o 5 oraciones sobre por qué ese tema es tendencia.
       3. SEGUNDA TENDENCIA: Menciona otro tema que aparezca en al menos 3 fuentes distintas.
       4. FINANZAS: Y hace un resumen si los diarios hablan sobre temas economicos.   pero nunca mencionar valores o inventar datos ni dar % vacios.
       Titulares: ${titulos}`;

  // Intentamos con cada llave disponible hasta que una funcione
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
            { role: "system", content: "Eres un analista de medios experto. Tu misión es encontrar noticias repetidas y dar un veredicto unificado." },
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
      console.error("Error con una de las llaves, probando la siguiente...");
    }
  }

  // Si llegamos aquí es porque todas las llaves fallaron
  res.status(500).json({ error: 'Todas las API Keys fallaron o alcanzaron su límite' });
}