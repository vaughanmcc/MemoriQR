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
          referral_code: string | null
          referral_discount: number | null
          partner_commission_id: string | null
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
          referral_code?: string | null
          referral_discount?: number | null
          partner_commission_id?: string | null
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
          referral_code?: string | null
          referral_discount?: number | null
          partner_commission_id?: string | null
        }
      }
      partners: {
        Row: {
          id: string
          partner_name: string | null
          business_name: string | null
          contact_name: string | null
          email: string | null
          phone: string | null
          partner_type: string
          contact_email: string | null
          contact_phone: string | null
          address: Json | null
          commission_rate: number
          api_key: string | null
          is_active: boolean
          status: string | null
          website: string | null
          application_message: Json | null
          approved_at: string | null
          rejected_at: string | null
          suspended_reason: string | null
          suspended_at: string | null
          default_discount_percent: number | null
          default_commission_percent: number | null
          default_free_shipping: boolean | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          payout_email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          partner_name?: string | null
          business_name?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          partner_type?: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          commission_rate?: number
          api_key?: string | null
          is_active?: boolean
          status?: string | null
          website?: string | null
          application_message?: Json | null
          approved_at?: string | null
          rejected_at?: string | null
          suspended_reason?: string | null
          suspended_at?: string | null
          default_discount_percent?: number | null
          default_commission_percent?: number | null
          default_free_shipping?: boolean | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          payout_email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          partner_name?: string | null
          business_name?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          partner_type?: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          commission_rate?: number
          api_key?: string | null
          is_active?: boolean
          status?: string | null
          website?: string | null
          application_message?: Json | null
          approved_at?: string | null
          rejected_at?: string | null
          suspended_reason?: string | null
          suspended_at?: string | null
          default_discount_percent?: number | null
          default_commission_percent?: number | null
          default_free_shipping?: boolean | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          payout_email?: string | null
          created_at?: string
        }
      }
      referral_codes: {
        Row: {
          id: string
          code: string
          partner_id: string
          batch_id: string | null
          batch_name: string | null
          discount_percent: number
          commission_percent: number
          free_shipping: boolean
          is_used: boolean
          used_at: string | null
          order_id: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          partner_id: string
          batch_id?: string | null
          batch_name?: string | null
          discount_percent?: number
          commission_percent?: number
          free_shipping?: boolean
          is_used?: boolean
          used_at?: string | null
          order_id?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          partner_id?: string
          batch_id?: string | null
          batch_name?: string | null
          discount_percent?: number
          commission_percent?: number
          free_shipping?: boolean
          is_used?: boolean
          used_at?: string | null
          order_id?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      partner_commissions: {
        Row: {
          id: string
          partner_id: string
          // Original activation-based fields (migration 005)
          activation_code: string | null
          memorial_id: string | null
          order_value: number
          commission_rate: number
          // New referral-based fields (migration 010)
          referral_code_id: string | null
          order_id: string | null
          order_total: number | null
          discount_amount: number | null
          commission_percent: number | null
          // Common fields
          commission_amount: number
          status: 'pending' | 'approved' | 'paid' | 'cancelled'
          payout_id: string | null
          payout_reference: string | null
          earned_at: string
          approved_at: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          // Original activation-based fields
          activation_code?: string | null
          memorial_id?: string | null
          order_value?: number
          commission_rate?: number
          // New referral-based fields
          referral_code_id?: string | null
          order_id?: string | null
          order_total?: number | null
          discount_amount?: number | null
          commission_percent?: number | null
          // Common fields
          commission_amount: number
          status?: 'pending' | 'approved' | 'paid' | 'cancelled'
          payout_id?: string | null
          payout_reference?: string | null
          earned_at?: string
          approved_at?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          activation_code?: string | null
          memorial_id?: string | null
          order_value?: number
          commission_rate?: number
          referral_code_id?: string | null
          order_id?: string | null
          order_total?: number | null
          discount_amount?: number | null
          commission_percent?: number | null
          commission_amount?: number
          status?: 'pending' | 'approved' | 'paid' | 'cancelled'
          payout_id?: string | null
          payout_reference?: string | null
          earned_at?: string
          approved_at?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      retail_activation_codes: {
        Row: {
          activation_code: string
          memorial_id: string | null
          partner_id: string | null
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25 | null
          is_used: boolean
          used_at: string | null
          created_at: string
          expires_at: string | null
          variant_code: string | null
          retail_price: number | null
          batch_id: string | null
        }
        Insert: {
          activation_code: string
          memorial_id?: string | null
          partner_id?: string | null
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration?: 5 | 10 | 25 | null
          is_used?: boolean
          used_at?: string | null
          created_at?: string
          expires_at?: string | null
          variant_code?: string | null
          retail_price?: number | null
          batch_id?: string | null
        }
        Update: {
          activation_code?: string
          memorial_id?: string | null
          partner_id?: string | null
          product_type?: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration?: 5 | 10 | 25 | null
          is_used?: boolean
          used_at?: string | null
          created_at?: string
          expires_at?: string | null
          variant_code?: string | null
          retail_price?: number | null
          batch_id?: string | null
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
      referral_code_activity_log: {
        Row: {
          id: string
          referral_code_id: string | null
          code: string
          activity_type: 'created' | 'transferred' | 'used' | 'expired'
          performed_by_partner_id: string | null
          performed_by_admin: boolean
          from_partner_id: string | null
          to_partner_id: string | null
          from_partner_name: string | null
          to_partner_name: string | null
          notes: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          referral_code_id?: string | null
          code: string
          activity_type: 'created' | 'transferred' | 'used' | 'expired'
          performed_by_partner_id?: string | null
          performed_by_admin?: boolean
          from_partner_id?: string | null
          to_partner_id?: string | null
          from_partner_name?: string | null
          to_partner_name?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          referral_code_id?: string | null
          code?: string
          activity_type?: 'created' | 'transferred' | 'used' | 'expired'
          performed_by_partner_id?: string | null
          performed_by_admin?: boolean
          from_partner_id?: string | null
          to_partner_id?: string | null
          from_partner_name?: string | null
          to_partner_name?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      activation_code_activity_log: {
        Row: {
          id: string
          activation_code_id: string | null
          code: string
          activity_type: 'created' | 'assigned' | 'unassigned' | 'transferred' | 'used'
          performed_by_partner_id: string | null
          performed_by_admin: boolean
          from_partner_id: string | null
          to_partner_id: string | null
          from_partner_name: string | null
          to_partner_name: string | null
          notes: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          activation_code_id?: string | null
          code: string
          activity_type: 'created' | 'assigned' | 'unassigned' | 'transferred' | 'used'
          performed_by_partner_id?: string | null
          performed_by_admin?: boolean
          from_partner_id?: string | null
          to_partner_id?: string | null
          from_partner_name?: string | null
          to_partner_name?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          activation_code_id?: string | null
          code?: string
          activity_type?: 'created' | 'assigned' | 'unassigned' | 'transferred' | 'used'
          performed_by_partner_id?: string | null
          performed_by_admin?: boolean
          from_partner_id?: string | null
          to_partner_id?: string | null
          from_partner_name?: string | null
          to_partner_name?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
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
      code_batches: {
        Row: {
          id: string
          partner_id: string
          batch_number: string
          quantity: number
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25 | null
          unit_cost: number
          total_cost: number
          status: 'pending' | 'approved' | 'generated' | 'shipped' | 'cancelled'
          requested_at: string
          approved_at: string | null
          generated_at: string | null
          shipped_at: string | null
          notes: string | null
          created_at: string
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          partner_id: string
          batch_number: string
          quantity: number
          product_type: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration: 5 | 10 | 25 | null
          unit_cost: number
          total_cost: number
          status?: 'pending' | 'approved' | 'generated' | 'shipped' | 'cancelled'
          requested_at?: string
          approved_at?: string | null
          generated_at?: string | null
          shipped_at?: string | null
          notes?: string | null
          created_at?: string
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          partner_id?: string
          batch_number?: string
          quantity?: number
          product_type?: 'nfc_only' | 'qr_only' | 'both'
          hosting_duration?: 5 | 10 | 25 | null
          unit_cost?: number
          total_cost?: number
          status?: 'pending' | 'approved' | 'generated' | 'shipped' | 'cancelled'
          requested_at?: string
          approved_at?: string | null
          generated_at?: string | null
          shipped_at?: string | null
          notes?: string | null
          created_at?: string
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
        }
      }
      partner_payouts: {
        Row: {
          id: string
          partner_id: string
          payout_number: string
          period_start: string
          period_end: string
          total_activations: number
          total_order_value: number
          total_commission: number
          status: 'pending' | 'processing' | 'paid' | 'failed'
          payment_method: string | null
          payment_reference: string | null
          notes: string | null
          created_at: string
          processed_at: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          partner_id: string
          payout_number: string
          period_start: string
          period_end: string
          total_activations?: number
          total_order_value?: number
          total_commission?: number
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          processed_at?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          partner_id?: string
          payout_number?: string
          period_start?: string
          period_end?: string
          total_activations?: number
          total_order_value?: number
          total_commission?: number
          status?: 'pending' | 'processing' | 'paid' | 'failed'
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          created_at?: string
          processed_at?: string | null
          paid_at?: string | null
        }
      }
      partner_sessions: {
        Row: {
          id: string
          partner_id: string
          session_token: string
          expires_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          session_token: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          session_token?: string
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      partner_login_codes: {
        Row: {
          id: string
          partner_id: string
          code: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          code: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          code?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
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
      partner_stats: {
        Row: {
          partner_id: string
          partner_name: string
          commission_rate: number
          total_codes: number
          used_codes: number
          available_codes: number
          total_earned: number
          pending_commission: number
          paid_commission: number
        }
      }
      monthly_commission_summary: {
        Row: {
          partner_id: string
          month: string
          activations: number
          total_order_value: number
          total_commission: number
          pending: number
          paid: number
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
export type CodeBatch = Database['public']['Tables']['code_batches']['Row']
export type PartnerCommission = Database['public']['Tables']['partner_commissions']['Row']
export type PartnerPayout = Database['public']['Tables']['partner_payouts']['Row']
export type PartnerSession = Database['public']['Tables']['partner_sessions']['Row']
export type PartnerLoginCode = Database['public']['Tables']['partner_login_codes']['Row']
export type PartnerStats = Database['public']['Views']['partner_stats']['Row']
export type MonthlyCommissionSummary = Database['public']['Views']['monthly_commission_summary']['Row']

export type HostingDuration = 5 | 10 | 25
export type ProductType = 'nfc_only' | 'qr_only' | 'both'
export type DeceasedType = 'pet' | 'human'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
export type UpgradeType = 'storage' | 'tier_upgrade'
export type BatchStatus = 'pending' | 'approved' | 'generated' | 'shipped' | 'cancelled'
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled'
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'
