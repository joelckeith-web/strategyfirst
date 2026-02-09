export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          business_name: string;
          website_url: string;
          gbp_url: string | null;
          primary_service_area: string;
          phone: string | null;
          industry: string | null;
          notes: string | null;
          metadata: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          website_url: string;
          gbp_url?: string | null;
          primary_service_area: string;
          phone?: string | null;
          industry?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          website_url?: string;
          gbp_url?: string | null;
          primary_service_area?: string;
          phone?: string | null;
          industry?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          client_id: string;
          label: string;
          city: string;
          state: string;
          service_area: string | null;
          gbp_url: string | null;
          address: string | null;
          zip: string | null;
          phone: string | null;
          is_primary: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          label: string;
          city: string;
          state: string;
          service_area?: string | null;
          gbp_url?: string | null;
          address?: string | null;
          zip?: string | null;
          phone?: string | null;
          is_primary?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          label?: string;
          city?: string;
          state?: string;
          service_area?: string | null;
          gbp_url?: string | null;
          address?: string | null;
          zip?: string | null;
          phone?: string | null;
          is_primary?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      research_results: {
        Row: {
          id: string;
          client_id: string;
          gbp_rating: number | null;
          gbp_review_count: number | null;
          gbp_categories: string[] | null;
          gbp_phone: string | null;
          gbp_address: string | null;
          gbp_hours: Json | null;
          gbp_photos_count: number | null;
          gbp_raw_data: Json | null;
          sitemap_total_pages: number | null;
          sitemap_has_service_pages: boolean | null;
          sitemap_has_blog: boolean | null;
          sitemap_has_location_pages: boolean | null;
          sitemap_page_types: Json | null;
          website_cms: string | null;
          website_has_ssl: boolean | null;
          website_is_mobile_responsive: boolean | null;
          website_has_structured_data: boolean | null;
          website_description: string | null;
          website_schema_types: string[] | null;
          website_raw_data: Json | null;
          competitors: Json | null;
          gbp_status: string;
          sitemap_status: string;
          website_status: string;
          competitors_status: string;
          gbp_error: string | null;
          sitemap_error: string | null;
          website_error: string | null;
          competitors_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          gbp_rating?: number | null;
          gbp_review_count?: number | null;
          gbp_categories?: string[] | null;
          gbp_phone?: string | null;
          gbp_address?: string | null;
          gbp_hours?: Json | null;
          gbp_photos_count?: number | null;
          gbp_raw_data?: Json | null;
          sitemap_total_pages?: number | null;
          sitemap_has_service_pages?: boolean | null;
          sitemap_has_blog?: boolean | null;
          sitemap_has_location_pages?: boolean | null;
          sitemap_page_types?: Json | null;
          website_cms?: string | null;
          website_has_ssl?: boolean | null;
          website_is_mobile_responsive?: boolean | null;
          website_has_structured_data?: boolean | null;
          website_description?: string | null;
          website_schema_types?: string[] | null;
          website_raw_data?: Json | null;
          competitors?: Json | null;
          gbp_status?: string;
          sitemap_status?: string;
          website_status?: string;
          competitors_status?: string;
          gbp_error?: string | null;
          sitemap_error?: string | null;
          website_error?: string | null;
          competitors_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          gbp_rating?: number | null;
          gbp_review_count?: number | null;
          gbp_categories?: string[] | null;
          gbp_phone?: string | null;
          gbp_address?: string | null;
          gbp_hours?: Json | null;
          gbp_photos_count?: number | null;
          gbp_raw_data?: Json | null;
          sitemap_total_pages?: number | null;
          sitemap_has_service_pages?: boolean | null;
          sitemap_has_blog?: boolean | null;
          sitemap_has_location_pages?: boolean | null;
          sitemap_page_types?: Json | null;
          website_cms?: string | null;
          website_has_ssl?: boolean | null;
          website_is_mobile_responsive?: boolean | null;
          website_has_structured_data?: boolean | null;
          website_description?: string | null;
          website_schema_types?: string[] | null;
          website_raw_data?: Json | null;
          competitors?: Json | null;
          gbp_status?: string;
          sitemap_status?: string;
          website_status?: string;
          competitors_status?: string;
          gbp_error?: string | null;
          sitemap_error?: string | null;
          website_error?: string | null;
          competitors_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          client_id: string;
          intake_data: Json;
          results: Json | null;
          status: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          intake_data: Json;
          results?: Json | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          intake_data?: Json;
          results?: Json | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      research_sessions: {
        Row: {
          id: string;
          client_id: string | null;
          location_id: string | null;
          input: Json;
          status: string;
          progress: Json;
          results: Json;
          errors: Json;
          n8n_execution_id: string | null;
          callback_url: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          location_id?: string | null;
          input: Json;
          status?: string;
          progress?: Json;
          results?: Json;
          errors?: Json;
          n8n_execution_id?: string | null;
          callback_url?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          location_id?: string | null;
          input?: Json;
          status?: string;
          progress?: Json;
          results?: Json;
          errors?: Json;
          n8n_execution_id?: string | null;
          callback_url?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Helper types for convenience
export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type Location = Database['public']['Tables']['locations']['Row'];
export type LocationInsert = Database['public']['Tables']['locations']['Insert'];
export type LocationUpdate = Database['public']['Tables']['locations']['Update'];

export type ResearchResults = Database['public']['Tables']['research_results']['Row'];
export type ResearchResultsInsert = Database['public']['Tables']['research_results']['Insert'];
export type ResearchResultsUpdate = Database['public']['Tables']['research_results']['Update'];

export type Analysis = Database['public']['Tables']['analyses']['Row'];
export type AnalysisInsert = Database['public']['Tables']['analyses']['Insert'];
export type AnalysisUpdate = Database['public']['Tables']['analyses']['Update'];

export type ResearchSession = Database['public']['Tables']['research_sessions']['Row'];
export type ResearchSessionInsert = Database['public']['Tables']['research_sessions']['Insert'];
export type ResearchSessionUpdate = Database['public']['Tables']['research_sessions']['Update'];

// Research task status type
export type ResearchStatus = 'pending' | 'running' | 'completed' | 'failed' | 'partial' | 'timeout';

// Combined client with research results
export interface ClientWithResearch extends Client {
  research_results?: ResearchResults;
}

// Client with locations included
export interface ClientWithLocations extends Client {
  locations?: Location[];
}
