export const CATEGORY_ORDER = [
  { category: "TRANSPORTE DE DOS RUEDAS", types: ["BICICLETAS", "ACCESORIOS BICICLETAS"] },
  { category: "HOGAR INTERIORES", types: ["FLOREROS Y JARRONES", "CUADROS", "ADORNOS IMPORTADOS", "ESPEJOS DE IMPORTACION", "RELOJES DE PARED Y MESA", "PLANTAS", "TOALLAS Y SABANAS"] },
  { category: "COCINA", types: ["VAJILLA DE IMPORTACION"] },
  { category: "BELLEZA", types: ["PLANCHAS DE CABELLO"] },
  { category: "SEGURIDAD INDUSTRIAL IMPORTACION", types: ["ZAPATOS INDUSTRIALES IMPORTADOS"] },
  { category: "MODA", types: ["CARTERAS Y BOLSOS"] },
  { category: "ESCOLAR", types: ["MOCHILAS"] },
  { category: "ELECTRODOMESTICOS", types: ["AIRE ACONDICIONADO", "ELECTRODOMESTICOS PEQUEÑOS", "ASPIRADORAS", "LAVADORAS Y SECADORAS"] },
  { category: "CALZAPATO", types: ["ZAPATOS INDUSTRIALES IMPORTADOS"] },
  { category: "GRIFERIA Y SANITARIOS", types: ["ACCESORIOS DE BAÑO"] },
  { category: "INTERIORES", types: ["ACCESORIOS DE COCINA", "ADORNOS", "ALFOMBRAS", "ALMOHADAS", "MOVILIDAD INFANTIL", "MATERIALES NAVIDEÑOS", "ORGANIZACIÓN Y ALMACENAMIENTO", "SILLAS", "VAJILLA", "EQUIPOS DE SONIDO", "BASTONES", "CAMAS", "COLCHONES", "COMEDORES", "CORTINAS", "DECORACIÓN"] },
  { category: "HERRAMIENTAS MANUALES", types: ["BALDES"] },
  { category: "HERRAMIENTAS ELECTRICAS", types: ["BOMBAS Y AUTOMATIZACION DE AGUA"] },
  { category: "ACCESORIOS TECNOLOGICOS", types: ["EQUIPOS DE OFICINA", "CELULARES"] },
];

export const getCategoryTypes = (category: string): string[] => {
  const found = CATEGORY_ORDER.find(c => c.category === category);
  return found ? found.types : [];
};

export const getOrderedCategories = (): string[] => {
  return CATEGORY_ORDER.map(c => c.category);
};

export const isTypeInCategory = (category: string, type: string): boolean => {
  const found = CATEGORY_ORDER.find(c => c.category === category);
  if (!found) return false;
  return found.types.includes(type);
};
