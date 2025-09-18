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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          description: string | null
          id: string
          incident_type: string
          latitude: number
          longitude: number
          reported_at: string
          reporter_id: string | null
          resolved_at: string | null
          severity: number | null
          status: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          incident_type: string
          latitude: number
          longitude: number
          reported_at?: string
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: number | null
          status?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          incident_type?: string
          latitude?: number
          longitude?: number
          reported_at?: string
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: number | null
          status?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string | null
          amenities: string[] | null
          created_at: string
          description: string | null
          id: string
          is_open: boolean | null
          latitude: number
          longitude: number
          name: string
          opening_hours: Json | null
          phone: string | null
          rating: number | null
          type: string
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_open?: boolean | null
          latitude: number
          longitude: number
          name: string
          opening_hours?: Json | null
          phone?: string | null
          rating?: number | null
          type: string
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_open?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          rating?: number | null
          type?: string
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      safety_zones: {
        Row: {
          active: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          radius_meters: number
          risk_level: number | null
          updated_at: string
          verified: boolean | null
          zone_type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          radius_meters?: number
          risk_level?: number | null
          updated_at?: string
          verified?: boolean | null
          zone_type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          radius_meters?: number
          risk_level?: number | null
          updated_at?: string
          verified?: boolean | null
          zone_type?: string
        }
        Relationships: []
      }
      Travel: {
        Row: {
          Sneha: number
          "snehajawla67@gmail.com": number
        }
        Insert: {
          Sneha?: number
          "snehajawla67@gmail.com": number
        }
        Update: {
          Sneha?: number
          "snehajawla67@gmail.com"?: number
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          accuracy_meters: number | null
          address: string | null
          id: string
          is_emergency: boolean | null
          latitude: number
          longitude: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          address?: string | null
          id?: string
          is_emergency?: boolean | null
          latitude: number
          longitude: number
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          address?: string | null
          id?: string
          is_emergency?: boolean | null
          latitude?: number
          longitude?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_media: {
        Row: {
          caption: string | null
          created_at: string
          file_path: string
          id: string
          is_emergency: boolean | null
          is_public: boolean | null
          latitude: number | null
          longitude: number | null
          media_type: string
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_path: string
          id?: string
          is_emergency?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          media_type: string
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_path?: string
          id?: string
          is_emergency?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          media_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_area_safety: {
        Args: { check_lat: number; check_lon: number; radius_meters?: number }
        Returns: {
          overall_safety_score: number
          recent_incidents: Json
          risk_zones: Json
        }[]
      }
      get_nearby_places: {
        Args: {
          place_type?: string
          radius_meters?: number
          user_lat: number
          user_lon: number
        }
        Returns: {
          address: string
          distance_meters: number
          id: string
          is_open: boolean
          latitude: number
          longitude: number
          name: string
          phone: string
          rating: number
          type: string
        }[]
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
    Enums: {},
  },
} as const
