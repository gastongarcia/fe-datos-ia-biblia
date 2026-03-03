'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Chapter } from '../lib/content';
import { parseMarkdown, renderInline } from '../lib/markdown';

type Props = {
  chapters: Chapter[];
};

type Theme = 'light' | 'dark';

const THEME_KEY = 'fe-y-datos-theme';

function MarkdownContent({
  chapter
}: {
  chapter: Chapter;
}) {
  const { markdown, image, title } = chapter;
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);
  const imageInsertIndex = useMemo(() => {
    const firstH2 = blocks.findIndex((block) => block.type === 'h2');
    if (firstH2 >= 0) {
      return firstH2 + 1;
    }
    return Math.min(3, Math.max(1, blocks.length - 1));
  }, [blocks]);

  return (
    <div className="md-content">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        let rendered: React.ReactNode;

        if (block.type === 'h1') {
          rendered = (
            <h2 key={key} className="title-display md-h1">
              {renderInline(block.text, `${key}-inline`)}
            </h2>
          );
        } else if (block.type === 'h2') {
          rendered = (
            <h3 key={key} className="md-h2">
              {renderInline(block.text, `${key}-inline`)}
            </h3>
          );
        } else if (block.type === 'h3') {
          rendered = (
            <h4 key={key} className="md-h3">
              {renderInline(block.text, `${key}-inline`)}
            </h4>
          );
        } else if (block.type === 'p') {
          rendered = (
            <p key={key} className="md-p">
              {renderInline(block.text, `${key}-inline`)}
            </p>
          );
        } else if (block.type === 'blockquote') {
          rendered = (
            <blockquote key={key} className="md-blockquote">
              {renderInline(block.text, `${key}-inline`)}
            </blockquote>
          );
        } else if (block.type === 'ul') {
          rendered = (
            <ul key={key} className="md-ul">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-item-${itemIndex}`}>{renderInline(item, `${key}-item-inline-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        } else if (block.type === 'ol') {
          rendered = (
            <ol key={key} className="md-ol">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-item-${itemIndex}`}>{renderInline(item, `${key}-item-inline-${itemIndex}`)}</li>
              ))}
            </ol>
          );
        } else {
          rendered = <hr key={key} className="md-hr" />;
        }

        if (index !== imageInsertIndex) {
          return rendered;
        }

        return (
          <div key={`${key}-with-media`}>
            {rendered}
            <div className="md-media-wrap">
              <div
                className="chapter-media-frame relative h-[240px] overflow-hidden rounded-2xl md:h-[320px] lg:h-[400px]"
              >
                <Image src={image} alt={title} fill className="object-cover" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PresentationClient({ chapters }: Props) {
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<Theme>('light');
  const [themeReady, setThemeReady] = useState(false);
  const refs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: Theme =
      storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : preferredDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', initialTheme);
    setTheme(initialTheme);
    setThemeReady(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    setTheme(nextTheme);
  };

  useEffect(() => {
    let rafId = 0;

    const updateActiveFromScroll = () => {
      const probe = window.innerHeight * 0.3;
      let current = 0;

      refs.current.forEach((element, index) => {
        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        if (rect.top <= probe) {
          current = index;
        }
      });

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        current = chapters.length - 1;
      }

      setActive((prev) => (prev === current ? prev : current));
      rafId = 0;
    };

    const onScrollOrResize = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(updateActiveFromScroll);
    };

    onScrollOrResize();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [chapters.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft', ' ', 'j', 'k', 'J', 'K'].includes(event.key)) {
        return;
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      event.preventDefault();
      const dir = ['ArrowRight', ' ', 'j', 'J'].includes(event.key) ? 1 : -1;
      const next = Math.max(0, Math.min(chapters.length - 1, active + dir));
      refs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, chapters.length]);

  const progress = `${active + 1}/${chapters.length}`;

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-[1960px] gap-6 px-3 py-5 lg:px-8">
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      >
        <span className="theme-toggle-icons" aria-hidden>
          <span className={`theme-icon ${themeReady && theme === 'light' ? 'is-active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
            </svg>
          </span>
          <span className={`theme-icon ${themeReady && theme === 'dark' ? 'is-active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.2 14.4A8.5 8.5 0 1 1 9.6 3.8a7 7 0 0 0 10.6 10.6z" />
            </svg>
          </span>
        </span>
      </button>
      <aside
        className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[300px] shrink-0 rounded-2xl p-4 shadow-soft xl:flex xl:flex-col"
      >
        <p className="sidebar-kicker text-xs font-semibold uppercase tracking-[0.18em]">Fe + Datos</p>
        <p className="sidebar-progress mt-2 text-sm">Capítulo {progress}</p>
        <nav className="mt-4 flex-1 space-y-2 overflow-auto pr-1">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => refs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                index === active
                  ? 'border-ember bg-ember text-white'
                  : 'chapter-nav-item'
              }`}
            >
              <p className="truncate text-[11px] uppercase tracking-[0.14em]">{chapter.filename.replace('.md', '')}</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{chapter.title}</p>
            </button>
          ))}
        </nav>
        <div className="chapter-help mt-3 rounded-xl p-3 text-xs">
          Navegación: <strong>← →</strong>, <strong>J/K</strong>, <strong>Space</strong>
        </div>
      </aside>

      <section className="w-full space-y-4">
        {chapters.map((chapter, index) => (
          <article
            id={chapter.id}
            key={chapter.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            className="chapter-article reveal min-h-[70vh] scroll-mt-24 overflow-hidden rounded-3xl shadow-soft"
          >
            <div className="p-5 lg:p-8">
              <MarkdownContent chapter={chapter} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
