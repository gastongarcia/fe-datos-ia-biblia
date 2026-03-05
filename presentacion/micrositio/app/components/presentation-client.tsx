'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Chapter } from '../lib/content';
import { parseMarkdown, renderInline } from '../lib/markdown';

type Props = {
  chapters: Chapter[];
};

const PRACTICAL_LABEL = 'Práctica con prompt';

function isPracticalBlock(block: ReturnType<typeof parseMarkdown>[number]): boolean {
  // Apply the prompt badge only to real prompt blocks (markdown blockquotes),
  // not to section titles or explanatory text that mention "ejercicio/prompt".
  return block.type === 'blockquote';
}

function WandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 19.6 4.4a1.4 1.4 0 0 1 2 2L6 22H4v-2Z" />
      <path d="M13 3V1M16 4l1.5-1.5M18 7h2M16 10l1.5 1.5M13 11v2" />
    </svg>
  );
}

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
        const practical = isPracticalBlock(block);
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

        if (practical) {
          rendered = (
            <div key={`${key}-practical`} className="prompt-callout" data-practical="true">
              <div className="prompt-callout-label">
                <WandIcon />
                <span>{PRACTICAL_LABEL}</span>
              </div>
              {rendered}
            </div>
          );
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
  const refs = useRef<Array<HTMLElement | null>>([]);

  const jumpToPractical = (direction: 1 | -1) => {
    const markers = Array.from(document.querySelectorAll<HTMLElement>('[data-practical="true"]'));
    if (!markers.length) {
      return;
    }

    const probe = window.scrollY + window.innerHeight * 0.24;
    const tops = markers.map((marker) => marker.getBoundingClientRect().top + window.scrollY);
    let targetIndex = 0;

    if (direction > 0) {
      const found = tops.findIndex((top) => top > probe + 4);
      targetIndex = found >= 0 ? found : 0;
    } else {
      targetIndex = tops.length - 1;
      for (let index = tops.length - 1; index >= 0; index -= 1) {
        if (tops[index] < probe - 4) {
          targetIndex = index;
          break;
        }
      }
    }

    markers[targetIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      const isNavKey = ['ArrowRight', 'ArrowLeft', ' ', 'j', 'k', 'J', 'K'].includes(event.key);
      const isPracticalJump = event.key.toLowerCase() === 'p';
      if (!isNavKey && !isPracticalJump) {
        return;
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      event.preventDefault();

      if (isPracticalJump) {
        jumpToPractical(event.shiftKey ? -1 : 1);
        return;
      }

      const dir = ['ArrowRight', ' ', 'j', 'J'].includes(event.key) ? 1 : -1;
      const next = Math.max(0, Math.min(chapters.length - 1, active + dir));
      refs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, chapters.length]);

  const progress = `${active + 1}/${chapters.length}`;
  const scrollToChapter = (index: number) => {
    refs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const canGoPrev = active > 0;
  const canGoNext = active < chapters.length - 1;

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-[1960px] gap-6 px-3 py-5 lg:px-8">
      <aside
        className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[300px] shrink-0 rounded-2xl p-4 shadow-soft xl:flex xl:flex-col"
      >
        <p className="sidebar-kicker text-xs font-semibold uppercase tracking-[0.18em]">Fe + Datos</p>
        <p className="sidebar-progress mt-2 text-sm">Capítulo {progress}</p>
        <button
          type="button"
          onClick={() => jumpToPractical(1)}
          className="chapter-nav-item mt-3 w-full rounded-xl border px-3 py-2 text-left text-sm transition"
        >
          <span className="inline-flex items-center gap-2 font-semibold">
            <WandIcon />
            Ir al próximo práctico
          </span>
          <span className="mt-1 block text-xs opacity-80">Atajo: P (Shift+P anterior)</span>
        </button>
        <nav className="mt-4 flex-1 space-y-2 overflow-auto pr-1">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => scrollToChapter(index)}
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

      <section className="min-w-0 flex-1 space-y-4 pb-24">
        {chapters.map((chapter, index) => (
          <article
            id={chapter.id}
            key={chapter.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            className="chapter-article reveal min-h-[70vh] w-full scroll-mt-24 overflow-hidden rounded-3xl shadow-soft"
          >
            <div className="p-5 lg:p-8">
              <MarkdownContent chapter={chapter} />
            </div>
          </article>
        ))}
      </section>
      <nav className="mobile-chapter-nav" aria-label="Navegación de capítulos móvil">
        <button
          type="button"
          onClick={() => scrollToChapter(active - 1)}
          disabled={!canGoPrev}
          className="mobile-nav-button"
        >
          Anterior
        </button>
        <label className="mobile-nav-select-wrap" htmlFor="mobile-chapter-select">
          <span className="sr-only">Seleccionar capítulo</span>
          <select
            id="mobile-chapter-select"
            value={active}
            onChange={(event) => scrollToChapter(Number(event.target.value))}
            className="mobile-nav-select"
          >
            {chapters.map((chapter, index) => (
              <option key={chapter.id} value={index}>
                {index + 1}. {chapter.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => scrollToChapter(active + 1)}
          disabled={!canGoNext}
          className="mobile-nav-button"
        >
          Siguiente
        </button>
      </nav>
    </main>
  );
}
