import Link from "next/link";
import { Brain, Mail, ArrowRight } from "lucide-react";
import { SITE_CONFIG, CATEGORIES } from "@/lib/data";

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const socialLinks = [
  { Icon: TwitterIcon, href: SITE_CONFIG.social.twitter, label: "X / Twitter" },
  { Icon: LinkedInIcon, href: SITE_CONFIG.social.linkedin, label: "LinkedIn" },
  { Icon: InstagramIcon, href: SITE_CONFIG.social.instagram, label: "Instagram" },
];

const footerNav = {
  "Articles": [
    { label: "All Articles", href: "/blog" },
    { label: "Anxiety", href: "/blog/category/anxiety" },
    { label: "Depression", href: "/blog/category/depression" },
    { label: "Mindfulness", href: "/blog/category/mindfulness" },
    { label: "Self-Care", href: "/blog/category/self-care" },
  ],
  "Company": [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

export default function Footer({
  siteName = "MindfulPath",
}: {
  siteName?: string;
}) {
  return (
    <footer
      className="mt-0"
      style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)" }}
              >
                <Brain className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-semibold text-base" style={{ color: "var(--text)" }}>
                {siteName}
              </span>
            </Link>

            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "var(--text-muted)" }}>
              Evidence-based mental health content written by licensed professionals to help you navigate life's challenges.
            </p>

            {/* Disclaimer */}
            <p className="text-xs leading-relaxed mb-6 p-3 rounded-lg border" style={{ color: "var(--text-subtle)", borderColor: "var(--border)", background: "var(--surface)" }}>
              Content on MindfulPath is for educational purposes only and does not constitute medical advice. Always consult a qualified professional.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--text)" }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-150 hover:text-[var(--accent)]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-subtle)" }}
        >
          <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <span>Made with care for mental health awareness</span>
        </div>
      </div>
    </footer>
  );
}
