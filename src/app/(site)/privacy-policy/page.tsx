import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getSiteSettings } from "@/lib/services/settings.service";

export const metadata = {
  title: "Privacy Policy | Xipra Technology",
  description: "How Xipra Technology collects, uses, and protects your information.",
};

function firstOf(value: unknown): string | null {
  return Array.isArray(value) && typeof value[0] === "string" ? value[0] : null;
}

export default async function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-foreground/50">Last updated: {updatedDate}</p>
        </header>

        <div className="space-y-10 text-foreground/70 leading-relaxed">
          <p>
            {companyName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This policy
            explains what information we collect through this website, how we use it, and the choices you have.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Information We Collect</h2>
            <p className="mb-3">We collect information you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Submit the contact form (name, email, phone, message)</li>
              <li>Apply for an internship (name, email, phone, education, and related application details)</li>
              <li>Verify a certificate (the certificate number you enter)</li>
            </ul>
            <p className="mt-3">
              We do not require account registration to use this website, and we do not knowingly collect
              information from anyone under the age of 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>To respond to inquiries submitted through the contact form</li>
              <li>To review and process internship applications</li>
              <li>To verify and issue certificates, and to maintain a record of certificate validity</li>
              <li>To improve the content and functionality of this website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Data Storage &amp; Security</h2>
            <p>
              Form submissions and certificate records are stored in a secured database. Uploaded files (such as
              certificate documents) are kept in access-controlled cloud storage. We apply reasonable technical
              safeguards to protect your information, but no method of electronic storage or transmission is
              completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Cookies</h2>
            <p>
              This website uses a minimal, functional cookie to keep administrators signed in to the admin panel.
              We do not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Sharing of Information</h2>
            <p>
              We do not sell your personal information. We only share information with service providers that
              help us operate this website — such as our cloud database and storage provider, and our email
              delivery provider — solely to the extent necessary to provide the service you requested.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of the personal information you&apos;ve
              submitted to us by contacting us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. The &quot;Last updated&quot; date at the top of this
              page reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Contact Us</h2>
            <p>
              Questions about this policy can be sent to{" "}
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
