import type { ReactNode } from 'react';

export type MarkdownBlock =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' };

function isUlLine(line: string): boolean {
  return /^[-*]\s+/.test(line);
}

function isOlLine(line: string): boolean {
  return /^\d+\.\s+/.test(line);
}

function isHeading(line: string): boolean {
  return /^#{1,3}\s+/.test(line);
}

function isBlockquote(line: string): boolean {
  return /^>\s?/.test(line);
}

function isHr(line: string): boolean {
  return /^-{3,}$/.test(line.trim());
}

function isBlockStart(line: string): boolean {
  return !line.trim() || isHeading(line) || isUlLine(line) || isOlLine(line) || isBlockquote(line) || isHr(line);
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isHr(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      blocks.push({ type: (`h${level}` as 'h1' | 'h2' | 'h3'), text });
      i += 1;
      continue;
    }

    if (isUlLine(line)) {
      const items: string[] = [];
      while (i < lines.length && isUlLine(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, '').trim());
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (isOlLine(line)) {
      const items: string[] = [];
      while (i < lines.length && isOlLine(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, '').trim());
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (isBlockquote(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && isBlockquote(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    const paragraph: string[] = [line.trim()];
    i += 1;
    while (i < lines.length && !isBlockStart(lines[i].trim())) {
      paragraph.push(lines[i].trim());
      i += 1;
    }

    blocks.push({ type: 'p', text: paragraph.join(' ') });
  }

  return blocks;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mapLocalMarkdownHref(href: string): string {
  if (/^\d{2}-.+\.md$/.test(href)) {
    return `#${href.replace(/\.md$/, '')}`;
  }

  return href;
}

function inlineToHtml(value: string): string {
  const escaped = escapeHtml(value);

  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const mapped = mapLocalMarkdownHref(href);
      const safeHref = escapeHtml(mapped);
      return `<a href="${safeHref}">${label}</a>`;
    });
}

export function renderInline(text: string, key: string): ReactNode {
  return <span key={key} dangerouslySetInnerHTML={{ __html: inlineToHtml(text) }} />;
}
