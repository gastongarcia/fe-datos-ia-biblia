# Micrositio Fe + Datos

Micrositio narrativo para presentación en monitor/proyector y lectura pública desde URL en móvil/laptop.

## Ejecutar

```bash
cd /Users/gastongarciao/programs/vina-iglesia/fe-y-datos/presentacion/micrositio
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Fuente de contenido

El sitio carga automáticamente estos archivos:

- `/Users/gastongarciao/programs/vina-iglesia/fe-y-datos/presentacion/00-indice.md`
- `/Users/gastongarciao/programs/vina-iglesia/fe-y-datos/presentacion/01-...md`
- ...
- `/Users/gastongarciao/programs/vina-iglesia/fe-y-datos/presentacion/12-...md`

No necesitas copiar texto al micrositio. Edita esos markdowns y recarga.

## Controles

- Navegar capítulos: `ArrowRight`, `Space`, `J` (siguiente), `ArrowLeft`, `K` (anterior)
- Índice lateral clickeable (desktop)
- Scroll libre en móvil/laptop para lectura continua

## Dónde ajustar diseño

- Estilos y legibilidad: `app/globals.css`
- Carga de capítulos desde markdown: `app/lib/content.ts`
- Interacción y renderizado: `app/components/presentation-client.tsx`

## Imágenes

Cada capítulo incluye una imagen de apoyo y un prompt sugerido para regenerarla con LLM.

Reemplaza los placeholders en:

- `public/images/01.svg`
- `public/images/02.svg`
- `public/images/03.svg`
- `public/images/04.svg`
- `public/images/05.svg`

Puedes usar `.webp`/`.avif` y actualizar la ruta en `app/lib/content.ts`.
