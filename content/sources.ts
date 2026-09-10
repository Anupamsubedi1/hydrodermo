// Primary and secondary sources behind every factual statement on the demo.
// Verification dates are when Claude Code actually retrieved the source in this build.
// Re-verify before any public launch; figures such as IPO status change quickly.

export interface Source {
  readonly id: string;
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
  readonly kind: "primary" | "regulator" | "rating-agency" | "news";
  readonly verifiedOn: string; // ISO date
  readonly note?: string;
}

export const SOURCES = {
  companySite: {
    id: "companySite",
    title: "Beni Hydro Project — company website",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/",
    kind: "primary",
    verifiedOn: "2026-09-09",
    note: "About, project, board, contact and downloads pages retrieved over HTTPS.",
  },
  companyProjectPage: {
    id: "companyProjectPage",
    title: "Upper Solukhola Hydropower Project (19.8 MW)",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/uskhpp-project/",
    kind: "primary",
    verifiedOn: "2026-09-09",
  },
  companyAbout: {
    id: "companyAbout",
    title: "About Us",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/about-us/",
    kind: "primary",
    verifiedOn: "2026-09-09",
  },
  companyBoard: {
    id: "companyBoard",
    title: "Board of Directors",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/board-of-directors/",
    kind: "primary",
    verifiedOn: "2026-09-09",
  },
  companyContact: {
    id: "companyContact",
    title: "Contact Us",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/contact-us/",
    kind: "primary",
    verifiedOn: "2026-09-09",
  },
  companyDownloads: {
    id: "companyDownloads",
    title: "Downloads",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/downloads/",
    kind: "primary",
    verifiedOn: "2026-09-09",
  },
  companyProspectus2026: {
    id: "companyProspectus2026",
    title: "Beni Hydro Prospectus 2026 (PDF, Nepali)",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/wp-content/uploads/2026/09/Prospectus-Beni-2.pdf",
    kind: "primary",
    verifiedOn: "2026-09-09",
    note: "HTTP 200, application/pdf, about 1.2 MB.",
  },
  companyIssueNotice2026: {
    id: "companyIssueNotice2026",
    title: "Public issue opening notice, Bhadra 2083 (PDF, Nepali)",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/wp-content/uploads/2026/09/Beni-Issue-Open-Public-Final.pdf",
    kind: "primary",
    verifiedOn: "2026-09-09",
    note: "Text layer read: 8,63,200 units for the general public; issue open 2083/05/22; closes 2083/05/26 at the earliest and 2083/06/05 at the latest; issue manager NMB Capital Limited.",
  },
  companyProjectReport: {
    id: "companyProjectReport",
    title: "Project report (PDF)",
    publisher: "Beni Hydropower Project Ltd.",
    url: "https://benihydro.com.np/wp-content/uploads/2024/12/beni-hydro-project.pdf",
    kind: "primary",
    verifiedOn: "2026-09-09",
    note: "HTTP 200, application/pdf, about 5.4 MB. Not read in full.",
  },
  sebonLanding: {
    id: "sebonLanding",
    title: "Prospectus — Beni Hydropower Project Limited",
    publisher: "Securities Board of Nepal (SEBON)",
    url: "https://www.sebon.gov.np/prospectus/beni-hydropower-project-limited",
    kind: "regulator",
    verifiedOn: "2026-09-09",
  },
  sebonProspectusPdf: {
    id: "sebonProspectusPdf",
    title: "Approved prospectus (PDF, Nepali, 51 pages)",
    publisher: "Securities Board of Nepal (SEBON)",
    url: "https://www.sebon.gov.np/uploads/2026/03/16/ML5jP2iflc3iq8Q6PrSQ1zFygUQJZJyrNcm511Me.pdf",
    kind: "regulator",
    verifiedOn: "2026-09-09",
    note: "Cover page names BENI HYDROPOWER PROJECT LIMITED, Kathmandu Metropolitan City ward 05, issued capital NPR 1,04,00,00,000, 20% (20,80,000 shares) offered to the public.",
  },
  icra2023: {
    id: "icra2023",
    title: "Beni Hydropower Project Limited: [ICRANP-IR] BB and [ICRANP] LBB/A4 assigned",
    publisher: "ICRA Nepal",
    url: "https://www.icranepal.com/wp-content/uploads/2023/12/A.471-Beni-Hydropower_Fresh-Issuer-Rating-and-Fresh-BLR_Sept-2023-_Final.pdf",
    kind: "rating-agency",
    verifiedOn: "2026-09-09",
    note: "Dated September 27, 2023. Installed 19.8 MW, PPA capacity 18.236 MW, commercial operation from June 16, 2023, design discharge ~12 m3/s at Q40, gross head 182 m, annual saleable energy ~110 GWh at 70% contract PLF, project cost NPR 3,855 million, Tingla substation connection, incorporated November 10, 2006, converted to public limited July 15, 2021.",
  },
  icra2025: {
    id: "icra2025",
    title: "Beni Hydropower Project Limited: Ratings upgraded to [ICRANP-IR] BB+ and [ICRANP] LBB+/A4+",
    publisher: "ICRA Nepal",
    url: "https://www.icranepal.com/wp-content/uploads/2025/02/A.1020-Beni-Hydropower-Project-Limited_Issuer-and-BLR-Surveillance_February-17-2025-_Final.pdf",
    kind: "rating-agency",
    verifiedOn: "2026-09-09",
    note: "Dated February 17, 2025. Generation 82% of contract energy in the twelve months to mid-January 2025 and ~97% in the first half of FY2025; generation licence valid until January 30, 2050.",
  },
  sharesansarIpo: {
    id: "sharesansarIpo",
    title: "IPO for General Public: Beni Hydropower Project Limited to issue 8,63,200 units from today",
    publisher: "ShareSansar",
    url: "https://www.sharesansar.com/newsdetail/ipo-for-general-public-beni-hydropower-project-limited-to-issue-863200-units-ipo-shares-from-today-2026-09-07",
    kind: "news",
    verifiedOn: "2026-09-09",
    note: "Secondary confirmation of the tranche sizes, NPR 100 face value, NMB Capital as issue manager. Reports 18 MW; primary sources state 19.8 MW installed / 18.236 MW PPA.",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/** Facts that were searched for but could not be confirmed from a reliable source; omitted from public copy. */
export const UNVERIFIED_OMISSIONS = [
  "Annual energy actually generated per fiscal year (only contract-energy percentages are published by ICRA).",
  "Environmental or community benefit figures and beneficiary counts.",
  "Current share subscription status, allotment results for the September 2026 public tranche, and any share price beyond the NPR 100 face value.",
  "Official English translations of the prospectus and issue notices (documents are in Nepali).",
  "Approved logo and brand assets (a typographic wordmark is used).",
  "Photographs of the plant, headworks, or powerhouse (a labelled concept illustration is used).",
] as const;
