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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
          download_url?: string
          duration_seconds?: number | null
          id?: string
          status?: Database["public"]["Enums"]["pack_status"]
        }
        Relationships: []
      }
      album_links: {
        Row: {
          album_id: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          link_url: string
          name: string
        }
        Insert: {
          album_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          link_url: string
          name: string
        }
        Update: {
          album_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          link_url?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_links_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      album_packs: {
        Row: {
          added_at: string | null
          album_id: string
          id: string
          pack_id: string
        }
        Insert: {
          added_at?: string | null
          album_id: string
          id?: string
          pack_id: string
        }
        Update: {
          added_at?: string | null
          album_id?: string
          id?: string
          pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_packs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_packs_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          status: string
          style: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          style?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          style?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      custom_emojis: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          is_active: boolean
          name: string
          shortcode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          shortcode: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          shortcode?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          display_order: number
          icon_name: string | null
          id: string
          is_active: boolean
          placement: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          placement?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          placement?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pack_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          pack_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          pack_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          pack_id?: string
          updated_at?: string
          user_id?: string
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
      pack_reposts: {
        Row: {
          created_at: string
          id: string
          pack_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pack_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pack_id?: string
          user_id?: string
        }
        Relationships: []
      }
      packs: {
        Row: {
          author_name: string | null
          cover_url: string | null
          created_at: string | null
          credit_channel_url: string | null
          deleted_at: string | null
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
          requires_shortener: boolean
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
          deleted_at?: string | null
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
          requires_shortener?: boolean
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
          deleted_at?: string | null
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
          requires_shortener?: boolean
          status?: Database["public"]["Enums"]["pack_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_badge_color: string | null
          artist_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          has_spotify_badge: boolean | null
          id: string
          instagram_url: string | null
          is_banned: boolean | null
          is_online: boolean | null
          last_seen: string | null
          last_username_change_date: string | null
          online_accent_color: string | null
          recovery_keyword: string | null
          soundcloud_url: string | null
          spotify_url: string | null
          status_ring_color: string | null
          theme_accent_color: string | null
          theme_mode: string
          theme_preference: string | null
          thought_bubble: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          username_changes_today: number | null
          verified_badge_color: string | null
          youtube_url: string | null
        }
        Insert: {
          admin_badge_color?: string | null
          artist_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          has_spotify_badge?: boolean | null
          id?: string
          instagram_url?: string | null
          is_banned?: boolean | null
          is_online?: boolean | null
          last_seen?: string | null
          last_username_change_date?: string | null
          online_accent_color?: string | null
          recovery_keyword?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status_ring_color?: string | null
          theme_accent_color?: string | null
          theme_mode?: string
          theme_preference?: string | null
          thought_bubble?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          username_changes_today?: number | null
          verified_badge_color?: string | null
          youtube_url?: string | null
        }
        Update: {
          admin_badge_color?: string | null
          artist_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          has_spotify_badge?: boolean | null
          id?: string
          instagram_url?: string | null
          is_banned?: boolean | null
          is_online?: boolean | null
          last_seen?: string | null
          last_username_change_date?: string | null
          online_accent_color?: string | null
          recovery_keyword?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status_ring_color?: string | null
          theme_accent_color?: string | null
          theme_mode?: string
          theme_preference?: string | null
          thought_bubble?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          username_changes_today?: number | null
          verified_badge_color?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      site_events: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          is_active: boolean
          link_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          site_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          site_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          site_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_icon: string | null
          badge_name: string
          badge_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_inbox: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          pack_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          pack_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          pack_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inbox_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
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
      wishlists: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          request_text: string
          responded_at: string | null
          responded_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          request_text: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          request_text?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: { Args: { target_user_id: string }; Returns: boolean }
      admin_get_user_login: {
        Args: { target_user_id: string }
        Returns: string
      }
      admin_set_user_password: {
        Args: { new_password: string; target_user_id: string }
        Returns: boolean
      }
      delete_my_account: { Args: never; Returns: boolean }
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
      reset_password_with_keyword: {
        Args: { account_email: string; keyword: string; new_password: string }
        Returns: boolean
      }
      send_gift: {
        Args: {
          gift_message?: string
          gift_pack_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      send_gift_to_all: {
        Args: { gift_message?: string; gift_pack_id: string }
        Returns: number
      }
      set_user_ban_status: {
        Args: { ban_status: boolean; target_user_id: string }
        Returns: boolean
      }
      update_online_status: {
        Args: { online_status: boolean }
        Returns: undefined
      }
      update_username: { Args: { new_username: string }; Returns: Json }
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
