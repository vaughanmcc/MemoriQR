export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      edit_verification_codes: {
        Row: {
          id: string
          memorial_id: string
          code: string
          email: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          memorial_id: string
          code: string
          email: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          memorial_id?: string
          code?: string
          email?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          shipping_address: Json | null
          stripe_customer_id: string | null
          created_at: string
          customer_type: 'direct' | 'retail'
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          shipping_address?: Json
          stripe_customer_id?: string | null
          created_at?: string
          customer_type?: 'direct' | 'retail'
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          shipping_address?: Json
          stripe_customer_id?: string | null
          created_at?: string
          customer_type?: 'direct' | 'retail'
        }
      }
      memorial_records: {
        Row: {
          id: string
          customer_id: string | null
          memorial_slug: string
          deceased_name: string
          deceased_type: 'pet' | 'human'
          species: string | null
          birth_date: string | null
          death_date: string | null
          memorial_text: string | null
          photos_json: Json
          videos_json: Json
          is_published: boolean
          hosting_duration: 5 | 10 | 25
          product_type: 'nfc_only' | 'qr_only' | 'both'
          base_price: number
          order_date: string
          hosting_expires_at: string
          renewal_status: 'active' | 'expired' | 'renewed'
          is_hosting_active: boolean
          days_until_expiry: number
          views_count: number
          last_viewed: string | null
          theme: string
          frame: string
          edit_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          memorial_slug: string
          deceased_name: string
          deceased_type?: 'pet' | 'human'
          species?: string | null
          birth_date?: string | null
          death_date?: string | null
          memorial_text?: string | null
          photos_json?: Json
          videos_json?: Json
          is_published?: boolean
          hosting_duration: 5 | 10 | 25
          product_type: 'nfc_only' | 'qr_only' | 'both'
          base_price: number
          order_date?: string
          hosting_expires_at: string
          renewal_status?: 'active' | 'expired' | 'renewed'
          views_count?: number
          last_viewed?: string | null
          theme?: string
          frame?: string
          edit_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          memorial_slug?: string
          deceased_name?: string
          deceased_type?: 'pet' | 'human'
          species?: string | null
          birth_date?: string | null
          death_date?: string | null
          memorial_text?: string | null
          photos_json?: Json
          videos_json?: Json
          is_published?: boolean
          hosting_duration?: 5 | 10 | 25
          product_type?: 'nfc_only' | 'qr_only' | 'both'
          base_price?: number
          order_date?: string
          hosting_expires_at?: string
          renewal_status?: 'active' | 'expired' | 'renewed'
          views_count?: number
          last_viewed?: string | null
          theme?: string
          frame?: string
          edit_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          memorial_id: string | null
          order_number: string
          order_type: 'online' | 'retail_activation'
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25
          total_amount: number
          stripe_payment_id: string | null
          stripe_session_id: string | null
          order_status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          engraving_text: string | null
          qr_code_url: string | null
          nfc_tag_id: string | null
          tracking_number: string | null
          shipping_carrier: string | null
          notes: string | null
          created_at: string
          paid_at: string | null
          shipped_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          memorial_id?: string | null
          order_number: string
          order_type?: 'online' | 'retail_activation'
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25
          total_amount: number
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          order_status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          engraving_text?: string | null
          qr_code_url?: string | null
          nfc_tag_id?: string | null
          tracking_number?: string | null
          shipping_carrier?: string | null
          notes?: string | null
          created_at?: string
          paid_at?: string | null
          shipped_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          memorial_id?: string | null
          order_number?: string
          order_type?: 'online' | 'retail_activation'
          product_type?: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration?: 5 | 10 | 25
          total_amount?: number
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          order_status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          engraving_text?: string | null
          qr_code_url?: string | null
          nfc_tag_id?: string | null
          tracking_number?: string | null
          shipping_carrier?: string | null
          notes?: string | null
          created_at?: string
          paid_at?: string | null
          shipped_at?: string | null
          completed_at?: string | null
        }
      }
      partners: {
        Row: {
          id: string
          partner_name: string
          partner_type: 'vet' | 'crematorium' | 'funeral_home' | 'pet_store'
          contact_email: string | null
          contact_phone: string | null
          address: Json | null
          commission_rate: number
          api_key: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          partner_name: string
          partner_type: 'vet' | 'crematorium' | 'funeral_home' | 'pet_store'
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          commission_rate?: number
          api_key?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          partner_name?: string
          partner_type?: 'vet' | 'crematorium' | 'funeral_home' | 'pet_store'
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          commission_rate?: number
          api_key?: string
          is_active?: boolean
          created_at?: string
        }
      }
      retail_activation_codes: {
        Row: {
          activation_code: string
          memorial_id: string | null
          partner_id: string | null
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25
          is_used: boolean
          used_at: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          activation_code: string
          memorial_id?: string | null
          partner_id?: string | null
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25
          is_used?: boolean
          used_at?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          activation_code?: string
          memorial_id?: string | null
          partner_id?: string | null
          product_type?: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration?: 5 | 10 | 25
          is_used?: boolean
          used_at?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      supplier_orders: {
        Row: {
          id: string
          order_id: string
          supplier_name: 'Metal Image NZ' | 'Seritag' | 'Other'
          order_details: Json | null
          supplier_status: 'pending' | 'sent' | 'in_production' | 'shipped' | 'received'
          cost: number | null
          supplier_order_ref: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          supplier_name: 'Metal Image NZ' | 'Seritag' | 'Other'
          order_details?: Json | null
          supplier_status?: 'pending' | 'sent' | 'in_production' | 'shipped' | 'received'
          cost?: number | null
          supplier_order_ref?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          supplier_name?: 'Metal Image NZ' | 'Seritag' | 'Other'
          order_details?: Json | null
          supplier_status?: 'pending' | 'sent' | 'in_production' | 'shipped' | 'received'
          cost?: number | null
          supplier_order_ref?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      activity_log: {
        Row: {
          id: string
          memorial_id: string
          activity_type: 'created' | 'viewed' | 'updated' | 'renewal_reminder' | 'expired' | 'renewed' | 'published' | 'upgraded'
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          memorial_id: string
          activity_type: 'created' | 'viewed' | 'updated' | 'renewal_reminder' | 'expired' | 'renewed' | 'published' | 'upgraded'
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          memorial_id?: string
          activity_type?: 'created' | 'viewed' | 'updated' | 'renewal_reminder' | 'expired' | 'renewed' | 'published' | 'upgraded'
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      pricing_history: {
        Row: {
          id: string
          hosting_duration: 5 | 10 | 25
          product_type: 'nfc_only' | 'qr_only' | 'both'
          price: number
          currency: string
          effective_from: string
          effective_to: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hosting_duration: 5 | 10 | 25
          product_type: 'nfc_only' | 'qr_only' | 'both'
          price: number
          currency?: string
          effective_from?: string
          effective_to?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hosting_duration?: 5 | 10 | 25
          product_type?: 'nfc_only' | 'qr_only' | 'both'
          price?: number
          currency?: string
          effective_from?: string
          effective_to?: string | null
          created_at?: string
        }
      }
      memorial_upgrades: {
        Row: {
          id: string
          memorial_id: string
          upgrade_type: 'storage' | 'tier_upgrade'
          additional_photos: number
          additional_videos: number
          previous_tier: number | null
          new_tier: number | null
          upgrade_fee: number
          stripe_payment_id: string | null
          purchased_at: string
        }
        Insert: {
          id?: string
          memorial_id: string
          upgrade_type: 'storage' | 'tier_upgrade'
          additional_photos?: number
          additional_videos?: number
          previous_tier?: number | null
          new_tier?: number | null
          upgrade_fee: number
          stripe_payment_id?: string | null
          purchased_at?: string
        }
        Update: {
          id?: string
          memorial_id?: string
          upgrade_type?: 'storage' | 'tier_upgrade'
          additional_photos?: number
          additional_videos?: number
          previous_tier?: number | null
          new_tier?: number | null
          upgrade_fee?: number
          stripe_payment_id?: string | null
          purchased_at?: string
        }
      }
    }
    Views: {
      current_pricing: {
        Row: {
          hosting_duration: 5 | 10 | 25
          product_type: 'nfc_only' | 'qr_only' | 'both'
          price: number
          currency: string
        }
      }
    }
    Functions: {
      generate_memorial_slug: {
        Args: { name: string }
        Returns: string
      }
      generate_activation_code: {
        Args: Record<string, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      increment_memorial_views: {
        Args: { slug: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Customer = Database['public']['Tables']['customers']['Row']
export type Memorial = Database['public']['Tables']['memorial_records']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Partner = Database['public']['Tables']['partners']['Row']
export type ActivationCode = Database['public']['Tables']['retail_activation_codes']['Row']
export type SupplierOrder = Database['public']['Tables']['supplier_orders']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
export type Pricing = Database['public']['Tables']['pricing_history']['Row']
export type CurrentPricing = Database['public']['Views']['current_pricing']['Row']
export type MemorialUpgrade = Database['public']['Tables']['memorial_upgrades']['Row']

export type HostingDuration = 5 | 10 | 25
export type ProductType = 'nfc_only' | 'qr_only' | 'both'
export type DeceasedType = 'pet' | 'human'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
export type UpgradeType = 'storage' | 'tier_upgrade'
