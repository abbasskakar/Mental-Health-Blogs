export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: Category;
  tags: string[];
  author: Author;
  reading_time: number;
  views_count: number;
  published_at: string;
  updated_at: string;
  is_featured: boolean;
  is_sticky?: boolean;
  status?: "draft" | "published" | "scheduled" | "archived";
  scheduled_at?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  keywords?: string[];
  canonical_url?: string;
  og_image?: string;
  faq?: FAQ[];
  table_of_contents?: TOCItem[];
  has_medical_disclaimer?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  meta_title?: string;
  meta_description?: string;
  parent_id?: string;
}

export interface Author {
  name: string;
  bio?: string;
  avatar?: string;
  credentials?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface Comment {
  id: string;
  blog_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  status: "pending" | "approved" | "spam" | "deleted";
  parent_id?: string;
  created_at: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  subscribed_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "replied" | "resolved" | "spam";
  created_at: string;
}

export interface AnalyticsEvent {
  blog_id?: string;
  session_id: string;
  device_type: "mobile" | "desktop" | "tablet";
  browser?: string;
  country?: string;
  referrer?: string;
  traffic_source?: "google" | "direct" | "social" | "email";
  page_url: string;
  time_spent?: number;
  is_bounce?: boolean;
}

export interface SecurityLog {
  id: string;
  ip_address: string;
  email?: string;
  action: string;
  success?: boolean;
  risk_level?: "low" | "medium" | "high";
  user_agent?: string;
  country?: string;
  created_at: string;
}

export interface Redirect {
  id: string;
  from_url: string;
  to_url: string;
  redirect_type: 301 | 302;
  is_active: boolean;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  description: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  footer_text?: string;
  about_content?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_facebook?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
}

export interface DashboardStats {
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  scheduled_blogs: number;
  total_visitors: number;
  today_visitors: number;
  total_views: number;
  active_visitors: number;
  bounce_rate: number;
  avg_time_on_site: number;
  total_subscribers: number;
  total_comments: number;
  pending_comments: number;
  total_messages: number;
}
