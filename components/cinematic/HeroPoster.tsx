"use client";

import { getImageProps } from "next/image";
import { POSTERS } from "@/lib/cinematic/assets";

const ALT =
  "Concept illustration of a green Himalayan river valley at dawn: a river winds past a low diversion weir toward a small powerhouse on the right bank, with misty ridges and snow peaks behind.";

/**
 * Art-directed hero poster: a portrait crop below 1024px, the wide frame above.
 * Rendered in the initial HTML with high fetch priority; only the matching
 * source is downloaded. Three.js textures use separate plate files.
 */
export function HeroPoster({ hidden }: { hidden: boolean }) {
  const common = { alt: ALT, sizes: "100vw", quality: 80, loading: "eager" as const, fetchPriority: "high" as const };
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, ...POSTERS.mobile });
  const {
    props: { srcSet: desktopSrcSet, ...desktopRest },
  } = getImageProps({ ...common, ...POSTERS.desktop });

  return (
    <div className={`cine-poster${hidden ? " is-hidden" : ""}`} aria-hidden={hidden ? "true" : undefined}>
      <picture>
        <source media="(max-width: 1023px)" srcSet={mobileSrcSet} sizes="100vw" width={POSTERS.mobile.width} height={POSTERS.mobile.height} />
        <source media="(min-width: 1024px)" srcSet={desktopSrcSet} sizes="100vw" />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is spread from getImageProps */}
        <img {...desktopRest} className="cine-poster-img" data-poster="true" />
      </picture>
    </div>
  );
}
