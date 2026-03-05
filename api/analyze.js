async function pedirAnalisis(modo) {
    if (ultimaData.length === 0 || isTyping) return;
    isTyping = true;
    document.querySelectorAll('.btn-ia').forEach(b => b.disabled = true);
    const resDiv = document.getElementById('ai-resumen');
    resDiv.innerText = modo === 'resumir' ? "Sintetizando absolutamente todo..." : "Comparando todos los medios...";

    try {
        // Aumentamos el rango de 50 a 100 o más para cubrir TODA la pizarra
        const titulos = ultimaData.slice(0, 100).map(n => n.titulo).join(" | ");
        
        const resp = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titulos, modo })
        });
        const result = await resp.json();
        typeWriter(result.resumen, "ai-resumen");
    } catch (err) {
        resDiv.innerText = "Error en el análisis total.";
        isTyping = false;
        document.querySelectorAll('.btn-ia').forEach(b => b.disabled = false);
    }
}