import fs from 'node:fs';
import path from 'node:path';

export type Chapter = {
  id: string;
  index: number;
  filename: string;
  title: string;
  subtitle: string;
  markdown: string;
  image: string;
  prompt: string;
};

const TITLE_RE = /^#\s+(.+)$/m;
const H2_RE = /^##\s+(.+)$/m;

const PRESENTACION_DIR = path.resolve(process.cwd(), '..');

function derivePrompt(title: string): string {
  return `Crea una imagen cinematográfica y realista para el tema "${title}" con estética editorial, alto contraste, luz cálida, composición limpia y sin texto.`;
}

function cleanMarkdown(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .trim();
}

export function loadChapters(): Chapter[] {
  const files = fs
    .readdirSync(PRESENTACION_DIR)
    .filter((name) => /^\d{2}-.+\.md$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'es'));

  return files.map((filename, index) => {
    const fullPath = path.join(PRESENTACION_DIR, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const markdown = cleanMarkdown(raw);

    const titleMatch = markdown.match(TITLE_RE);
    const subtitleMatch = markdown.match(H2_RE);
    const title = titleMatch?.[1]?.trim() ?? filename.replace(/\.md$/, '');
    const subtitle = subtitleMatch?.[1]?.trim() ?? '';
    const id = filename.replace(/\.md$/, '');

    return {
      id,
      index,
      filename,
      title,
      subtitle,
      markdown,
      image: `/images/${String((index % 5) + 1).padStart(2, '0')}.svg`,
      prompt: derivePrompt(title)
    };
  });
}
