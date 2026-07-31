import Link from "next/link";
import { Home, Info, LayoutPanelTop, Pencil, ExternalLink } from "lucide-react";

const PAGES = [
  {
    key: "home",
    label: "Home Page",
    description: "Hero, statistics, services, why-choose-us, technology, products, portfolio, internship, and CTA sections.",
    icon: Home,
    editHref: "/admin/content/home",
    viewHref: "/",
  },
  {
    key: "about",
    label: "About Page",
    description: "Introduction, mission, vision, journey timeline, and achievements.",
    icon: Info,
    editHref: "/admin/content/about",
    viewHref: "/about",
  },
  {
    key: "footer",
    label: "Footer",
    description: "Brand tagline, copyright text, and the footer link columns.",
    icon: LayoutPanelTop,
    editHref: "/admin/content/footer",
    viewHref: "/",
  },
];

export default function ContentHubPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Page Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit the content of your public website pages. Design and layout stay the same — you only change the words and images.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAGES.map(({ key, label, description, icon: Icon, editHref, viewHref }) => (
          <div key={key} className="glass-panel rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{label}</h2>
            </div>
            <p className="text-sm text-muted-foreground flex-1 mb-4">{description}</p>
            <div className="flex items-center gap-2">
              <Link
                href={editHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Pencil className="w-4 h-4" /> Edit content
              </Link>
              <Link
                href={viewHref}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View page
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
