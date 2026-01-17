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
      acapellas: {
        Row: {
          artist_name: string
          audio_url: string
          created_at: string | null
          created_by: string | null
          download_url: string
          duration_seconds: number | null
          id: string
          status: Database["public"]["Enums"]["pack_status"]
        }
        Insert: {
          artist_name: string
          audio_url: string
          created_at?: string | null
          created_by?: string | null
          download_url: string
          duration_seconds?: number | null
          id?: string
          status?: Database["public"]["Enums"]["pack_status"]
        }
        Update: {
          artist_name?: string
          audio_url?: string
          created_at?: string | null
          created_by?: string | null
          download_url?: string
          duration_seconds?: number | null
          id?: string
          status?: Database["public"]["Enums"]["pack_status"]
        }
        Relationships: []
      }
      pack_downloads: {
        Row: {
          id: string
          pack_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          pack_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          pack_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_downloads_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_favorites: {
        Row: {
          created_at: string | null
          id: string
          pack_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pack_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pack_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_favorites_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_likes: {
        Row: {
          created_at: string | null
          id: string
          pack_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pack_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pack_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_likes_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          author_name: string | null
          cover_url: string | null
          created_at: string | null
          credit_channel_url: string | null
          download_url: string
          id: string
          is_admin_pack: boolean | null
          is_anonymous: boolean | null
          is_exclusive: boolean | null
          is_pinned: boolean | null
          is_premium: boolean | null
          likes_count: number | null
          pack_type: Database["public"]["Enums"]["pack_type"] | null
          price: number | null
          status: Database["public"]["Enums"]["pack_status"] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          cover_url?: string | null
          created_at?: string | null
          credit_channel_url?: string | null
          download_url: string
          id?: string
          is_admin_pack?: boolean | null
          is_anonymous?: boolean | null
          is_exclusive?: boolean | null
          is_pinned?: boolean | null
          is_premium?: boolean | null
          likes_count?: number | null
          pack_type?: Database["public"]["Enums"]["pack_type"] | null
          price?: number | null
          status?: Database["public"]["Enums"]["pack_status"] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          cover_url?: string | null
          created_at?: string | null
          credit_channel_url?: string | null
          download_url?: string
          id?: string
          is_admin_pack?: boolean | null
          is_anonymous?: boolean | null
          is_exclusive?: boolean | null
          is_pinned?: boolean | null
          is_premium?: boolean | null
          likes_count?: number | null
          pack_type?: Database["public"]["Enums"]["pack_type"] | null
          price?: number | null
          status?: Database["public"]["Enums"]["pack_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_name: string | null
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          artist_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          artist_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      is_admin: { Args: never; Returns: boolean }
      promote_to_admin: {
        Args: { admin_password: string; user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      pack_status: "pending" | "approved" | "rejected"
      pack_type:
        | "samples"
        | "presets"
        | "drumkit"
        | "loops"
        | "project"
        | "other"
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
      app_role: ["admin", "user"],
      pack_status: ["pending", "approved", "rejected"],
      pack_type: ["samples", "presets", "drumkit", "loops", "project", "other"],
    },
  },
} as const
