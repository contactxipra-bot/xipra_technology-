import PortfolioContent from "@/components/site/PortfolioContent";
import { getPublicPortfolioProjects } from "@/lib/services/public-catalog.service";

// ISR: rendered from cache and regenerated instantly on admin edits via tag
// revalidation (see @/lib/cache). The 1-hour window is only a self-heal fallback.
export const revalidate = 3600;

export default async function PortfolioPage() {
  const projects = await getPublicPortfolioProjects();
  return <PortfolioContent projects={projects} />;
}
