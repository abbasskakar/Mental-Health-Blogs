/**
 * JSON-LD structured data builders (schema.org).
 * Rendered inside <script type="application/ld+json"> on the server so the
 * markup is in the initial HTML that crawlers read.
 */
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SOCIAL_LINKS,
  absoluteUrl,
} from '@/lib/site';

const sameAs = Object.values(SOCIAL_LINKS);

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/icon'),
    description: SITE_DESCRIPTION,
    sameAs,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface BlogPostingInput {
  title: string;
  slug: string;
  excerpt: string;
  canonicalUrl: string;
  image?: string | null;
  publishedAt: string;
  updatedAt: string;
  tags?: string[];
  categoryName?: string;
  author?: {
    name: string;
    bio?: string;
    credentials?: string;
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
  } | null;
}

export function blogPostingSchema(b: BlogPostingInput) {
  const authorSameAs = [b.author?.twitterUrl, b.author?.linkedinUrl].filter(
    Boolean
  ) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': b.canonicalUrl },
    headline: b.title,
    description: b.excerpt,
    image: b.image ? [b.image] : undefined,
    datePublished: b.publishedAt,
    dateModified: b.updatedAt,
    keywords: b.tags && b.tags.length ? b.tags.join(', ') : undefined,
    articleSection: b.categoryName,
    author: b.author
      ? {
          '@type': 'Person',
          name: b.author.name,
          description: b.author.bio || undefined,
          jobTitle: b.author.credentials || undefined,
          ...(authorSameAs.length ? { sameAs: authorSameAs } : {}),
        }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/icon') },
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * Extract FAQ question/answer pairs from a blog's HTML content, if it contains
 * a "Frequently Asked Questions" section (h2) with h3 questions + p answers.
 * Used to emit FAQPage JSON-LD for eligible posts.
 */
export function extractFaqs(html: string): { question: string; answer: string }[] {
  if (!html) return [];
  const start = html.search(/<h2[^>]*>\s*Frequently Asked Questions\s*<\/h2>/i);
  if (start === -1) return [];
  let section = html.slice(start);
  const nextH2 = section.slice(1).search(/<h2[^>]*>/i);
  if (nextH2 !== -1) section = section.slice(0, nextH2 + 1);

  const faqs: { question: string; answer: string }[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    const question = m[1].replace(/<[^>]*>/g, "").trim();
    const answer = m[2].replace(/<[^>]*>/g, "").trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

/**
 * Small helper component-free renderer for a JSON-LD script tag string.
 * Escapes `<` so no string value (title, bio, stored schema_markup) can break
 * out of the <script> tag (XSS hardening).
 */
export function jsonLdScript(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
