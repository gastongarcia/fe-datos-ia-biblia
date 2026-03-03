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
};

const TITLE_RE = /^#\s+(.+)$/m;
const H2_RE = /^##\s+(.+)$/m;

const PRESENTACION_DIR = path.resolve(process.cwd(), '..');

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
      image: index === 0
        ? '/images/large-woman-reading-bible.webp'
        : index === 1
          ? '/images/large-woman-library.webp'
          : index === 2
            ? '/images/large-woman-reading-tree.webp'
            : index === 3
              ? '/images/large-woman-friends.webp'
              : index === 4
                ? '/images/large-woman-confused.webp'
                : index === 5
                  ? '/images/large-woman-notes.webp'
                  : index === 6
                    ? '/images/large-woman-chapel.webp'
                    : index === 7
                      ? '/images/large-woman-friend.webp'
                      : index === 8
                        ? '/images/large-woman-jerusalem.webp'
                        : index === 9
                          ? '/images/large-woman-pharisee.webp'
                          : index === 10
                            ? '/images/large-woman-meal.webp'
                            : index === 11
                              ? '/images/large-woman-luther.webp'
                              : index === 12
                                ? '/images/large-woman-vineyard.webp'
                                : index === 13
                                  ? '/images/large-woman-thankyou.webp'
          : `/images/${String((index % 5) + 1).padStart(2, '0')}.svg`
    };
  });
}
