import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env.local'
  );
}

// ── Type definitions ──────────────────────────────────────────────────────

export interface CakePhoto {
  id: string;
  created_at: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  occasion_tag: string | null;
  display_order: number;
  is_visible: boolean;
  uploaded_at: string;
}

export interface BusinessSetting {
  key: string;
  value: string;
  label: string | null;
  updated_at: string;
}

export interface Enquiry {
  id?: string;
  created_at?: string;
  name: string;
  phone: string;
  email?: string | null;
  occasion?: string | null;
  celebration_date?: string | null;
  message?: string | null;
  status?: string;
  admin_notes?: string | null;
  replied_at?: string | null;
}

export interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      cake_photos: {
        Row: {
          id: string;
          created_at: string;
          storage_path: string;
          public_url: string;
          alt_text: string | null;
          occasion_tag: string | null;
          display_order: number;
          is_visible: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          storage_path: string;
          public_url: string;
          alt_text?: string | null;
          occasion_tag?: string | null;
          display_order?: number;
          is_visible?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          storage_path?: string;
          public_url?: string;
          alt_text?: string | null;
          occasion_tag?: string | null;
          display_order?: number;
          is_visible?: boolean;
          uploaded_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          key: string;
          value: string;
          label: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          label?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          label?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          phone: string;
          email: string | null;
          occasion: string | null;
          celebration_date: string | null;
          message: string | null;
          status: string;
          admin_notes: string | null;
          replied_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          phone: string;
          email?: string | null;
          occasion?: string | null;
          celebration_date?: string | null;
          message?: string | null;
          status?: string;
          admin_notes?: string | null;
          replied_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          occasion?: string | null;
          celebration_date?: string | null;
          message?: string | null;
          status?: string;
          admin_notes?: string | null;
          replied_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ── Singleton client ──────────────────────────────────────────────────────

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
