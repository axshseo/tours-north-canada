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
      pending_bookings: {
        Row: {
          lock_id: string
          experience_id: string
          slot_id: string
          expires_at: string
          checkout_state: Json
          created_at: string
        }
        Insert: {
          lock_id?: string
          experience_id: string
          slot_id: string
          expires_at: string
          checkout_state: Json
          created_at?: string
        }
        Update: {
          lock_id?: string
          experience_id?: string
          slot_id?: string
          expires_at?: string
          checkout_state?: Json
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          type: string
        }
      }
      regions: {
        Row: {
          id: string
          name: string
          type: string
          description: string | null
        }
      }
      inventory_calendar: {
        Row: {
          id: string
          date: string
          is_blocked: boolean
          spots_remaining: number
        }
      }
    }
    Views: {
      mv_experience_details: {
        Row: {
          experience_id: string
          media_url: string | null
          rating_avg: number | null
          rating_count: number | null
          starting_price: number | null
          next_available_date: string | null
          title: string | null
          description: string | null
          spots_remaining: number | null
          is_verified: boolean | null
          category_name: string | null
          city_name: string | null
        }
      }
      merchant_dashboard_payout_summary: {
        Row: {
          merchant_id: string
          total_revenue: number
          pending_payouts: number
          completed_bookings: number
          upcoming_bookings: number
        }
      }
      merchant_dashboard_recent_bookings: {
        Row: {
          booking_id: string
          merchant_id: string
          guest_name: string
          experience_title: string
          date: string
          status: string
          checked_in: boolean
        }
      }
    }
    Functions: {
      get_seo_landing_page: {
        Args: {
          p_slug: string
        }
        Returns: {
          page_type: 'hub' | 'tour'
          seo_meta: {
            title: string
            description: string
            canonical: string
          }
          tours: Database['public']['Views']['mv_experience_details']['Row'][]
          hub_content?: {
            title: string
            description: string
          }
        }
      }
      acquire_slot_lock: {
        Args: {
          p_experience_id: string
          p_slot_id: string
        }
        Returns: {
          lock_id: string
          expires_at: string
        }
      }
      confirm_booking_payment: {
        Args: {
          p_lock_id: string
          p_payment_intent_id: string
        }
        Returns: {
          success: boolean
          message?: string
        }
      }
      check_in_guest: {
        Args: {
          p_booking_id: string
        }
        Returns: {
          success: boolean
        }
      }
      get_dynamic_price: {
        Args: {
          p_experience_id: string
        }
        Returns: {
          price: number
          currency: string
        }
      }
    }
  }
}
