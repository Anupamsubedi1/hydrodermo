import {
  COMPANY,
  CONTACT,
  DOCUMENTS,
  GALLERY,
  HIGHLIGHTS,
  INVESTORS,
  LEADERSHIP,
  NOTICES,
  PROJECT_OVERVIEW,
  PROPOSAL,
  type Fact,
} from "@/content/site";
import { SOURCES, UNVERIFIED_OMISSIONS, type SourceId } from "@/content/sources";

function SourceRefs({ ids }: { ids: readonly SourceId[] }) {
  return (
    <span className="ml-1 whitespace-nowrap text-[0.72rem] text-[var(--ink-muted)]">
      {ids.map((id, i) => (
        <span key={id}>
          <a href={`#src-${id}`} className="link" aria-label={`${SOURCE_INDEX[id]}: ${SOURCES[id].title} (source)`}>
            {SOURCE_INDEX[id]}
          </a>
          {i < ids.length - 1 ? "," : ""}
        </span>
      ))}
    </span>
  );
}

const SOURCE_IDS = Object.keys(SOURCES) as SourceId[];
const SOURCE_INDEX = Object.fromEntries(SOURCE_IDS.map((id, i) => [id, i + 1])) as Record<SourceId, number>;

function FactGrid({ facts }: { facts: readonly Fact[] }) {
  return (
    <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="fact">
          <dt className="eyebrow text-[var(--ink-muted)]">{fact.label}</dt>
          <dd className="mt-3">
            <span className="fact-value numeral block">{fact.value}</span>
            {fact.detail ? <span className="mt-1.5 block text-[0.92rem] text-[var(--ink-muted)]">{fact.detail}</span> : null}
            <SourceRefs ids={fact.sources} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SectionHeading({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow text-[var(--forest-600)]">{eyebrow}</p>
      <h2 id={id} tabIndex={-1} className="h2 mt-3 scroll-mt-24 outline-none">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function ProjectSection() {
  return (
    <section id="project" aria-labelledby="project-heading" className="section container scroll-mt-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <SectionHeading id="project-heading" eyebrow="Project overview" title={PROJECT_OVERVIEW.heading}>
            <p className="lede mt-6 text-[var(--ink)]">{PROJECT_OVERVIEW.intro}</p>
          </SectionHeading>
        </div>
        <div className="measure space-y-5 text-[var(--ink-muted)] lg:pt-16">
          {PROJECT_OVERVIEW.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <p className="text-[0.85rem]">
            Sources <SourceRefs ids={PROJECT_OVERVIEW.sources} />
          </p>
          <dl className="rule grid grid-cols-2 gap-6 pt-6 text-[0.95rem]">
            <div>
              <dt className="eyebrow text-[var(--ink-faint)]">River</dt>
              <dd className="mt-1 font-medium">{COMPANY.river}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[var(--ink-faint)]">Location</dt>
              <dd className="mt-1 font-medium">{COMPANY.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function HighlightsSection() {
  return (
    <section id="highlights" aria-labelledby="highlights-heading" className="bg-[var(--paper-100)] scroll-mt-16">
      <div className="section container">
        <SectionHeading id="highlights-heading" eyebrow="Verified figures" title="Project highlights">
          <p className="mt-5 max-w-2xl text-[var(--ink-muted)]">
            Figures are quoted from the company&apos;s website and ICRA Nepal&apos;s published rating rationales. Installed capacity
            describes the size of the plant; it is not a live generation figure.
          </p>
        </SectionHeading>
        <div className="mt-10">
          <FactGrid facts={HIGHLIGHTS} />
        </div>
      </div>
    </section>
  );
}

export function InvestorsSection() {
  return (
    <section id="investors" aria-labelledby="investors-heading" className="section container scroll-mt-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        <div>
          <SectionHeading id="investors-heading" eyebrow="For shareholders and applicants" title={INVESTORS.heading}>
            <p className="mt-6 text-[var(--ink-muted)]">{INVESTORS.intro}</p>
          </SectionHeading>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-ink" href={SOURCES.sebonProspectusPdf.url} target="_blank" rel="noopener noreferrer">
              Open the prospectus (SEBON, PDF)
            </a>
            <a className="btn btn-outline" href={SOURCES.sebonLanding.url} target="_blank" rel="noopener noreferrer">
              SEBON prospectus page
            </a>
          </div>
          <p className="mt-6 rounded-md border border-[var(--line)] bg-[var(--paper-100)] p-4 text-[0.9rem] text-[var(--ink-muted)]">
            {INVESTORS.note}
          </p>
        </div>
        <div>
          <FactGrid facts={INVESTORS.ipoFacts} />
        </div>
      </div>
    </section>
  );
}

export function DocumentsSection() {
  return (
    <section id="documents" aria-labelledby="documents-heading" className="bg-[var(--paper-100)] scroll-mt-16">
      <div className="section container">
        <SectionHeading id="documents-heading" eyebrow="Documents" title="Prospectus, notices and ratings">
          <p className="mt-5 max-w-2xl text-[var(--ink-muted)]">
            Every link below opens the publisher&apos;s own file. Nepali-language documents are marked; no document has been
            altered or re-hosted for this concept.
          </p>
        </SectionHeading>
        <ul className="mt-10">
          {DOCUMENTS.map((doc) => (
            <li key={doc.href} className="doc-row">
              <div>
                <a href={doc.href} target="_blank" rel="noopener noreferrer" className="link text-[1.05rem] font-semibold">
                  {doc.title}
                </a>
                <p className="mt-1 text-[0.95rem] text-[var(--ink-muted)]">{doc.description}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.8rem] text-[var(--ink-faint)]">
                  <span>{doc.publisher}</span>
                  <span aria-hidden="true">·</span>
                  <span>{doc.dated}</span>
                  <SourceRefs ids={doc.sources} />
                </p>
              </div>
              <div className="flex gap-2">
                <span className="tag">{doc.format}</span>
                <span className="tag">{doc.language}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="h3 font-semibold">{NOTICES.heading}</h3>
            <p className="mt-3 text-[var(--ink-muted)]">{NOTICES.intro}</p>
            <p className="mt-4 rounded-md border border-dashed border-[var(--line-strong)] p-4 text-[0.92rem] text-[var(--ink-muted)]">
              {NOTICES.emptyState}
            </p>
          </div>
          <div>
            <h3 className="h3 font-semibold">{LEADERSHIP.heading}</h3>
            <p className="mt-3 text-[0.9rem] text-[var(--ink-faint)]">
              {LEADERSHIP.intro} <SourceRefs ids={LEADERSHIP.sources} />
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.95rem]">
              {LEADERSHIP.people.map((person) => (
                <li key={person.name}>
                  <span className="block font-medium">{person.name}</span>
                  <span className="text-[var(--ink-muted)]">{person.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GallerySection() {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="section container scroll-mt-16">
      <SectionHeading id="gallery-heading" eyebrow="Photography" title={GALLERY.heading} />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {["Headworks", "Penstock", "Powerhouse"].map((label) => (
          <div
            key={label}
            className="flex aspect-[4/3] items-end rounded-md border border-dashed border-[var(--line-strong)] bg-[var(--paper-100)] p-4"
          >
            <span className="eyebrow text-[var(--ink-faint)]">{label} — photo to be supplied</span>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-2xl text-[0.95rem] text-[var(--ink-muted)]">{GALLERY.emptyState}</p>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-[var(--forest-900)] text-[var(--on-dark)] scroll-mt-16">
      <div className="section container grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow text-[var(--river-300)]">{CONTACT.heading}</p>
          <h2 id="contact-heading" tabIndex={-1} className="h2 mt-3 outline-none">
            {COMPANY.name}
          </h2>
          <p className="mt-5 max-w-md text-[var(--on-dark-muted)]">{CONTACT.intro}</p>
        </div>
        <dl className="grid gap-6 text-[1.05rem] sm:grid-cols-2">
          <div>
            <dt className="eyebrow text-[var(--on-dark-faint)]">Registered office</dt>
            <dd className="mt-2">{COMPANY.registeredOffice}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[var(--on-dark-faint)]">Telephone</dt>
            <dd className="mt-2 grid gap-1">
              {COMPANY.phone.map((p) => (
                <a key={p.href} href={p.href} className="link">
                  {p.display}
                </a>
              ))}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-[var(--on-dark-faint)]">Email</dt>
            <dd className="mt-2">
              <a href={COMPANY.email.href} className="link">
                {COMPANY.email.display}
              </a>
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-[var(--on-dark-faint)]">Website</dt>
            <dd className="mt-2">
              <a href={`https://${COMPANY.domain}/`} className="link" target="_blank" rel="noopener noreferrer">
                {COMPANY.domain}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function SourcesSection() {
  return (
    <section id="sources" aria-labelledby="sources-heading" className="bg-[var(--paper-100)] scroll-mt-16">
      <div className="section container !pt-14 !pb-14">
        <h2 id="sources-heading" tabIndex={-1} className="h3 font-semibold outline-none">
          Sources and verification
        </h2>
        <p className="mt-2 max-w-2xl text-[0.92rem] text-[var(--ink-muted)]">
          Retrieved by {PROPOSAL.agencyShort} for this concept; dates are when each source was checked. Nothing here is a
          statement by the company.
        </p>
        <ol className="mt-6 grid gap-x-10 gap-y-3 text-[0.88rem] md:grid-cols-2">
          {SOURCE_IDS.map((id) => {
            const s = SOURCES[id];
            return (
              <li key={id} id={`src-${id}`} className="grid grid-cols-[1.5rem_1fr] gap-2 scroll-mt-24">
                <span className="numeral text-[var(--ink-faint)]">{SOURCE_INDEX[id]}.</span>
                <span>
                  <a href={s.url} className="link" target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                  <span className="text-[var(--ink-muted)]">
                    {" "}
                    — {s.publisher}, checked {s.verifiedOn}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <details className="mt-8 max-w-2xl text-[0.9rem] text-[var(--ink-muted)]">
          <summary className="cursor-pointer font-medium text-[var(--ink)]">Deliberately omitted (not verifiable)</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {UNVERIFIED_OMISSIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
