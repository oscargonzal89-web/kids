export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          relationship: string | null
          tone: string
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          relationship?: string | null
          tone?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          relationship?: string | null
          tone?: string
          created_at?: string
        }
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          nickname: string | null
          birthdate: string | null
          avatar_url: string | null
          favorites: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          nickname?: string | null
          birthdate?: string | null
          avatar_url?: string | null
          favorites?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          nickname?: string | null
          birthdate?: string | null
          avatar_url?: string | null
          favorites?: Json
          created_at?: string
        }
      }
      family_context: {
        Row: {
          id: string
          user_id: string
          home_type: string | null
          city: string | null
          climate: string | null
          pets: Json
          sleep_time: string | null
          meal_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          home_type?: string | null
          city?: string | null
          climate?: string | null
          pets?: Json
          sleep_time?: string | null
          meal_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          home_type?: string | null
          city?: string | null
          climate?: string | null
          pets?: Json
          sleep_time?: string | null
          meal_time?: string | null
          created_at?: string
        }
      }
      explore_plans: {
        Row: {
          id: string
          title: string
          description: string | null
          age_min_months: number
          age_max_months: number | null
          city: string | null
          climate: string | null
          category: string | null
          duration_minutes: number | null
          cost_level: string | null
          location_type: string | null
          is_active: boolean
          created_at: string
        }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      explore_plan_interactions: {
        Row: {
          id: string
          user_id: string
          child_id: string
          plan_id: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          child_id: string
          title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          child_id: string
          role: string
          content: string
          meta: Json | null
          created_at: string
        }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
      child_memory_facts: {
        Row: {
          id: string
          user_id: string
          child_id: string
          key: string
          value: string
          source: string | null
          confidence: number | null
          meta: Json | null
          created_at: string
          updated_at: string
        }
        Insert: { [key: string]: unknown }
        Update: { [key: string]: unknown }
      }
    }
    Views: { [key: string]: never }
    Functions: { [key: string]: never }
    Enums: { [key: string]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
