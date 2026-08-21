import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/data";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Medical and general disclaimer for content published on MindfulPath.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>
        Disclaimer
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-subtle)" }}>
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose max-w-none space-y-6 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Not medical advice</h2>
        <p>
          The content on {SITE_CONFIG.name} is provided for educational and informational purposes only.
          It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the
          advice of a qualified health provider with any questions you may have regarding a medical or mental
          health condition.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>In an emergency</h2>
        <p>
          If you are in crisis or think you may have an emergency, contact your local emergency services
          immediately. Do not rely on this website for urgent needs.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>No professional relationship</h2>
        <p>
          Reading this website or contacting us does not create a clinician–patient relationship. Views
          expressed in articles are for general guidance and may not apply to your individual circumstances.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>External links</h2>
        <p>
          We may link to third-party websites for convenience. We are not responsible for the content or
          accuracy of any external sites.
        </p>
      </div>
    </div>
  );
}
