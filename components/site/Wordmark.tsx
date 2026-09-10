import Image from "next/image";
import { COMPANY } from "@/content/site";

const SEAL = {
  dark: "/assets/brand/seal-light.v1.png",
  light: "/assets/brand/seal.v1.png",
} as const;

/**
 * The company's registered seal beside the name. `tone` picks the artwork:
 * "dark" is the off-white seal for dark backgrounds, "light" is the red one.
 * The seal is decorative because the company name sits next to it as text.
 */
export function Wordmark({ tone = "dark", size = 40 }: { tone?: keyof typeof SEAL; size?: number }) {
  return (
    <span className="flex items-center gap-2.5 sm:gap-3">
      <Image
        src={SEAL[tone]}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-[-0.01em] sm:text-[1.05rem]">{COMPANY.wordmark}</span>
        <span className="mt-1 text-[0.66rem] font-medium tracking-[0.08em] uppercase opacity-70 sm:text-[0.7rem]">
          {COMPANY.wordmarkSuffix}
        </span>
      </span>
    </span>
  );
}
