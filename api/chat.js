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

const KNOWLEDGE_BASE = [
  {
    title: 'Identidad de Distribuidor Punto PAS',
    tags: ['quienes somos', 'empresa', 'historia', 'marcas', 'punto pas', 'distribuidor'],
    text: 'Distribuidor Punto PAS es una empresa moderna dedicada a la comercializacion y distribucion de productos para el hogar y la construccion. Trabaja con marcas como DISENSA, STIHL, YAMAHA, INDURAMA, RCA, TCL, MABE, ELECTROLUX y muchos articulos para el hogar. Tiene trayectoria en el mercado ecuatoriano y busca ofrecer productos confiables, precios competitivos y atencion personalizada para clientes minoristas y mayoristas.',
  },
  {
    title: 'Mision y vision',
    tags: ['mision', 'vision', 'valores', 'calidad', 'servicio'],
    text: 'Mision: satisfacer las necesidades de los clientes ofreciendo productos variados, confiables y a precios competitivos, con servicio responsable y cercano. Vision: ser una empresa referente en productos para el hogar, construccion y comercio general, reconocida por variedad, calidad y excelencia en servicio.',
  },
  {
    title: 'Sucursales y horarios',
    tags: ['sucursal', 'sucursales', 'ubicacion', 'direccion', 'horario', 'telefono', 'contacto', 'tienda'],
    text: 'Sucursales disponibles: Sucursal Esmeraldas, Sucursal San Lorenzo y Sucursal Stihl en San Lorenzo. Telefono/WhatsApp principal: 095 9990 999. En la pagina se muestra horario 8:00 AM - 6:00 PM para las sucursales y se indica atencion general de lunes a sabado. Para confirmar direccion exacta o ruta, el cliente puede revisar la seccion Nuestras Sucursales.',
  },
  {
    title: 'Politicas de compra y retiro',
    tags: ['compra', 'pedido', 'cancelacion', 'retiro', 'entrega', 'envio', 'tienda'],
    text: 'Las compras se pagan por adelantado antes del retiro en tienda. El cliente puede solicitar cancelacion antes de que el pedido sea marcado como listo para retiro. Si ya esta listo para retiro, no aplica cancelacion. El plazo maximo para retirar es 48 horas. Actualmente no se realizan envios a domicilio; las compras se entregan por retiro en tienda. Para retirar se requiere cedula y numero de pedido. No se permite retiro por terceros autorizados.',
  },
  {
    title: 'Devoluciones',
    tags: ['devolucion', 'devoluciones', 'cambio', 'cambios', 'politicas'],
    text: 'La politica publicada indica que no se aceptan cambios ni devoluciones en ninguna compra realizada. Si el cliente tiene una situacion especial, se debe recomendar comunicarse con atencion al cliente para revisar el caso con respeto y claridad.',
  },
  {
    title: 'Atencion al cliente',
    tags: ['whatsapp', 'correo', 'asesor', 'ayuda', 'soporte', 'contacto'],
    text: 'Canales activos: WhatsApp 095 999 0999 y correo variedadespas2025@gmail.com. Las solicitudes se atienden en horario laboral y se registran para seguimiento. El asistente debe invitar a contactar a un asesor cuando se requiera confirmar stock, precio final, retiro, factura o casos especiales.',
  },
  {
    title: 'Privacidad y seguridad',
    tags: ['privacidad', 'datos', 'seguridad', 'informacion personal'],
    text: 'Punto PAS protege la informacion personal del cliente. Puede recopilar datos de contacto, envio, facturacion, historial de compras y soporte. Usa la informacion para procesar pedidos, contacto, soporte, mejoras y promociones con consentimiento. No vende ni alquila datos personales a terceros. Implementa medidas como SSL, firewalls y acceso restringido.',
  },
  {
    title: 'Categorias y productos',
    tags: ['categoria', 'categorias', 'producto', 'productos', 'catalogo', 'marca', 'precio', 'stock'],
    text: 'El catalogo incluye productos para hogar, construccion, ferreteria, electrodomesticos, linea blanca, televisores, congeladores, neveras, lavadoras, secadoras, celulares, muebles, cocina, calzado, deportes y movilidad, accesorios y mas. El asistente debe priorizar productos reales enviados en el contexto y no inventar precios o disponibilidad.',
  },
  {
    title: 'Forma de atencion del asesor',
    tags: ['asesor', 'como responder', 'humano', 'tono', 'ayuda'],
    text: 'El Asesor Punto PAS debe responder con calidez humana, educacion, humildad y brevedad. Debe sonar como un vendedor experto: saludar cuando corresponde, hacer una pregunta de seguimiento si falta informacion, recomendar opciones reales, explicar beneficios y orientar a WhatsApp si el cliente esta listo para comprar o necesita confirmacion.',
  },
];

const selectKnowledge = (message) => {
  const normalizedMessage = normalize(message);
  const terms = normalizedMessage.split(' ').filter((term) => term.length >= 3);

  const scored = KNOWLEDGE_BASE.map((item) => {
    const tagScore = item.tags.reduce((score, tag) => score + (normalizedMessage.includes(normalize(tag)) ? 3 : 0), 0);
    const text = normalize(`${item.title} ${item.text}`);
    const termScore = terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
    return { item, score: tagScore + termScore };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => `- ${item.title}: ${item.text}`);

  if (scored.length > 0) return scored.join('\n');
  return KNOWLEDGE_BASE.filter((item) => ['Identidad de Distribuidor Punto PAS', 'Forma de atencion del asesor'].includes(item.title))
    .map((item) => `- ${item.title}: ${item.text}`)
    .join('\n');
};

const buildStoreContext = (products = []) => {
  const activeProducts = products.filter((product) => product?.isActive !== false);
  const categories = [...new Set(activeProducts.map((product) => product?.category).filter(Boolean))].slice(0, 18);
  const brands = [...new Set(activeProducts.map((product) => product?.brand).filter(Boolean))].slice(0, 18);

  return [
    'Tienda: Distribuidor Punto PAS.',
    'Asistente: Asesor Punto PAS, asesor virtual amable, profesional y directo.',
    'Objetivo: ayudar al cliente a encontrar productos, comparar opciones, explicar disponibilidad, precios, politicas, sucursales y orientar la compra.',
    'Telefono/WhatsApp principal: 095 9990 999.',
    'Sucursales conocidas: Esmeraldas, San Lorenzo y Sucursal Stihl.',
    'Categorias disponibles: ' + (categories.join(', ') || 'catalogo general de hogar, construccion, electrodomesticos y ferreteria') + '.',
    'Marcas disponibles: ' + (brands.join(', ') || 'varias marcas comerciales') + '.',
    'Reglas: responde en espanol, con educacion, humildad y naturalidad. Usa primero la base de conocimiento y los productos enviados. No inventes stock, precios, politicas ni direcciones fuera del contexto. Si falta informacion, haz una pregunta concreta o invita a consultar con un asesor.',
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
    const knowledgeContext = selectKnowledge(cleanMessage);
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
                text: `${buildStoreContext(products)}\n\nBase de conocimiento relevante de la pagina:\n${knowledgeContext}\n\nProductos relevantes para esta consulta:\n${JSON.stringify(productContext)}\n\nEstilo de respuesta: humano, cercano, profesional, maximo 2 parrafos cortos salvo que el usuario pida detalle. Si recomiendas productos, explica por que pueden servir.`,
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
