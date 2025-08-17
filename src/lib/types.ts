// Database types for Digital Product Passport
// In production, these would be generated using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          image_url: string | null
          brand_id: string
          sku: string | null
          description: string | null
          care_instructions: string | null
          end_of_life_options: string | null
          material_composition: { material: string; percent: number }[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          brand_id?: string  // Made optional since it can be set by trigger
          sku?: string | null
          description?: string | null
          care_instructions?: string | null
          end_of_life_options?: string | null
          material_composition?: { material: string; percent: number }[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          brand_id?: string
          sku?: string | null
          description?: string | null
          care_instructions?: string | null
          end_of_life_options?: string | null
          material_composition?: { material: string; percent: number }[] | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          brand_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          brand_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          tier: 1 | 2 | 3
          location: string
          latitude: number | null
          longitude: number | null
          brand_id: string
          parent_supplier_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tier: 1 | 2 | 3
          location: string
          latitude?: number | null
          longitude?: number | null
          brand_id?: string  // Made optional since it can be set by trigger
          parent_supplier_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier?: 1 | 2 | 3
          location?: string
          latitude?: number | null
          longitude?: number | null
          brand_id?: string
          parent_supplier_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_suppliers: {
        Row: {
          id: string
          product_id: string
          supplier_id: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          supplier_id: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          supplier_id?: string
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          supplier_id: string
          name: string
          type: string
          issued_date: string
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          name: string
          type: string
          issued_date: string
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          name?: string
          type?: string
          issued_date?: string
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ledger: {
        Row: {
          id: string
          certificate_id: string
          data_hash: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          certificate_id: string
          data_hash: string
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          certificate_id?: string
          data_hash?: string
          timestamp?: string
          created_at?: string
        }
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
  }
}

// Convenience types for application use
export type Product = Database['public']['Tables']['products']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Certificate = Database['public']['Tables']['certificates']['Row']
export type LedgerEntry = Database['public']['Tables']['ledger']['Row']
export type ProductSupplier = Database['public']['Tables']['product_suppliers']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// Composite types for DPP data structure
export interface DppData {
  product: Product & {
    brand: Brand
  }
  suppliers: Array<Supplier & {
    certificates: Array<Certificate & {
      ledger_entry?: LedgerEntry
    }>
  }>
}

// Type for individual supplier with certificates
export interface SupplierWithCertificates extends Supplier {
  certificates: Array<{
    id: string
    name: string
    type: string
    issued_date: string
    verified_at: string | null
    created_at: string
    updated_at: string
    supplier_id: string
    ledger_entry?: {
      id: string
      data_hash: string
      timestamp: string
      created_at: string
      certificate_id: string
    }
  }>
}

// Query result types for Supabase joins
export interface ProductQueryResult {
  id: string
  name: string
  image_url: string | null
  brand_id: string
  sku: string | null
  description: string | null
  care_instructions: string | null
  end_of_life_options: string | null
  material_composition: { material: string; percent: number }[] | null
  created_at: string
  updated_at: string
  brands: Brand[]
}

export interface SupplierQueryResult {
  suppliers: Supplier & {
    certificates: Array<Certificate & {
      ledger: LedgerEntry[]
    }>
  }
}

// Supabase error type
export interface SupabaseError {
  code?: string
  message: string
  details?: string
  hint?: string
}

// Brand Dashboard specific types
export interface SupplierWithHierarchy extends Supplier {
  children?: SupplierWithHierarchy[]
  parent?: Supplier | null
}

export interface ProductWithSuppliers extends Product {
  brand: Brand
  suppliers: SupplierWithHierarchy[]
}

// Form state type for Server Actions
export type FormState = {
  errors?: { [key: string]: string[] | undefined }
  message?: string | null
  success?: boolean
}

// Dashboard analytics types
export interface DashboardAnalytics {
  productCount: number
  supplierCount: number
  recentProducts: Array<{
    id: string
    name: string
  }>
  tierDistribution: Array<{
    tier: number
    count: number
  }>
}