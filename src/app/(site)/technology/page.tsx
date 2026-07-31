import TechnologyContent from "@/components/site/TechnologyContent";
import { getPublicTechnologyTree } from "@/lib/services/public-catalog.service";

// ISR: rendered from cache and regenerated instantly on admin edits via tag
// revalidation (see @/lib/cache). The 1-hour window is only a self-heal fallback.
export const revalidate = 3600;

export default async function TechnologyPage() {
  const categories = await getPublicTechnologyTree();
  return <TechnologyContent categories={categories} />;
}
