import { CinematicSection } from "@/components/cinematic/CinematicSection";
import {
  ContactSection,
  DocumentsSection,
  HighlightsSection,
  InvestorsSection,
  ProjectSection,
  SourcesSection,
} from "@/components/site/DocumentSections";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ProjectGallery } from "@/components/site/ProjectGallery";

export default function Home() {
  return (
    <>
      <div className="relative">
        <SiteHeader />
        <CinematicSection />
      </div>
      <main id="main" tabIndex={-1} className="outline-none">
        <ProjectSection />
        <HighlightsSection />
        <InvestorsSection />
        <DocumentsSection />
        <ProjectGallery />
        <ContactSection />
        <SourcesSection />
      </main>
      <SiteFooter />
    </>
  );
}
