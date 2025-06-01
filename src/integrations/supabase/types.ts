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
      avaliacoes_corretor: {
        Row: {
          bairro: string | null
          corretor: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          estimativaMax: number | null
          estimativamin: number | null
          id: string
          link_resultado: string | null
          metragem: number | null
          mobilia: string | null
          nome: string | null
          operacaotipo: string | null
          padrao: string | null
          quartos: number | null
          suites: number | null
          telefone: string | null
          tipo: string | null
          vagas: number | null
          valorfinalformatado: string | null
          whatsapp_corretor: string | null
        }
        Insert: {
          bairro?: string | null
          corretor?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          estimativaMax?: number | null
          estimativamin?: number | null
          id: string
          link_resultado?: string | null
          metragem?: number | null
          mobilia?: string | null
          nome?: string | null
          operacaotipo?: string | null
          padrao?: string | null
          quartos?: number | null
          suites?: number | null
          telefone?: string | null
          tipo?: string | null
          vagas?: number | null
          valorfinalformatado?: string | null
          whatsapp_corretor?: string | null
        }
        Update: {
          bairro?: string | null
          corretor?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          estimativaMax?: number | null
          estimativamin?: number | null
          id?: string
          link_resultado?: string | null
          metragem?: number | null
          mobilia?: string | null
          nome?: string | null
          operacaotipo?: string | null
          padrao?: string | null
          quartos?: number | null
          suites?: number | null
          telefone?: string | null
          tipo?: string | null
          vagas?: number | null
          valorfinalformatado?: string | null
          whatsapp_corretor?: string | null
        }
        Relationships: []
      }
      indices_economicos: {
        Row: {
          cub_nacional: number | null
          id: number
          igpm: number | null
          incc: number | null
          ipca: number | null
          mes_ano: string
        }
        Insert: {
          cub_nacional?: number | null
          id?: number
          igpm?: number | null
          incc?: number | null
          ipca?: number | null
          mes_ano: string
        }
        Update: {
          cub_nacional?: number | null
          id?: number
          igpm?: number | null
          incc?: number | null
          ipca?: number | null
          mes_ano?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
