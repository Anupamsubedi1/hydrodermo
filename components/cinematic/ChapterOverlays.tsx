"use client";

import type { RefObject } from "react";
import { ANCHOR_LABELS, CHAPTER_COPY, HERO, PROPOSAL } from "@/content/site";
import type { AnchorId, Chapter } from "@/lib/cinematic/types";

interface ChapterOverlaysProps {
  chapter: Chapter;
  activeStation: number;
  refs: RefObject<(HTMLDivElement | null)[]>;
  anchorRefs: RefObject<Partial<Record<AnchorId, HTMLDivElement | null>>>;
}

export const ANCHOR_ORDER: AnchorId[] = ["penstock", "turbine", "generator", "transformer", "grid"];

/**
 * Server-renderable text for every chapter. Chapter 0 is the semantic hero
 * (h1, supporting copy, both links) and is never made inert. Other chapters
 * are inert and hidden from AT unless active; their opacity is driven by the
 * progress store outside React. Anchored labels are positioned by the scene.
 */
export function ChapterOverlays({ chapter, activeStation, refs, anchorRefs }: ChapterOverlaysProps) {
  const setRef = (index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
  };
  const machine = CHAPTER_COPY[5];

  return (
    <div className="cine-chapters">
      <div ref={setRef(0)} className="cine-chapter cine-chapter--hero hero-rise" data-chapter="0" data-active={chapter === 0}>
        <h1 className="display text-[var(--on-dark)]">{HERO.headline}</h1>
        <p className="lede mt-4 max-w-[34rem] text-[var(--on-dark-muted)] sm:mt-5">{HERO.supporting}</p>
        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <a className="btn btn-primary" href={HERO.primaryCta.href}>
            {HERO.primaryCta.label}
          </a>
          <a className="btn btn-ghost" href={HERO.secondaryCta.href}>
            {HERO.secondaryCta.label}
          </a>
        </div>
      </div>

      {CHAPTER_COPY.slice(1).map((copy, i) => {
        const index = (i + 1) as Chapter;
        const active = chapter === index;
        return (
          <div
            key={copy.id}
            ref={setRef(index)}
            className="cine-chapter motion-only"
            data-chapter={index}
            data-active={active}
            aria-hidden={!active}
            inert={!active}
          >
            <h2 className="display-sm text-[var(--on-dark)]">{copy.title}</h2>
            <p className="mt-3 max-w-[30rem] text-[0.98rem] leading-relaxed text-[var(--on-dark-muted)] sm:mt-4 sm:text-[1.02rem]">{copy.body}</p>
            {index === 5 ? (
              <ul className="cine-steps">
                {machine.steps.map((step, s) => (
                  <li key={step.id} className="cine-step" data-on={activeStation >= s}>
                    <span className="font-semibold">{step.label}</span>
                    <small>{step.text}</small>
                  </li>
                ))}
              </ul>
            ) : null}
            {index === 6 ? (
              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
                <a className="btn btn-primary" href="#investors">
                  Investor information
                </a>
                <a className="btn btn-ghost" href="#project">
                  Project overview
                </a>
              </div>
            ) : null}
            {index >= 4 ? <p className="mt-4 text-[0.72rem] text-[var(--on-dark-faint)]">{PROPOSAL.schematicLabel}</p> : null}
          </div>
        );
      })}

      <div className="cine-anchors" aria-hidden="true">
        {ANCHOR_ORDER.map((id) => (
          <div
            key={id}
            ref={(el) => {
              anchorRefs.current[id] = el;
            }}
            className="cine-anchor"
            data-anchor={id}
          >
            <span className="cine-anchor-dot" />
            <span className="cine-anchor-card">
              <span className="cine-anchor-title">{ANCHOR_LABELS[id].title}</span>
              <span className="cine-anchor-fact">{ANCHOR_LABELS[id].fact}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
