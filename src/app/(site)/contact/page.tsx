import ContactPageClient from "@/components/site/ContactPageClient";
import { getSiteSettings } from "@/lib/services/settings.service";

// ISR: rendered from cache and regenerated instantly on admin edits via tag
// revalidation (see @/lib/cache). The 1-hour window is only a self-heal fallback.
export const revalidate = 3600;

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <ContactPageClient
      settings={{
        phones: (settings.phones as string[] | null) ?? [],
        emails: (settings.emails as string[] | null) ?? [],
        addresses: (settings.addresses as string[] | null) ?? [],
        businessHours: settings.businessHours ?? "",
        whatsappNumber: settings.whatsappNumber ?? "",
        googleMapUrl: settings.googleMapUrl ?? "",
      }}
    />
  );
}
