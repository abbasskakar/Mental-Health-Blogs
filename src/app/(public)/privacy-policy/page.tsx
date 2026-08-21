import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MindfulPath collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>
        Privacy Policy
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-subtle)" }}>
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose max-w-none space-y-6 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        <p>
          This Privacy Policy explains how {SITE_CONFIG.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects,
          uses, and safeguards information when you use our website. This is a starter template —
          replace it with policy text reviewed for your jurisdiction before going live.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Information we collect</h2>
        <p>
          When you subscribe to our newsletter, submit a comment, or send a contact message, we collect
          the information you provide (such as your name and email address). We also collect basic,
          non-identifying analytics about how pages are used.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>How we use it</h2>
        <p>
          We use this information to respond to your messages, send the newsletter you requested, moderate
          comments, and improve our content. We do not sell your personal information.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Your choices</h2>
        <p>
          You can unsubscribe from the newsletter at any time using the link in any email. To request access
          to or deletion of your data, contact us via the{" "}
          <a href="/contact" className="text-accent hover:underline">contact page</a>.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Contact</h2>
        <p>
          Questions about this policy? Reach us through our{" "}
          <a href="/contact" className="text-accent hover:underline">contact page</a>.
        </p>
      </div>
    </div>
  );
}
