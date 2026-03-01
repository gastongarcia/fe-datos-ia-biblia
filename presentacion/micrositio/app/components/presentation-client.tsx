'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Chapter } from '../lib/content';
import { parseMarkdown, renderInline } from '../lib/markdown';

type Props = {
  chapters: Chapter[];
};

function MarkdownContent({
  chapter
}: {
  chapter: Chapter;
}) {
  const { markdown, image, title, prompt } = chapter;
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
                className="relative h-[240px] overflow-hidden rounded-2xl border border-ink/15 md:h-[320px] lg:h-[400px]"
              >
                <Image src={image} alt={title} fill className="object-cover" />
              </div>
              <details className="mt-3 rounded-2xl border border-ink/15 bg-white/80 p-3 text-sm text-ink/85">
                <summary className="cursor-pointer font-semibold">Prompt de imagen LLM para este capítulo</summary>
                <p className="mt-2 leading-relaxed">{prompt}</p>
              </details>
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
      <aside
        className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[300px] shrink-0 rounded-2xl p-4 shadow-soft xl:flex xl:flex-col"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">Fe + Datos</p>
        <h1 className="title-display mt-2 text-3xl leading-[1.02] text-ink">Presentación viva</h1>
        <p className="mt-2 text-sm text-ink/75">Capítulo {progress}</p>
        <nav className="mt-4 flex-1 space-y-2 overflow-auto pr-1">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => refs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                index === active
                  ? 'border-ember bg-ember text-white'
                  : 'border-ink/15 bg-white/50 text-ink hover:border-ink/35'
              }`}
            >
              <p className="truncate text-[11px] uppercase tracking-[0.14em]">{chapter.filename.replace('.md', '')}</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{chapter.title}</p>
            </button>
          ))}
        </nav>
        <div className="mt-3 rounded-xl bg-white/75 p-3 text-xs text-ink/80">
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
            className="reveal min-h-[70vh] scroll-mt-24 overflow-hidden rounded-3xl border border-ink/10 bg-[rgba(255,255,255,0.72)] shadow-soft"
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
