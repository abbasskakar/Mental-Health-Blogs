// Placeholder data for Phase 1 Design

export const SITE_CONFIG = {
  name: "MindfulPath",
  tagline: "Your Guide to Mental Wellness",
  description:
    "Evidence-based mental health articles to help you navigate anxiety, depression, stress, and emotional wellbeing.",
  url: "https://mindfulpath.com",
  author: {
    name: "Dr. Sarah Mitchell",
    bio: "Licensed Clinical Psychologist with 10+ years of experience in cognitive behavioral therapy and mindfulness-based interventions.",
    avatar: "/images/author-avatar.jpg",
    credentials: "Ph.D., Licensed Clinical Psychologist",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
    },
  },
  social: {
    twitter: "https://twitter.com/mindfulpath",
    linkedin: "https://linkedin.com/company/mindfulpath",
    instagram: "https://instagram.com/mindfulpath",
    facebook: "https://facebook.com/mindfulpath",
  },
};

export const CATEGORIES = [
  { id: "1", name: "Anxiety", slug: "anxiety", color: "#0D9488", icon: "Wind" },
  { id: "2", name: "Depression", slug: "depression", color: "#3B82F6", icon: "CloudRain" },
  { id: "3", name: "Stress", slug: "stress", color: "#8B5CF6", icon: "Activity" },
  { id: "4", name: "Mindfulness", slug: "mindfulness", color: "#059669", icon: "Leaf" },
  { id: "5", name: "Relationships", slug: "relationships", color: "#EC4899", icon: "Users" },
  { id: "6", name: "Self-Care", slug: "self-care", color: "#F59E0B", icon: "Heart" },
  { id: "7", name: "Therapy", slug: "therapy", color: "#0EA5E9", icon: "MessageCircle" },
  { id: "8", name: "Trauma", slug: "trauma", color: "#6366F1", icon: "Shield" },
];

export const SAMPLE_BLOGS = [
  {
    id: "1",
    title: "Understanding Anxiety: Signs, Symptoms, and Coping Strategies",
    slug: "understanding-anxiety-signs-symptoms-coping",
    excerpt:
      "Anxiety affects millions worldwide. Learn how to recognize the signs, understand the root causes, and discover evidence-based strategies to reclaim your peace of mind.",
    content: "",
    featured_image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    category: { id: "1", name: "Anxiety", slug: "anxiety", color: "#4ade80" },
    tags: ["anxiety", "mental health", "coping strategies"],
    author: { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: 8,
    views_count: 12400,
    published_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
    is_featured: true,
    meta_title: "Understanding Anxiety: Signs, Symptoms & Coping Strategies",
    meta_description: "Learn about anxiety signs, symptoms, and evidence-based coping strategies.",
  },
  {
    id: "2",
    title: "5 Mindfulness Techniques That Actually Work for Depression",
    slug: "mindfulness-techniques-for-depression",
    excerpt:
      "Research-backed mindfulness practices specifically designed to help with depressive episodes. Practical exercises you can start today.",
    content: "",
    featured_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    category: { id: "4", name: "Mindfulness", slug: "mindfulness", color: "#34d399" },
    tags: ["mindfulness", "depression", "meditation"],
    author: { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: 6,
    views_count: 9800,
    published_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-25T10:00:00Z",
    is_featured: true,
    meta_title: "5 Mindfulness Techniques for Depression",
    meta_description: "Research-backed mindfulness practices to help with depression.",
  },
  {
    id: "3",
    title: "How to Set Healthy Boundaries Without Feeling Guilty",
    slug: "set-healthy-boundaries-without-guilt",
    excerpt:
      "Setting boundaries is an act of self-love, not selfishness. Discover why boundaries are essential for mental health and how to establish them effectively.",
    content: "",
    featured_image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80",
    category: { id: "5", name: "Relationships", slug: "relationships", color: "#f472b6" },
    tags: ["boundaries", "relationships", "self-care"],
    author: { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: 7,
    views_count: 15200,
    published_at: "2024-01-25T10:00:00Z",
    updated_at: "2024-01-28T10:00:00Z",
    is_featured: true,
    meta_title: "How to Set Healthy Boundaries Without Guilt",
    meta_description: "Learn how to set healthy boundaries for better mental health.",
  },
  {
    id: "4",
    title: "The Science of Stress: Why Your Brain Reacts the Way It Does",
    slug: "science-of-stress-brain-reaction",
    excerpt:
      "Understanding the neurological basis of stress responses can help you manage them more effectively. A deep dive into cortisol, the amygdala, and your nervous system.",
    content: "",
    featured_image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    category: { id: "3", name: "Stress", slug: "stress", color: "#a78bfa" },
    tags: ["stress", "neuroscience", "cortisol"],
    author: { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: 10,
    views_count: 8300,
    published_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-05T10:00:00Z",
    is_featured: false,
    meta_title: "The Science of Stress: Brain & Nervous System",
    meta_description: "Understand the neuroscience behind stress and how to manage it.",
  },
  {
    id: "5",
    title: "Cognitive Behavioral Therapy (CBT): A Beginner's Complete Guide",
    slug: "cognitive-behavioral-therapy-beginners-guide",
    excerpt:
      "CBT is one of the most effective treatments for mental health conditions. Learn what it is, how it works, and whether it might be right for you.",
    content: "",
    featured_image: "https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&q=80",
    category: { id: "7", name: "Therapy", slug: "therapy", color: "#38bdf8" },
    tags: ["CBT", "therapy", "mental health treatment"],
    author: { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: 12,
    views_count: 21000,
    published_at: "2024-02-05T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z",
    is_featured: false,
    meta_title: "Cognitive Behavioral Therapy (CBT): Complete Beginner's Guide",
    meta_description: "Learn everything about CBT therapy - what it is, how it works, and its benefits.",
  },
  {
    id: "6",
    title: "Digital Detox: How to Reclaim Your Mental Health from Social Media",
    slug: "digital-detox-mental-health-social-media",
    excerpt:
      "Social media can significantly impact your mental health. Discover practical strategies for a healthy digital detox and rebuilding a mindful relationship with technology.",
    content: "",
    featured_image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    category: { id: "6", name: "Self-Care", slug: "self-care", color: "#fb923c" },
    tags: ["digital detox", "social media", "self-care"],
    author: { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: 9,
    views_count: 18700,
    published_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
    is_featured: false,
    meta_title: "Digital Detox: Reclaim Your Mental Health from Social Media",
    meta_description: "Practical strategies for digital detox and mindful technology use.",
  },
];

export const SAMPLE_BLOG_CONTENT = `
<h2>What is Anxiety?</h2>
<p>Anxiety is a natural human response to stress and perceived threats. It's your body's built-in alarm system—a survival mechanism that has kept humans safe for thousands of years. However, when anxiety becomes chronic or disproportionate to the actual threat, it can significantly impact your quality of life.</p>

<p>According to the World Health Organization, anxiety disorders affect over 264 million people worldwide, making them the most common mental health conditions globally.</p>

<h2>Common Signs and Symptoms</h2>
<p>Anxiety manifests differently in different people, but common signs include:</p>
<ul>
  <li><strong>Physical symptoms:</strong> Racing heart, shortness of breath, muscle tension, headaches, digestive issues</li>
  <li><strong>Emotional symptoms:</strong> Excessive worry, irritability, feeling on edge, difficulty concentrating</li>
  <li><strong>Behavioral symptoms:</strong> Avoidance of triggers, social withdrawal, sleep disturbances</li>
</ul>

<h2>Evidence-Based Coping Strategies</h2>
<p>The good news is that anxiety is highly treatable. Here are strategies supported by clinical research:</p>

<h3>1. Diaphragmatic Breathing</h3>
<p>Deep belly breathing activates your parasympathetic nervous system, counteracting the stress response. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8.</p>

<h3>2. Progressive Muscle Relaxation</h3>
<p>Systematically tensing and releasing muscle groups helps release physical tension associated with anxiety.</p>

<h3>3. Cognitive Restructuring</h3>
<p>Challenge anxious thoughts by examining the evidence for and against them. Ask yourself: "Is this thought realistic? What's the actual probability of this happening?"</p>

<h2>When to Seek Professional Help</h2>
<p>If anxiety is interfering with your daily life, relationships, or work, it's important to seek professional support. A licensed therapist or psychologist can provide personalized treatment, which may include CBT, medication, or a combination of approaches.</p>
`;

export const FAQ_DATA = [
  {
    question: "What is the difference between anxiety and anxiety disorder?",
    answer: "Regular anxiety is a temporary response to stress, while an anxiety disorder involves persistent, excessive worry that interferes with daily life and lasts for months.",
  },
  {
    question: "Can anxiety be cured completely?",
    answer: "Anxiety disorders are highly manageable. Many people experience significant improvement or complete remission with proper treatment including therapy and/or medication.",
  },
  {
    question: "How long does therapy for anxiety take?",
    answer: "CBT for anxiety typically takes 12-20 sessions over 3-5 months, though this varies based on severity and individual factors.",
  },
  {
    question: "Are there natural remedies for anxiety?",
    answer: "Exercise, mindfulness meditation, adequate sleep, and reducing caffeine can help manage mild anxiety. However, for anxiety disorders, professional treatment is recommended.",
  },
];

export const HOMEPAGE_STATS = [
  { label: "Articles Published", value: "150+" },
  { label: "Monthly Readers", value: "50K+" },
  { label: "Expert Authors", value: "12" },
  { label: "Topics Covered", value: "30+" },
];
