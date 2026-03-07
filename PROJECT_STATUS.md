# Project Status

Última actualización: 2026-03-05

## Estado general

- Repositorio conectado a Vercel: `gastongarcia/fe-datos-ia-biblia`
- Rama de trabajo y producción: `main`
- Micrositio Next.js: `presentacion/micrositio`
- Contenido de capítulos: `presentacion/00-...md` a `presentacion/13-gracias.md`
- Imagen por capítulo configurada en `presentacion/micrositio/app/lib/content.ts`

## Qué está implementado

- Renderizado de capítulos desde Markdown local.
- Navegación por capítulos y atajos de teclado.
- Señal visual de bloques de prompt con etiqueta "Práctica con prompt" (sobre blockquotes).
- Asignación explícita de imágenes `.webp` para capítulos 0 a 13.
- Capítulo 13 "Gracias" agregado con enlace al repositorio.

## Riesgos abiertos

- El loader del micrositio actualmente lee contenido con:
  - `path.resolve(process.cwd(), '..')`
- Eso depende de archivos fuera del Root Directory de Vercel (`presentacion/micrositio`).
- Si Vercel no incluye/reconoce cambios externos al root, pueden faltar capítulos o verse despliegues desactualizados.

## Próximo paso recomendado

- Mover/sincronizar los Markdown dentro de `presentacion/micrositio/content` y hacer que `content.ts` lea desde esa carpeta.
- Resultado: deploys más predecibles en Vercel y menos dependencia de settings de "Ignored Build Step".
