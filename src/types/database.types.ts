export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = 'draft' | 'published';
export type InquiryStatus = 'unread' | 'read' | 'replied';

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: number;
          brand_name: string;
          hero_greeting: string;
          hero_title: string;
          hero_subtitle: string;
          hero_description: string;
          hero_image_url: string | null;
          about_label: string;
          about_heading: string;
          about_description: string;
          contact_email: string | null;
          whatsapp_number: string | null;
          github_url: string | null;
          cta_url: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          brand_name?: string;
          hero_greeting?: string;
          hero_title?: string;
          hero_subtitle?: string;
          hero_description?: string;
          hero_image_url?: string | null;
          about_label?: string;
          about_heading?: string;
          about_description?: string;
          contact_email?: string | null;
          whatsapp_number?: string | null;
          github_url?: string | null;
          cta_url?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          brand_name?: string;
          hero_greeting?: string;
          hero_title?: string;
          hero_subtitle?: string;
          hero_description?: string;
          hero_image_url?: string | null;
          about_label?: string;
          about_heading?: string;
          about_description?: string;
          contact_email?: string | null;
          whatsapp_number?: string | null;
          github_url?: string | null;
          cta_url?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          number_label: string;
          title: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          number_label: string;
          title: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          number_label?: string;
          title?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          website_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          website_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          website_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          client_name: string | null;
          summary: string | null;
          content: string | null;
          thumbnail_url: string;
          gallery_urls: string[];
          tech_stack: string[];
          project_url: string | null;
          github_url: string | null;
          apk_url: string | null;
          is_featured: boolean;
          status: ProjectStatus;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          client_name?: string | null;
          summary?: string | null;
          content?: string | null;
          thumbnail_url: string;
          gallery_urls?: string[];
          tech_stack?: string[];
          project_url?: string | null;
          github_url?: string | null;
          apk_url?: string | null;
          is_featured?: boolean;
          status?: ProjectStatus;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          client_name?: string | null;
          summary?: string | null;
          content?: string | null;
          thumbnail_url?: string;
          gallery_urls?: string[];
          tech_stack?: string[];
          project_url?: string | null;
          github_url?: string | null;
          apk_url?: string | null;
          is_featured?: boolean;
          status?: ProjectStatus;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          status: InquiryStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: InquiryStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          status?: InquiryStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      project_status: ProjectStatus;
      inquiry_status: InquiryStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type SiteSettings = Tables<'site_settings'>;
export type SiteSettingsInsert = TablesInsert<'site_settings'>;
export type SiteSettingsUpdate = TablesUpdate<'site_settings'>;

export type Service = Tables<'services'>;
export type ServiceInsert = TablesInsert<'services'>;
export type ServiceUpdate = TablesUpdate<'services'>;

export type Brand = Tables<'brands'>;
export type BrandInsert = TablesInsert<'brands'>;
export type BrandUpdate = TablesUpdate<'brands'>;

export type Project = Tables<'projects'>;
/** Lightweight project row for list views (excludes the heavy Markdown `content`). */
export type ProjectSummary = Omit<Project, 'content'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export type Inquiry = Tables<'inquiries'>;
export type InquiryInsert = TablesInsert<'inquiries'>;
export type InquiryUpdate = TablesUpdate<'inquiries'>;
