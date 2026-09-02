import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";
import { contactFaqs } from "@/lib/contact-faqs";
import { faqSchema, jsonLdScript } from "@/lib/schema";
import { getResolvedSettings } from "@/lib/settings";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with MindfulPath — questions, blog topic suggestions, or collaboration requests. We respond within 24–48 hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact MindfulPath",
    description: "Questions, suggestions, or collaboration requests — reach out to the MindfulPath team.",
    type: "website",
    url: "/contact",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function ContactPage() {
  const settings = await getResolvedSettings();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(contactFaqs))}
      />
      <ContactPageClient supportEmail={settings.supportEmail} />
    </>
  );
}
