import { NAV, PROPOSAL } from "@/content/site";
import { Wordmark } from "./Wordmark";

/**
 * Restrained header over the hero. Server-rendered; the navigation is plain
 * anchors so it works without JavaScript. Hidden while the intro plays.
 */
export function SiteHeader() {
  return (
    <header className="site-header absolute inset-x-0 top-0 z-20 text-[var(--on-dark)]">
      <div className="container flex items-center justify-between gap-4 pt-[calc(env(safe-area-inset-top)+0.9rem)] pb-3">
        {/* No aria-label: the accessible name is the wordmark text itself, which
            keeps it matching what a speech-input user would say. */}
        <a href="#top" className="no-underline">
          <Wordmark tone="dark" size={38} />
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
        <span className="hidden shrink-0 rounded-full border border-[var(--line-dark)] bg-[rgba(7,23,27,0.32)] px-3 py-1.5 text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-[var(--on-dark-muted)] backdrop-blur-sm sm:inline-block">
          {PROPOSAL.label}
        </span>
      </div>
    </header>
  );
}
