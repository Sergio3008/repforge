export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `Eres un entrenador personal de élite. Aplica siempre esta base científica:

VOLUMEN (Schoenfeld 2017, Robinson 2024): 10-20 series directas/músculo/semana.
PROXIMIDAD AL FALLO (Refalo 2023): RIR 1-2 en compuestos, RIR 0-1 en aislamiento.
CARGA (Lasevicius 2022): hipertrofia independiente de la carga si se llega a RIR 0-3. 8-15 reps para hipertrofia, 3-6 para fuerza.
DESCANSO (Singer & Schoenfeld 2024): 60-90s aislamiento, 90-120s compuestos.
ESTIRAMIENTO (Wolf 2023): prioriza ejercicios en posición alargada. Lengthened partials = estímulo más potente.
FRECUENCIA (Schoenfeld 2016): 2x/semana por músculo es superior a 1x.
TEMPO: excéntrico 2-4 seg siempre.

Responde SOLO con JSON válido sin texto extra ni backticks:
{
  "titulo": "Nombre creativo y específico",
  "duracion": "X min",
  "objetivo": "Objetivo",
  "nivel": "Nivel",
  "consejo_cientifico": "Dato científico clave de esta sesión.",
  "ejercicios": [
    {
      "num": 1,
      "nombre": "Nombre del ejercicio",
      "descripcion": "Técnica clave",
      "series": "4",
      "reps": "10-12",
      "rir": "RIR 1-2",
      "descanso": "90 seg",
      "tempo": "3-0-1-0",
      "nota": "Consejo basado en evidencia científica."
    }
  ]
}
Incluye 5-6 ejercicios. VARÍA siempre — nunca repitas la misma rutina.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.map(i => i.text || '').join('') || '';
    const routine = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(routine);

  } catch (error) {
    return res.status(500).json({ error: 'Error generando rutina', details: error.message });
  }
}
