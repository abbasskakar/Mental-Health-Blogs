import type { Metadata } from "next";
import Link from "next/link";
import { Award, Heart, BookOpen, Shield, Users, ArrowRight, CheckCircle, FileText } from "lucide-react";
import { getSiteStats, getAuthors } from "@/lib/supabase/queries";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { slugify } from "@/lib/utils";
import { jsonLdScript, personSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about RegulatedSelf — our mission to provide evidence-based mental health guidance written by licensed professionals.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Shield, title: "Evidence-Based", desc: "Every article is grounded in peer-reviewed research and clinical expertise." },
  { icon: Heart, title: "Compassionate", desc: "We write with empathy, understanding that mental health journeys are deeply personal." },
  { icon: BookOpen, title: "Educational", desc: "Our goal is to empower you with knowledge, not replace professional care." },
  { icon: Users, title: "Inclusive", desc: "Mental health affects everyone. Our content is accessible and culturally sensitive." },
];

export const revalidate = 60;

export default async function AboutPage() {
  const [siteStats, authors] = await Promise.all([getSiteStats(), getAuthors()]);
  const stats = [
    { label: "Articles Published", value: `${siteStats.articles}` },
    { label: "Topics Covered", value: `${siteStats.topics}` },
    { label: "Expert Authors", value: `${siteStats.authors}` },
    { label: "Evidence-Based", value: "100%" },
  ];
  const authorsSchema = {
    "@context": "https://schema.org",
    "@graph": authors.map((a) =>
      personSchema({
        name: a.name,
        bio: a.bio ?? undefined,
        credentials: a.credentials ?? undefined,
        avatarUrl: a.avatar_url,
        twitterUrl: a.twitter_url,
        linkedinUrl: a.linkedin_url,
      })
    ),
  };

  return (
    <div>
      {authors.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(authorsSchema)} />
      )}
      {/* Hero */}
      <section className="relative pt-6 sm:pt-20 pb-20 border-b border-line overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-subtle border border-line text-accent text-sm font-medium mb-6">
            <Heart className="w-3.5 h-3.5 fill-accent" /> Our Story
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mb-6 leading-tight sm:leading-tight text-balance mx-auto">
            Helping You Navigate{" "}
            <span className="gradient-text">Mental Wellness</span>{" "}
            with Clarity
          </h1>
          <p className="text-lg text-body leading-relaxed max-w-2xl mx-auto">
            RegulatedSelf was founded with a single mission: to make evidence-based mental health information accessible to everyone. No jargon. No judgment. Just clear, compassionate guidance.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-surface-alt border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-faint mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-accent uppercase tracking-wide">Our Mission</span>
            <h2 className="text-3xl font-bold text-heading mt-2 mb-5">
              Breaking Down Barriers to Mental Health Knowledge
            </h2>
            <p className="text-body leading-relaxed mb-4">
              Mental health is still stigmatized in many communities. We believe that access to clear, accurate information is the first step toward healing. That&apos;s why we hold every article on RegulatedSelf to the same standard.
            </p>
          </div>
          <div className="card p-8">
            <h3 className="font-bold text-heading mb-5">Every article is:</h3>
            <ul className="space-y-4">
              {["Written by mental health professionals", "Reviewed for medical accuracy", "Based on the latest clinical research", "Free and accessible to all readers"].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-body text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Authors */}
      {authors.length > 0 && (
        <section id="authors" className="pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-accent uppercase tracking-wide">The People Behind the Articles</span>
            <h2 className="text-3xl font-bold text-heading mt-2">Meet Our Authors</h2>
          </div>
          <div className={authors.length === 1 ? "max-w-md mx-auto" : "grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"}>
            {authors.map((a) => (
              <article
                key={a.id}
                id={slugify(a.name)}
                className="card p-8 text-center flex flex-col items-center scroll-mt-24 transition-shadow target:ring-2 target:ring-accent"
              >
                <AuthorAvatar name={a.name} src={a.avatar_url} className="w-20 h-20 rounded-2xl text-3xl mb-4" />
                <h3 className="text-xl font-bold text-heading">{a.name}</h3>
                {a.credentials && <p className="text-accent text-sm font-medium mt-1">{a.credentials}</p>}
                {a.bio && <p className="text-body text-sm leading-relaxed mt-4">{a.bio}</p>}
                <div className="flex flex-wrap justify-center items-center gap-2 mt-auto pt-5">
                  {a.post_count > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt text-faint text-xs font-medium">
                      <FileText className="w-3.5 h-3.5" /> {a.post_count} {a.post_count === 1 ? "article" : "articles"}
                    </span>
                  )}
                  {a.linkedin_url && (
                    <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-surface-alt text-body text-xs font-medium hover:bg-accent-subtle hover:text-accent transition-colors">LinkedIn</a>
                  )}
                  {a.twitter_url && (
                    <a href={a.twitter_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-surface-alt text-body text-xs font-medium hover:bg-accent-subtle hover:text-accent transition-colors">X / Twitter</a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Values */}
      <section className="py-16 bg-surface-alt border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-accent uppercase tracking-wide">What We Stand For</span>
            <h2 className="text-3xl font-bold text-heading mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent-subtle flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-heading mb-2">{title}</h3>
                <p className="text-sm text-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
          <Award className="w-8 h-8 text-amber-600 mx-auto mb-3" />
          <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-2">Important Disclaimer</h3>
          <p className="text-sm text-amber-700 dark:text-amber-500 leading-relaxed">
            The content on RegulatedSelf is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified mental health provider with any questions you may have.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-heading mb-4">Ready to Start Your Wellness Journey?</h2>
        <p className="text-body mb-6">Explore our evidence-based articles on mental health and wellbeing.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white font-semibold shadow-soft-lg hover:scale-105 transition-all duration-200">
          Explore Articles <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
