// Auto-generated Supabase Database Types for MindfulPath Blog
// Last updated: 2026-07-13

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          color: string;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string;
          color?: string;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          post_count?: number;
          updated_at?: string;
        };
      };
      authors: {
        Row: {
          id: string;
          name: string;
          email: string;
          bio: string | null;
          avatar_url: string | null;
          credentials: string | null;
          twitter_url: string | null;
          linkedin_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          bio?: string | null;
          avatar_url?: string | null;
          credentials?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          bio?: string | null;
          avatar_url?: string | null;
          credentials?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
        };
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          category_id: string | null;
          author_id: string | null;
          tags: string[];
          reading_time: number;
          views_count: number;
          likes_count: number;
          is_featured: boolean;
          status: 'draft' | 'published' | 'scheduled' | 'archived';
          meta_title: string | null;
          meta_description: string | null;
          canonical_url: string | null;
          schema_markup: Json | null;
          published_at: string | null;
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          tags?: string[];
          reading_time?: number;
          views_count?: number;
          likes_count?: number;
          is_featured?: boolean;
          status?: 'draft' | 'published' | 'scheduled' | 'archived';
          meta_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          schema_markup?: Json | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          tags?: string[];
          reading_time?: number;
          views_count?: number;
          likes_count?: number;
          is_featured?: boolean;
          status?: 'draft' | 'published' | 'scheduled' | 'archived';
          meta_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          schema_markup?: Json | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          blog_id: string;
          parent_id: string | null;
          author_name: string;
          author_email: string;
          content: string;
          status: 'pending' | 'approved' | 'spam' | 'deleted';
          ip_address: string | null;
          user_agent: string | null;
          is_admin_reply: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          blog_id: string;
          parent_id?: string | null;
          author_name: string;
          author_email: string;
          content: string;
          status?: 'pending' | 'approved' | 'spam' | 'deleted';
          ip_address?: string | null;
          user_agent?: string | null;
          is_admin_reply?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          status?: 'pending' | 'approved' | 'spam' | 'deleted';
          updated_at?: string;
          is_admin_reply?: boolean;
          parent_id?: string | null;
          blog_id?: string;
          author_name?: string;
          author_email?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          is_active: boolean;
          source: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          is_active?: boolean;
          source?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          is_active?: boolean;
          unsubscribed_at?: string | null;
          email?: string;
          source?: string;
          subscribed_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: 'new' | 'replied' | 'resolved' | 'spam';
          ip_address: string | null;
          replied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: 'new' | 'replied' | 'resolved' | 'spam';
          ip_address?: string | null;
          replied_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'new' | 'replied' | 'resolved' | 'spam';
          replied_at?: string | null;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
        };
      };
      page_views: {
        Row: {
          id: string;
          blog_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          country_code: string | null;
          device_type: string | null;
          session_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          blog_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          country_code?: string | null;
          device_type?: string | null;
          session_id?: string | null;
          viewed_at?: string;
        };
        Update: Record<string, never>;
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      security_logs: {
        Row: {
          id: string;
          ip_address: string;
          email: string | null;
          action: string;
          success: boolean;
          user_agent: string | null;
          country: string | null;
          risk_level: 'low' | 'medium' | 'high';
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_address: string;
          email?: string | null;
          action: string;
          success?: boolean;
          user_agent?: string | null;
          country?: string | null;
          risk_level?: 'low' | 'medium' | 'high';
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          ip_address?: string;
          email?: string | null;
          action?: string;
          success?: boolean;
          user_agent?: string | null;
          country?: string | null;
          risk_level?: 'low' | 'medium' | 'high';
          details?: Json | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types for components
export type BlogRow = Database['public']['Tables']['blogs']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type AuthorRow = Database['public']['Tables']['authors']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type SubscriberRow = Database['public']['Tables']['newsletter_subscribers']['Row'];
export type ContactRow = Database['public']['Tables']['contact_messages']['Row'];

// Blog with relations
export type BlogWithRelations = BlogRow & {
  category: CategoryRow | null;
  author: AuthorRow | null;
};
