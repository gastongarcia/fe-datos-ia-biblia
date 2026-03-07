# Deploy Notes (Vercel)

## Configuración esperada

- Repository: `gastongarcia/fe-datos-ia-biblia`
- Production Branch: `main`
- Root Directory: `presentacion/micrositio`
- Framework Preset: `Next.js`
- Ignored Build Step:
  - recomendado: `Automatic`
  - evitar comandos custom salvo que sea estrictamente necesario

## Verificación rápida de deploy

1. Abrir Deployments en Vercel.
2. Confirmar que `Current` apunta al commit esperado de `main`.
3. Si no coincide:
   - revisar filtros (Status 6/6 y rango de fecha amplio),
   - redeploy del commit correcto,
   - promote a production si aplica.

## Síntoma común observado

- "Build Canceled: canceled as a result of running the command defined in Ignored Build Step".
  - Causa: comando custom en Ignored Build Step devolviendo cancelación.
  - Acción: volver a `Automatic`, guardar, y redeploy.

## Nota de arquitectura

- El contenido markdown hoy vive fuera del Root Directory del micrositio.
- Para máxima estabilidad de deploy, mover/sincronizar contenido a una carpeta dentro de `presentacion/micrositio`.
