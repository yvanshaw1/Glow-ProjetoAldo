import { AboutSection } from "@/components/portal/catalog/about-section";
import { HeroSection } from "@/components/portal/catalog/hero-section";
import { LocationSection } from "@/components/portal/catalog/location-section";

// UC01, step 2: the highlight with the shortcuts to create an account and to
// sign in, the institutional section and the location (RF001, RF002); the
// header and the footer come from the portal layout.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <LocationSection />
    </>
  );
}
