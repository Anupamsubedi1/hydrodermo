import { COMPANY, NAV, PROPOSAL } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--forest-950)] text-[var(--on-dark)]">
      <div className="container section !pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-[1.2rem] font-semibold tracking-[-0.01em]">{COMPANY.name}</p>
            <p className="mt-2 max-w-sm text-[0.95rem] text-[var(--on-dark-muted)]">
              {COMPANY.project} · {COMPANY.location}
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="eyebrow text-[var(--on-dark-faint)]">Sections</p>
            <ul className="mt-3 grid gap-2 text-[0.95rem]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="link text-[var(--on-dark-muted)] hover:text-[var(--on-dark)]">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#sources" className="link text-[var(--on-dark-muted)] hover:text-[var(--on-dark)]">
                  Sources
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <p className="eyebrow text-[var(--on-dark-faint)]">Registered office</p>
            <address className="mt-3 not-italic text-[0.95rem] text-[var(--on-dark-muted)]">
              {COMPANY.registeredOffice}
              <br />
              {COMPANY.phone.map((p, i) => (
                <span key={p.href}>
                  <a className="link" href={p.href}>
                    {p.display}
                  </a>
                  {i < COMPANY.phone.length - 1 ? " · " : ""}
                </span>
              ))}
              <br />
              <a className="link" href={COMPANY.email.href}>
                {COMPANY.email.display}
              </a>
            </address>
          </div>
        </div>
        <div className="rule-dark mt-12 pt-6 text-[0.85rem] text-[var(--on-dark-faint)]">
          <p className="font-medium text-[var(--on-dark-muted)]">{PROPOSAL.label}</p>
          <p className="mt-2 max-w-3xl">{PROPOSAL.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
