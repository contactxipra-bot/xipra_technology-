import AboutContent from "@/components/site/AboutContent";
import { getAboutContent } from "@/lib/services/content.service";

// ISR: rendered from cache and regenerated instantly on admin edits via tag
// revalidation (see @/lib/cache). The 1-hour window is only a self-heal fallback.
export const revalidate = 3600;

export default async function AboutPage() {
  const content = await getAboutContent();
  return <AboutContent content={content} />;
}
