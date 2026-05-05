import { ClassificationItem, Level2Category } from '@/domain/product';

export interface ClassificationMapResult {
  level2Categories: Level2Category[];
  level3ByParent: Map<number, string[]>;
  level2ByName: Map<string, number>;
  hierarchy: Map<number, { name: string; level: number; parentId: number | null }>;
  classificationsList: string[];
}

export const buildClassificationMap = (items: ClassificationItem[]): ClassificationMapResult => {
  const hierarchy = new Map<number, { name: string; level: number; parentId: number | null }>();
  const level2Categories: Level2Category[] = [];
  const level3ByParent = new Map<number, string[]>();
  const level2ByName = new Map<string, number>();

  const byId = new Map<number, ClassificationItem>();
  items.forEach((item) => {
    byId.set(item.idClasificacionitem, item);
    hierarchy.set(item.idClasificacionitem, {
      name: item.txDescripcionClasificacionItem?.toUpperCase().trim() || '',
      level: item.nivel,
      parentId: item.idClasificacionitemPadre,
    });
  });

  const level2IdsWithChildren = new Set<number>();
  items.forEach((item) => {
    if (item.nivel !== 3) return;
    const parent = byId.get(item.idClasificacionitemPadre);
    if (parent?.nivel === 2) {
      level2IdsWithChildren.add(parent.idClasificacionitem);
    }
  });

  items.forEach((item) => {
    if (item.nivel === 2 && level2IdsWithChildren.has(item.idClasificacionitem)) {
      const normalizedName = item.txDescripcionClasificacionItem?.toUpperCase().trim() || '';
      level2Categories.push({ id: item.idClasificacionitem, name: normalizedName });
      level2ByName.set(normalizedName, item.idClasificacionitem);
      level3ByParent.set(item.idClasificacionitem, []);
    }
  });

  level2Categories.sort((a, b) => a.name.localeCompare(b.name));

  items.forEach((item) => {
    if (item.nivel !== 3) return;
    const parentId = item.idClasificacionitemPadre;
    if (!level3ByParent.has(parentId)) return;

    const typeName = item.txDescripcionClasificacionItem?.toUpperCase().trim() || '';
    const types = level3ByParent.get(parentId) || [];
    if (!types.includes(typeName)) {
      types.push(typeName);
      level3ByParent.set(parentId, types);
    }
  });

  const classificationsList = [...new Set(items.map((item) => item.txDescripcionClasificacionItem).filter(Boolean))];

  return {
    level2Categories,
    level3ByParent,
    level2ByName,
    hierarchy,
    classificationsList,
  };
};
