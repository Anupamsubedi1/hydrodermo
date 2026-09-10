import { COMPANY, NAV, PROPOSAL } from "@/content/site";

/**
 * Restrained header that sits over the hero poster. Server-rendered; the
 * navigation is plain anchors so it works without JavaScript.
 */
export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 text-[var(--on-dark)]">
      <div className="container flex items-center justify-between gap-6 pt-[calc(env(safe-area-inset-top)+1.1rem)] pb-3">
        <a href="#top" className="group flex items-baseline gap-2 no-underline">
          <span className="text-[1.05rem] font-semibold tracking-[-0.01em]">{COMPANY.wordmark}</span>
          <span className="text-[0.8rem] font-medium tracking-[0.02em] text-[var(--on-dark-muted)] max-sm:sr-only sm:inline">
            {COMPANY.wordmarkSuffix}
          </span>
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.9rem] font-medium">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-[var(--on-dark-muted)] no-underline transition-colors hover:text-[var(--on-dark)]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="eyebrow rounded-full border border-[var(--line-dark)] bg-[rgba(7,23,27,0.32)] px-3 py-1.5 text-[0.62rem] text-[var(--on-dark-muted)] backdrop-blur-sm">
          {PROPOSAL.label}
        </span>
      </div>
    </header>
  );
}
