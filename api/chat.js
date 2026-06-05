const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getPrice = (product) => product?.puntoPasPrice || product?.pvpPrice || product?.price || 0;

const scoreProduct = (product, queryTerms) => {
  const haystack = normalize([
    product?.name,
    product?.description,
    product?.brand,
    product?.category,
    product?.type,
    product?.code,
  ].filter(Boolean).join(' '));

  return queryTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
};

const selectRelevantProducts = (message, products = []) => {
  const terms = normalize(message)
    .split(' ')
    .filter((term) => term.length >= 3)
    .slice(0, 8);

  if (terms.length === 0) return [];

  return products
    .filter((product) => product?.isActive !== false)
    .map((product) => ({ product, score: scoreProduct(product, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ product }) => product);
};

const compactProduct = (product) => ({
  codigo: product?.code || product?.id || '',
  nombre: product?.name || '',
  marca: product?.brand || 'Sin marca',
  categoria: product?.category || '',
  tipo: product?.type || '',
  stock: product?.stock || 0,
  precio: Number(getPrice(product) || 0).toFixed(2),
});

const buildStoreContext = (products = []) => {
  const activeProducts = products.filter((product) => product?.isActive !== false);
  const categories = [...new Set(activeProducts.map((product) => product?.category).filter(Boolean))].slice(0, 18);
  const brands = [...new Set(activeProducts.map((product) => product?.brand).filter(Boolean))].slice(0, 18);

  return [
    'Tienda: Distribuidor Punto PAS.',
    'Asistente: Asesor Punto PAS, asesor virtual amable, profesional y directo.',
    'Objetivo: ayudar al cliente a encontrar productos, comparar opciones, explicar disponibilidad, precios y orientar la compra.',
    'Telefono/WhatsApp principal: 095 9990 999.',
    'Sucursales conocidas: Esmeraldas, San Lorenzo y Sucursal Stihl.',
    'Categorias disponibles: ' + (categories.join(', ') || 'catalogo general de hogar, construccion, electrodomesticos y ferreteria') + '.',
    'Marcas disponibles: ' + (brands.join(', ') || 'varias marcas comerciales') + '.',
    'Reglas: responde en espanol, con educacion y humildad. No inventes stock ni precios fuera del contexto entregado. Si falta informacion, invita a consultar con un asesor.',
  ].join('\n');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ text: 'Metodo no permitido.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ text: 'Asesor Punto PAS esta en modo respaldo porque la IA no esta configurada.', source: 'openai-unavailable' });
  }

  try {
    const { message = '', products = [], history = [] } = req.body || {};
    const cleanMessage = String(message).trim().slice(0, 500);

    if (!cleanMessage) {
      return res.status(400).json({ text: 'Escribe tu consulta para poder ayudarte.', source: 'openai' });
    }

    const relevantProducts = selectRelevantProducts(cleanMessage, Array.isArray(products) ? products : []);
    const productContext = relevantProducts.map(compactProduct);
    const safeHistory = Array.isArray(history)
      ? history.slice(-6).map((turn) => ({ role: turn.role === 'user' ? 'user' : 'assistant', content: String(turn.text || '').slice(0, 500) }))
      : [];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.35,
        max_output_tokens: 360,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: `${buildStoreContext(products)}\n\nProductos relevantes para esta consulta:\n${JSON.stringify(productContext)}`,
              },
            ],
          },
          ...safeHistory.map((turn) => ({
            role: turn.role,
            content: [{ type: 'input_text', text: turn.content }],
          })),
          {
            role: 'user',
            content: [{ type: 'input_text', text: cleanMessage }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error('OpenAI chat error:', details);
      return res.status(502).json({ text: 'Asesor Punto PAS esta teniendo problemas para conectarse. Intentare ayudarte con el modo de respaldo.', source: 'openai-unavailable' });
    }

    const data = await response.json();
    const text = data.output_text || 'Con gusto te ayudo. Puedes indicarme que producto, marca o presupuesto tienes en mente?';

    return res.status(200).json({
      text,
      products: relevantProducts.slice(0, 3),
      source: 'openai',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ text: 'Asesor Punto PAS no pudo responder en este momento. Por favor intenta nuevamente.', source: 'openai-unavailable' });
  }
}
