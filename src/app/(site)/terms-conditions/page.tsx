import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getSiteSettings } from "@/lib/services/settings.service";

export const metadata = {
  title: "Terms & Conditions | Xipra Technology",
  description: "The terms that govern your use of the Xipra Technology website.",
};

function firstOf(value: unknown): string | null {
  return Array.isArray(value) && typeof value[0] === "string" ? value[0] : null;
}

export default async function TermsConditionsPage() {
  const settings = await getSiteSettings();
  const companyName = settings.companyName || "Xipra Technology";
  const contactEmail = firstOf(settings.emails) || process.env.COMPANY_EMAIL || "info@xipratechnology.com";
  const updatedDate = new Date(settings.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <article className="container mx-auto px-6 relative z-10 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <FileText className="w-3.5 h-3.5" /> Terms &amp; Conditions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-foreground/50">Last updated: {updatedDate}</p>
        </header>

        <div className="space-y-10 text-foreground/70 leading-relaxed">
          <p>
            These terms govern your use of this website, operated by {companyName}. By using this website, you
            agree to these terms.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Use of This Website</h2>
            <p>
              You may browse this website and use the contact, internship application, and certificate
              verification forms for their intended purposes. You agree not to submit false information, attempt
              to disrupt the website&apos;s operation, or use automated tools to scrape or abuse these forms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Intellectual Property</h2>
            <p>
              All content on this website — including text, graphics, logos, and the products and portfolio work
              shown here — is the property of {companyName} or its respective owners, and may not be reproduced
              without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Certificate Verification</h2>
            <p>
              Certificates issued by {companyName} can be verified through this website using the certificate
              number. A &quot;verified&quot; result confirms the certificate exists in our records at the time of
              the check; it does not constitute an endorsement of the holder beyond the credential described on
              the certificate itself. We reserve the right to revoke a certificate at our discretion, at which
              point it will no longer verify as active.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Internship Applications</h2>
            <p>
              Submitting an internship application does not guarantee acceptance into the program. We review
              applications at our discretion and will contact shortlisted candidates using the details provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">No Warranty</h2>
            <p>
              This website and its content are provided &quot;as is&quot;, without warranties of any kind, express
              or implied. We do not guarantee that the website will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, {companyName} shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Changes to These Terms</h2>
            <p>
              We may revise these terms from time to time. The &quot;Last updated&quot; date above reflects the
              most recent revision. Continued use of the website after a change constitutes acceptance of the
              revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Contact Us</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                {contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
