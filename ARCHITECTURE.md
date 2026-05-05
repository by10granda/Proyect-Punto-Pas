# Arquitectura del Proyecto (v2)

Este proyecto sigue una estructura por capas para mantener el codigo limpio y escalable.

## Capas

- `src/domain`
  - Modelos y tipos de negocio puros.
  - Sin dependencias de UI ni de infraestructura.

- `src/application`
  - Casos de uso (reglas de negocio aplicadas a flujos concretos).
  - Orquesta acciones como carga y filtrado sin conocer detalles de React o fetch.

- `src/infrastructure`
  - Implementaciones tecnicas (API, mappers, cache, etc.).
  - Aqui vive la integracion con SIAPE.

- `src/services`
  - Fachada de compatibilidad para no romper imports existentes.
  - Reexporta servicios desde `infrastructure`.

- `src/data`
  - Orquestador de datos para la presentacion.
  - Combina API + mappers + cache para devolver estructuras listas para UI.

- `src/pages`, `src/components`, `src/contexts`
  - Capa de presentacion.
  - Debe consumir casos de uso y datos ya procesados, no reglas de negocio complejas.

## Reglas de mantenimiento

1. No agregar `fetch` directo en componentes/paginas.
2. No mover logica de filtros complejos a UI; usar `application/use-cases`.
3. Tipos de API en `src/infrastructure/api/types.ts`.
4. Tipos de dominio en `src/domain/*`.
5. Transformaciones de API a dominio en `src/infrastructure/mappers/*`.
6. Si se cambia un endpoint SIAPE, actualizar primero `infrastructure/api`.

## Flujo recomendado para nuevas features

1. Definir/ajustar tipo en `domain`.
2. Implementar llamada en `infrastructure/api`.
3. Mapear respuesta en `infrastructure/mappers`.
4. Exponer flujo en `application/use-cases`.
5. Consumir en `pages/components`.

## Checklist de PR

- `npm run lint`
- `npm run build`
- Sin `any` nuevo
- Sin `console.log` de debug
- Sin logica de negocio pesada en componentes
