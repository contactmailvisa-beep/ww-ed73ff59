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
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      command_cooldowns: {
        Row: {
          command: string
          id: string
          last_used: string | null
          server_id: string
          user_id: string
        }
        Insert: {
          command: string
          id?: string
          last_used?: string | null
          server_id: string
          user_id: string
        }
        Update: {
          command?: string
          id?: string
          last_used?: string | null
          server_id?: string
          user_id?: string
        }
        Relationships: []
      }
      command_shortcuts: {
        Row: {
          command: string
          created_at: string | null
          created_by: string
          enabled: boolean | null
          id: string
          server_id: string
          shortcut: string
          updated_at: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          created_by: string
          enabled?: boolean | null
          id?: string
          server_id: string
          shortcut: string
          updated_at?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          created_by?: string
          enabled?: boolean | null
          id?: string
          server_id?: string
          shortcut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "command_shortcuts_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "discord_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_hearts: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_hearts_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      console_logs: {
        Row: {
          id: string
          log_type: string
          message: string
          project_id: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          log_type: string
          message: string
          project_id: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          log_type?: string
          message?: string
          project_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "console_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      discord_profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          credits: number | null
          discriminator: string | null
          email: string | null
          id: string
          level: number | null
          rank: number | null
          reputation: number | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          credits?: number | null
          discriminator?: string | null
          email?: string | null
          id: string
          level?: number | null
          rank?: number | null
          reputation?: number | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          credits?: number | null
          discriminator?: string | null
          email?: string | null
          id?: string
          level?: number | null
          rank?: number | null
          reputation?: number | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
      discord_servers: {
        Row: {
          added_at: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          added_at?: string | null
          created_at?: string | null
          icon?: string | null
          id: string
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          added_at?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      file_modifications: {
        Row: {
          created_at: string
          file_id: string
          file_name: string
          file_path: string
          id: string
          modification_type: string
          new_content: string | null
          old_content: string | null
          old_name: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          file_id: string
          file_name: string
          file_path: string
          id?: string
          modification_type: string
          new_content?: string | null
          old_content?: string | null
          old_name?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          file_id?: string
          file_name?: string
          file_path?: string
          id?: string
          modification_type?: string
          new_content?: string | null
          old_content?: string | null
          old_name?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_modifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_requests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          status: string
          to_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          status?: string
          to_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          status?: string
          to_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_read: boolean | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payer_email: string | null
          payment_id: string | null
          payment_method: string | null
          profile_data: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payer_email?: string | null
          payment_id?: string | null
          payment_method?: string | null
          profile_data: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payer_email?: string | null
          payment_id?: string | null
          payment_method?: string | null
          profile_data?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_comments: {
        Row: {
          content: string
          created_at: string | null
          dislikes_count: number | null
          hearts_count: number | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          parent_id: string | null
          profile_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          dislikes_count?: number | null
          hearts_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          profile_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          dislikes_count?: number | null
          hearts_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          profile_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profile_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_projects: {
        Row: {
          avatar_url: string | null
          background_type: string
          background_value: string
          buttons: Json
          created_at: string
          description: string
          footer_text: string
          id: string
          is_verified: boolean | null
          project_id: string
          style_type: string
          title: string
          total_views: number | null
          updated_at: string
          user_id: string
          username: string
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_type: string
          background_value: string
          buttons?: Json
          created_at?: string
          description?: string
          footer_text?: string
          id?: string
          is_verified?: boolean | null
          project_id: string
          style_type: string
          title?: string
          total_views?: number | null
          updated_at?: string
          user_id: string
          username: string
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_type?: string
          background_value?: string
          buttons?: Json
          created_at?: string
          description?: string
          footer_text?: string
          id?: string
          is_verified?: boolean | null
          project_id?: string
          style_type?: string
          title?: string
          total_views?: number | null
          updated_at?: string
          user_id?: string
          username?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          discord_id: string
          discriminator: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id: string
          discriminator?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string
          discriminator?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string | null
          created_at: string | null
          file_name: string
          file_path: string
          id: string
          is_directory: boolean | null
          parent_path: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          id?: string
          is_directory?: boolean | null
          parent_path?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_directory?: boolean | null
          parent_path?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          language: Database["public"]["Enums"]["project_language"]
          main_file: string | null
          name: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          url_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: Database["public"]["Enums"]["project_language"]
          main_file?: string | null
          name: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          url_slug: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: Database["public"]["Enums"]["project_language"]
          main_file?: string | null
          name?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          url_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      server_members: {
        Row: {
          id: string
          is_admin: boolean | null
          joined_at: string | null
          server_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          server_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "discord_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_status: {
        Row: {
          is_online: boolean | null
          is_typing_in_conversation: string | null
          last_seen: string | null
          user_id: string
        }
        Insert: {
          is_online?: boolean | null
          is_typing_in_conversation?: string | null
          last_seen?: string | null
          user_id: string
        }
        Update: {
          is_online?: boolean | null
          is_typing_in_conversation?: string | null
          last_seen?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_status_is_typing_in_conversation_fkey"
            columns: ["is_typing_in_conversation"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_url_slug: { Args: { user_discord_id: string }; Returns: string }
    }
    Enums: {
      project_language: "nodejs" | "python" | "typescript" | "html" | "profile"
      project_status: "stopped" | "starting" | "running" | "error"
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
      project_language: ["nodejs", "python", "typescript", "html", "profile"],
      project_status: ["stopped", "starting", "running", "error"],
    },
  },
} as const
