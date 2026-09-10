// Local, typed content for the Beni Hydropower sales demo. Every figure carries
// the source id it was taken from (see ./sources.ts). Edit here, not in components.

import type { SourceId } from "./sources";

export interface Fact {
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
  readonly sources: readonly SourceId[];
}

export interface DocumentLink {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly publisher: string;
  readonly language: "Nepali" | "English";
  readonly format: "PDF" | "Web";
  readonly dated: string;
  readonly sources: readonly SourceId[];
}

export const COMPANY = {
  name: "Beni Hydropower Project Limited",
  shortName: "Beni Hydropower",
  wordmark: "Beni Hydropower",
  wordmarkSuffix: "Project Limited",
  project: "Upper Solu Khola Hydropower Project",
  projectShort: "Upper Solu Khola",
  location: "Solukhumbu District, Koshi Province, Nepal",
  river: "Solu Khola",
  domain: "benihydro.com.np",
  registeredOffice: "Hadigaon, Kathmandu",
  phone: [
    { display: "+977 1 4523075", href: "tel:+97714523075" },
    { display: "+977 1 4511153", href: "tel:+97714511153" },
  ],
  email: { display: "info.benihydro@gmail.com", href: "mailto:info.benihydro@gmail.com" },
  contactSources: ["companyContact", "sebonProspectusPdf"] as const satisfies readonly SourceId[],
} as const;

export const PROPOSAL = {
  agency: "Techvion Technology Private Limited",
  agencyShort: "Techvion",
  label: "Independent website concept by Techvion",
  illustrationLabel: "Concept illustration",
  schematicLabel: "How hydropower works — illustrative",
  disclaimer:
    "This is an unsolicited website concept prepared by Techvion Technology Private Limited to illustrate a proposed redesign. It is not an official publication of Beni Hydropower Project Limited. Figures are quoted from public documents listed in the sources section.",
} as const;

export const HERO = {
  headline: "From Himalayan water to lasting energy.",
  supporting:
    "A 19.8 MW run-of-river plant on the Solu Khola in Solukhumbu, delivering power to Nepal's national grid since 2023.",
  primaryCta: { label: "Explore the project", href: "#project" },
  secondaryCta: { label: "Investor information", href: "#investors" },
  scrollHint: "Scroll to follow the river",
  sources: ["companyProjectPage", "icra2023", "icra2025"] as const satisfies readonly SourceId[],
} as const;

/** Text shown by the pinned sequence, one entry per chapter (indices match CHAPTERS in lib/cinematic/config.ts). */
export const CHAPTER_COPY = [
  {
    id: "flight",
    title: "From Himalayan water to lasting energy.",
    body: "Beni Hydropower Project Limited operates the Upper Solu Khola Hydropower Project, a run-of-river scheme on a snow-fed river below the Numbur range.",
  },
  {
    id: "approach",
    title: "A river that keeps flowing.",
    body: "Run-of-river means the Solu Khola is diverted, not stored: water is taken at a low weir, carried to the powerhouse and returned to the river a short distance downstream.",
  },
  {
    id: "reveal",
    title: "182 metres of head.",
    body: "From intake to turbine the water falls about 182 metres. That drop, at a design discharge of roughly 12 cubic metres per second, is where the energy comes from.",
  },
  {
    id: "powerhouse",
    title: "Three units. One grid.",
    body: "The powerhouse feeds the Nepal Electricity Authority network through the Tingla substation under a long-term power purchase agreement.",
  },
  {
    id: "cutaway",
    title: "Inside the powerhouse.",
    body: "What follows is an illustration of the generation process, not an engineering model of Beni's equipment.",
  },
  {
    id: "machine",
    title: "Water in. Electricity out.",
    body: "Pressurised water enters the spiral casing, spins the Francis runner, the shaft drives the generator, and a transformer steps the voltage up for the grid.",
    steps: [
      { id: "penstock", label: "Penstock", text: "Steel pipe carries pressurised water from the intake to the turbine." },
      { id: "turbine", label: "Francis turbine", text: "Water strikes the runner blades and turns the vertical shaft." },
      { id: "generator", label: "Generator", text: "The spinning rotor induces electricity in the stator windings." },
      { id: "transformer", label: "Transformer and grid", text: "Voltage is stepped up and sent to the national grid." },
    ],
  },
  {
    id: "settle",
    title: "19.8 MW installed. 18.236 MW under PPA.",
    body: "Installed capacity describes plant size, not live output. Energy is sold to the Nepal Electricity Authority under predetermined tariffs.",
  },
] as const;

/** Short anchored labels for the machine sequence (positions come from the 3D scene). */
export const ANCHOR_LABELS = {
  penstock: { title: "Penstock", fact: "Pressurised water from the intake" },
  turbine: { title: "Francis turbine", fact: "Vertical shaft · 3 units on site" },
  generator: { title: "Generator", fact: "19.8 MW installed capacity" },
  transformer: { title: "Step-up transformer", fact: "To the NEA network" },
  grid: { title: "Transmission line", fact: "Tingla substation" },
} as const;

export const PROJECT_OVERVIEW = {
  heading: "The project",
  intro:
    "Upper Solu Khola is a run-of-river hydroelectric project in Solukhumbu District, eastern Nepal. Water is diverted at a low weir downstream of the suspension bridge at Beni, carried through a headrace tunnel and penstock, and returned to the river at the powerhouse near Boldok.",
  paragraphs: [
    "The company was established in 2063 BS (registered 10 November 2006) and converted to a public limited company in July 2021. Its power purchase agreement with the Nepal Electricity Authority was signed on 31 December 2012, and the plant entered commercial operation on 16 June 2023.",
    "The Solu Khola is a perennial river fed mostly by snowmelt from the Numbur range and partly by the monsoon, joining the Dudh Koshi further downstream. The project is about 1.25 km from Phaplu airport and roughly 493 km from Kathmandu by road.",
  ],
  sources: ["companyAbout", "companyProjectPage", "icra2023"] as const satisfies readonly SourceId[],
} as const;

export const HIGHLIGHTS: readonly Fact[] = [
  { label: "Installed capacity", value: "19.8 MW", detail: "Plant size, not live generation", sources: ["companyProjectPage", "icra2023"] },
  { label: "PPA capacity", value: "18.236 MW", detail: "Contracted with Nepal Electricity Authority", sources: ["icra2023"] },
  { label: "Scheme", value: "Run-of-river", detail: "Diversion weir, headrace tunnel, penstock, powerhouse", sources: ["companyProjectPage"] },
  { label: "Gross head", value: "182 m", detail: "Design discharge about 12 m³/s at Q40", sources: ["icra2023"] },
  { label: "Commercial operation", value: "16 June 2023", detail: "Connected to NEA's Tingla substation", sources: ["icra2023"] },
  { label: "Contract energy", value: "≈110 GWh / year", detail: "Saleable energy at 70% contract plant load factor", sources: ["icra2023"] },
  { label: "Generation, FY2025 H1", value: "≈97% of contract", detail: "82% over the twelve months to mid-January 2025", sources: ["icra2025"] },
  { label: "Issuer rating", value: "[ICRANP-IR] BB+", detail: "Upgraded from BB, February 2025", sources: ["icra2025"] },
];

export const INVESTORS = {
  heading: "Investor information",
  intro:
    "Beni Hydropower Project Limited offered 20% of its issued capital of NPR 1.04 billion to the public through an initial public offering approved by the Securities Board of Nepal. Documents below are the company's and the regulator's own publications.",
  ipoFacts: [
    { label: "Issued capital", value: "NPR 1,04,00,00,000", detail: "10,400,000 shares of NPR 100", sources: ["sebonProspectusPdf", "companyIssueNotice2026"] },
    { label: "Public offering", value: "20,80,000 shares", detail: "20% of issued capital, face value NPR 100", sources: ["sebonProspectusPdf", "companyIssueNotice2026"] },
    { label: "General public tranche", value: "8,63,200 shares", detail: "Opened 22 Bhadra 2083 (7 September 2026)", sources: ["companyIssueNotice2026", "sharesansarIpo"] },
    { label: "Project-affected locals", value: "10,40,000 shares", detail: "Residents of Solukhumbu District", sources: ["companyIssueNotice2026", "sharesansarIpo"] },
    { label: "Issue manager", value: "NMB Capital Limited", detail: "Baluwatar, Kathmandu", sources: ["companyIssueNotice2026", "sharesansarIpo"] },
    { label: "Application size", value: "10 to 10,000 shares", detail: "Through ASBA and C-ASBA (Mero Share)", sources: ["companyIssueNotice2026"] },
  ] as readonly Fact[],
  note: "The general public tranche was scheduled to close on 26 Bhadra 2083 at the earliest and 5 Ashwin 2083 (21 September 2026) at the latest. Check the company notice and SEBON for the current status; this concept page is not updated in real time.",
  sources: ["sebonLanding", "sebonProspectusPdf", "companyIssueNotice2026"] as const satisfies readonly SourceId[],
} as const;

export const DOCUMENTS: readonly DocumentLink[] = [
  {
    title: "Approved prospectus",
    description: "Full prospectus for the initial public offering, hosted by the Securities Board of Nepal.",
    href: "https://www.sebon.gov.np/uploads/2026/03/16/ML5jP2iflc3iq8Q6PrSQ1zFygUQJZJyrNcm511Me.pdf",
    publisher: "SEBON",
    language: "Nepali",
    format: "PDF",
    dated: "March 2026",
    sources: ["sebonLanding", "sebonProspectusPdf"],
  },
  {
    title: "SEBON prospectus page",
    description: "Regulator's landing page for Beni Hydropower Project Limited filings.",
    href: "https://www.sebon.gov.np/prospectus/beni-hydropower-project-limited",
    publisher: "SEBON",
    language: "English",
    format: "Web",
    dated: "Ongoing",
    sources: ["sebonLanding"],
  },
  {
    title: "Public issue opening notice",
    description: "Company notice for the general public tranche of 8,63,200 shares.",
    href: "https://benihydro.com.np/wp-content/uploads/2026/09/Beni-Issue-Open-Public-Final.pdf",
    publisher: "Beni Hydropower Project Ltd.",
    language: "Nepali",
    format: "PDF",
    dated: "Bhadra 2083 (September 2026)",
    sources: ["companyIssueNotice2026"],
  },
  {
    title: "Prospectus 2026 (company copy)",
    description: "Prospectus as published on the company's downloads page.",
    href: "https://benihydro.com.np/wp-content/uploads/2026/09/Prospectus-Beni-2.pdf",
    publisher: "Beni Hydropower Project Ltd.",
    language: "Nepali",
    format: "PDF",
    dated: "September 2026",
    sources: ["companyDownloads", "companyProspectus2026"],
  },
  {
    title: "ICRA Nepal rating rationale, February 2025",
    description: "Ratings upgraded to [ICRANP-IR] BB+ and [ICRANP] LBB+/A4+.",
    href: "https://www.icranepal.com/wp-content/uploads/2025/02/A.1020-Beni-Hydropower-Project-Limited_Issuer-and-BLR-Surveillance_February-17-2025-_Final.pdf",
    publisher: "ICRA Nepal",
    language: "English",
    format: "PDF",
    dated: "17 February 2025",
    sources: ["icra2025"],
  },
  {
    title: "ICRA Nepal rating rationale, September 2023",
    description: "Initial issuer and bank loan ratings with project description.",
    href: "https://www.icranepal.com/wp-content/uploads/2023/12/A.471-Beni-Hydropower_Fresh-Issuer-Rating-and-Fresh-BLR_Sept-2023-_Final.pdf",
    publisher: "ICRA Nepal",
    language: "English",
    format: "PDF",
    dated: "27 September 2023",
    sources: ["icra2023"],
  },
  {
    title: "Project report",
    description: "Company project report PDF (about 5 MB).",
    href: "https://benihydro.com.np/wp-content/uploads/2024/12/beni-hydro-project.pdf",
    publisher: "Beni Hydropower Project Ltd.",
    language: "English",
    format: "PDF",
    dated: "December 2024",
    sources: ["companyProjectReport"],
  },
];

export const NOTICES = {
  heading: "Notices and reports",
  intro: "Published company notices are linked from the documents above. Annual reports, quarterly results and shareholder notices would appear here on the live site.",
  emptyState: "No further reports have been verified for this concept. The production site would list annual reports, AGM notices and NEPSE disclosures with dates.",
} as const;

export const LEADERSHIP = {
  heading: "Leadership",
  intro: "As published on the company website.",
  people: [
    { name: "Ganesh Karki", role: "Chairman" },
    { name: "Anu Dangol", role: "Director" },
    { name: "Hirendra Man Pradhan", role: "Director" },
    { name: "Sonam Tsering Sherpa", role: "Director" },
    { name: "Pemba Gelbu Sherpa", role: "Director" },
    { name: "Saman Manandhar", role: "Chief Executive Officer" },
  ],
  sources: ["companyBoard"] as const satisfies readonly SourceId[],
} as const;

export const GALLERY = {
  heading: "Project gallery",
  emptyState:
    "Photographs of the headworks, penstock and powerhouse have not been supplied for this concept. The production site would present an approved photo set here; the hero illustration is a labelled concept image, not a photograph of the plant.",
} as const;

export const CONTACT = {
  heading: "Contact",
  intro: "Registered office and public contact details as listed by the company.",
} as const;

export const NAV = [
  { label: "Project", href: "#project" },
  { label: "Highlights", href: "#highlights" },
  { label: "Investors", href: "#investors" },
  { label: "Documents", href: "#documents" },
  { label: "Contact", href: "#contact" },
] as const;

export const SITE_META = {
  title: "Beni Hydropower Project Limited — website concept by Techvion",
  description:
    "Concept website for Beni Hydropower Project Limited: the 19.8 MW Upper Solu Khola run-of-river project in Solukhumbu, Nepal, with investor documents and a cinematic river-to-grid story. Independent proposal by Techvion.",
  ogTitle: "Beni Hydropower — from Himalayan water to lasting energy",
} as const;
