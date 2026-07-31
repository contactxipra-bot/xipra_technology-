import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import ServicesSection from "@/components/home/ServicesSection";
import { getHomeContent } from "@/lib/services/content.service";
import {
  getPublicProducts,
  getPublicPortfolioProjects,
  getPublicTechnologyTree,
} from "@/lib/services/public-catalog.service";

// These were lazily imported via next/dynamic to keep them out of the initial
// client bundle. They are Server Components now — they ship no client
// JavaScript at all — so there is nothing left to defer, and a plain import
// avoids the extra lazy boundary.
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import TechnologyPreview from "@/components/home/TechnologyPreview";
import ProductsPreview from "@/components/home/ProductsPreview";
import PortfolioPreview from "@/components/home/PortfolioPreview";
import InternshipPreview from "@/components/home/InternshipPreview";
import CtaSection from "@/components/home/CtaSection";

// ISR: rendered from cache and regenerated instantly on admin edits via tag
// revalidation (see @/lib/cache). The 1-hour window is only a self-heal fallback.
export const revalidate = 3600;

export default async function Home() {
  const [home, products, portfolioProjects, technologyCategories] = await Promise.all([
    getHomeContent(),
    getPublicProducts(),
    getPublicPortfolioProjects(),
    getPublicTechnologyTree(),
  ]);

  return (
    <>
      <HeroSection content={home.hero} />
      <StatisticsSection stats={home.stats} />
      <ServicesSection content={home.services} />
      <WhyChooseUsSection content={home.whyChooseUs} />
      <TechnologyPreview content={home.technologyPreview} categories={technologyCategories} />
      <ProductsPreview content={home.productsPreview} products={products} />
      <PortfolioPreview content={home.portfolioPreview} projects={portfolioProjects} />
      <InternshipPreview content={home.internshipPreview} />
      <CtaSection content={home.cta} />
    </>
  );
}
