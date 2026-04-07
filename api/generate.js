module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
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
        system: `Eres un entrenador personal experto. Responde SOLO con JSON válido sin texto extra ni backticks. Estructura: {"titulo":"...","duracion":"...","objetivo":"...","nivel":"...","consejo_cientifico":"...","ejercicios":[{"num":1,"nombre":"...","descripcion":"...","series":"4","reps":"10-12","rir":"RIR 1-2","descanso":"90 seg","tempo":"3-0-1-0","nota":"..."}]}. 5-6 ejercicios. Varía siempre.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(i => i.text || '').join('') || '';
    const routine = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(routine);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
