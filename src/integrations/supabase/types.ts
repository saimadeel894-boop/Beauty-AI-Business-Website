export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_matches: {
        Row: {
          brand_id: string
          candidate_id: string
          candidate_type: string
          created_at: string
          explanation: string
          id: string
          score: number
        }
        Insert: {
          brand_id: string
          candidate_id: string
          candidate_type: string
          created_at?: string
          explanation: string
          id?: string
          score: number
        }
        Update: {
          brand_id?: string
          candidate_id?: string
          candidate_type?: string
          created_at?: string
          explanation?: string
          id?: string
          score?: number
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          brand_name: string
          created_at: string
          id: string
          industry: string
          ingredient_preferences: string | null
          location: string | null
          pricing_positioning: string | null
          product_category: string | null
          target_market: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string
          id?: string
          industry: string
          ingredient_preferences?: string | null
          location?: string | null
          pricing_positioning?: string | null
          product_category?: string | null
          target_market?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string
          id?: string
          industry?: string
          ingredient_preferences?: string | null
          location?: string | null
          pricing_positioning?: string | null
          product_category?: string | null
          target_market?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_performance: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          created_at: string
          engagement_rate: number | null
          id: string
          impressions: number | null
          influencer_id: string
          revenue: number | null
          spend: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          influencer_id: string
          revenue?: number | null
          spend?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          influencer_id?: string
          revenue?: number | null
          spend?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_performance_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_metrics: {
        Row: {
          affiliate_traffic: number
          campaign_id: string
          clicks: number
          conversions: number
          created_at: string
          id: string
          influencer_id: string
          promo_code_usage: number
          recorded_at: string
          revenue: number
        }
        Insert: {
          affiliate_traffic?: number
          campaign_id: string
          clicks?: number
          conversions?: number
          created_at?: string
          id?: string
          influencer_id: string
          promo_code_usage?: number
          recorded_at?: string
          revenue?: number
        }
        Update: {
          affiliate_traffic?: number
          campaign_id?: string
          clicks?: number
          conversions?: number
          created_at?: string
          id?: string
          influencer_id?: string
          promo_code_usage?: number
          recorded_at?: string
          revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversion_metrics_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_metrics: {
        Row: {
          campaign_id: string
          comments: number
          created_at: string
          id: string
          influencer_id: string
          likes: number
          post_url: string | null
          recorded_at: string
          shares: number
          views: number
        }
        Insert: {
          campaign_id: string
          comments?: number
          created_at?: string
          id?: string
          influencer_id: string
          likes?: number
          post_url?: string | null
          recorded_at?: string
          shares?: number
          views?: number
        }
        Update: {
          campaign_id?: string
          comments?: number
          created_at?: string
          id?: string
          influencer_id?: string
          likes?: number
          post_url?: string | null
          recorded_at?: string
          shares?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "engagement_metrics_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_milestones: {
        Row: {
          amount: number
          approved_at: string | null
          brand_id: string
          contract_id: string
          created_at: string
          description: string | null
          due_date: string | null
          funded_at: string | null
          id: string
          manufacturer_id: string
          milestone_order: number
          released_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          brand_id: string
          contract_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          funded_at?: string | null
          id?: string
          manufacturer_id: string
          milestone_order?: number
          released_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          brand_id?: string
          contract_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          funded_at?: string | null
          id?: string
          manufacturer_id?: string
          milestone_order?: number
          released_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      formulation_analyses: {
        Row: {
          compliance_results: Json | null
          created_at: string
          formulation_text: string
          id: string
          overall_status: string
          parsed_ingredients: Json | null
          product_name: string
          suggestions: Json | null
          target_markets: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          compliance_results?: Json | null
          created_at?: string
          formulation_text: string
          id?: string
          overall_status?: string
          parsed_ingredients?: Json | null
          product_name?: string
          suggestions?: Json | null
          target_markets?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          compliance_results?: Json | null
          created_at?: string
          formulation_text?: string
          id?: string
          overall_status?: string
          parsed_ingredients?: Json | null
          product_name?: string
          suggestions?: Json | null
          target_markets?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      influencer_profiles: {
        Row: {
          audience_geography: Json | null
          created_at: string
          engagement_rate: number | null
          follower_count: number | null
          follower_demographics: Json | null
          id: string
          location: string | null
          name: string
          niche: string | null
          primary_platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_geography?: Json | null
          created_at?: string
          engagement_rate?: number | null
          follower_count?: number | null
          follower_demographics?: Json | null
          id?: string
          location?: string | null
          name: string
          niche?: string | null
          primary_platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_geography?: Json | null
          created_at?: string
          engagement_rate?: number | null
          follower_count?: number | null
          follower_demographics?: Json | null
          id?: string
          location?: string | null
          name?: string
          niche?: string | null
          primary_platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          alternatives: string[] | null
          cas_number: string | null
          category: string
          created_at: string
          description: string | null
          ewg_score: number | null
          functions: string[]
          id: string
          inci_name: string
          max_concentration: Json | null
          name: string
          origin: string | null
          regulatory_status: Json | null
          restrictions: string[] | null
          safety_rating: string
          updated_at: string
        }
        Insert: {
          alternatives?: string[] | null
          cas_number?: string | null
          category?: string
          created_at?: string
          description?: string | null
          ewg_score?: number | null
          functions?: string[]
          id?: string
          inci_name: string
          max_concentration?: Json | null
          name: string
          origin?: string | null
          regulatory_status?: Json | null
          restrictions?: string[] | null
          safety_rating?: string
          updated_at?: string
        }
        Update: {
          alternatives?: string[] | null
          cas_number?: string | null
          category?: string
          created_at?: string
          description?: string | null
          ewg_score?: number | null
          functions?: string[]
          id?: string
          inci_name?: string
          max_concentration?: Json | null
          name?: string
          origin?: string | null
          regulatory_status?: Json | null
          restrictions?: string[] | null
          safety_rating?: string
          updated_at?: string
        }
        Relationships: []
      }
      manufacturer_profiles: {
        Row: {
          categories: string[]
          certifications: string[]
          company_name: string
          created_at: string
          description: string | null
          formulation_expertise: string[] | null
          id: string
          lead_time: string | null
          location: string | null
          moq: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          categories?: string[]
          certifications?: string[]
          company_name: string
          created_at?: string
          description?: string | null
          formulation_expertise?: string[] | null
          id?: string
          lead_time?: string | null
          location?: string | null
          moq?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          categories?: string[]
          certifications?: string[]
          company_name?: string
          created_at?: string
          description?: string | null
          formulation_expertise?: string[] | null
          id?: string
          lead_time?: string | null
          location?: string | null
          moq?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          documents: string[] | null
          id: string
          images: string[] | null
          lead_time: string | null
          manufacturer_id: string
          moq: string | null
          name: string
          price_range: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          images?: string[] | null
          lead_time?: string | null
          manufacturer_id: string
          moq?: string | null
          name: string
          price_range?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          documents?: string[] | null
          id?: string
          images?: string[] | null
          lead_time?: string | null
          manufacturer_id?: string
          moq?: string | null
          name?: string
          price_range?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          profile_completed: boolean
          role: Database["public"]["Enums"]["user_role"] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          profile_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          profile_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rfqs: {
        Row: {
          brand_id: string
          budget: string | null
          category: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          manufacturer_id: string
          quantity: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          manufacturer_id: string
          quantity?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          manufacturer_id?: string
          quantity?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          escrow_status: string
          id: string
          milestone_id: string | null
          net_amount: number
          payer_id: string
          platform_fee: number
          receiver_id: string
          stripe_payment_intent_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          escrow_status?: string
          id?: string
          milestone_id?: string | null
          net_amount?: number
          payer_id: string
          platform_fee?: number
          receiver_id: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          escrow_status?: string
          id?: string
          milestone_id?: string | null
          net_amount?: number
          payer_id?: string
          platform_fee?: number
          receiver_id?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          pending_balance: number
          total_received: number
          total_sent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          pending_balance?: number
          total_received?: number
          total_sent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          pending_balance?: number
          total_received?: number
          total_sent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_role: "manufacturer" | "brand" | "influencer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      user_role: ["manufacturer", "brand", "influencer"],
    },
  },
} as const
