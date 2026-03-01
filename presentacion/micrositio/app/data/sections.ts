export type Chapter = {
  id: string;
  section: string;
  title: string;
  hook: string;
  points: string[];
  narrative: string;
  image: string;
  prompt: string;
};

export const chapters: Chapter[] = [
  {
    id: 'intro',
    section: 'Apertura',
    title: 'Fe + Datos',
    hook: 'Explorando la Biblia con IA sin perder discernimiento espiritual.',
    points: [
      'Formato narrativo, no diapositivas rígidas.',
      'Una idea fuerte por pantalla para lectura desde lejos.',
      'Modo escenario y modo lectura en el mismo sitio.'
    ],
    narrative:
      'Este micrositio está diseñado como una experiencia viva: avanza con scroll en móvil y con navegación por teclado en pantalla grande.',
    image: '/images/01.svg',
    prompt:
      'Crea una escena cinematográfica de una iglesia contemporánea con luz cálida y pantallas mostrando texto bíblico y visualización de datos, estilo documental realista, alta nitidez, composición panorámica, sin texto incrustado.'
  },
  {
    id: 'base',
    section: 'Sección 1',
    title: 'La IA es herramienta, no oráculo',
    hook: 'Predice patrones de lenguaje. No tiene fe, conciencia ni intención.',
    points: [
      'Explica mucho, pero no “revela” verdad espiritual.',
      'Puede mezclar aciertos y errores con tono convincente.',
      'Su valor depende del criterio del usuario.'
    ],
    narrative:
      'La analogía clave: una biblioteca gigante que aprendió a hablar. Útil para estudiar, peligrosa si se usa sin filtro.',
    image: '/images/02.svg',
    prompt:
      'Biblioteca infinita fusionada con circuitos de IA, atmósfera sobria, tonos tierra y azul petróleo, lente gran angular, iluminación dramática de alto contraste.'
  },
  {
    id: 'marco',
    section: 'Sección 2',
    title: 'El marco del creyente decide el resultado',
    hook: 'Sin contexto bíblico y teológico, la IA solo repite promedios culturales.',
    points: [
      'Prompt con rol, contexto, objetivo y formato.',
      'Comparar respuestas entre modelos distintos.',
      'Contrastar siempre con Escritura, comunidad y fuentes confiables.'
    ],
    narrative:
      'El mejor “prompt engineering” para iglesia no es técnico: es espiritual, pastoral y comunitario.',
    image: '/images/03.svg',
    prompt:
      'Mesa de estudio bíblico con personas diversas, cuadernos abiertos, luz de atardecer, estética editorial premium, profundidad de campo suave, sin texto.'
  },
  {
    id: 'practica',
    section: 'Sección 3',
    title: 'Herramienta práctica para estudio bíblico',
    hook: 'Contexto histórico, comparación de perspectivas y síntesis rápida.',
    points: [
      'Reconstruir entorno cultural de cada libro bíblico.',
      'Simular preguntas desde distintas audiencias históricas.',
      'Resumir y estructurar sesiones de discipulado.'
    ],
    narrative:
      'Cuando la usamos como asistente y no como autoridad, acelera preparación de estudios, clases y conversaciones pastorales.',
    image: '/images/04.svg',
    prompt:
      'Mapa antiguo de Medio Oriente sobrepuesto con capas de datos luminosas, estilo fotorrealista, colores cálidos, composición limpia para texto superpuesto.'
  },
  {
    id: 'llamado',
    section: 'Cierre',
    title: 'Innovar con sabiduría',
    hook: 'No se trata de seguir moda. Se trata de servir mejor con las herramientas del tiempo presente.',
    points: [
      'Adoptar IA con humildad y responsabilidad.',
      'Entrenar a la comunidad en buenas prácticas.',
      'Mantener a Cristo al centro del discernimiento.'
    ],
    narrative:
      'La pregunta no es “IA sí o no”. La pregunta es cómo la usamos para formar mejor, enseñar mejor y amar mejor.',
    image: '/images/05.svg',
    prompt:
      'Auditorio moderno con pantalla gigante y público atento, colores dorados y teal, estilo cinematográfico inspirador, alto detalle, sin texto ni logos.'
  }
];
