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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          brand_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
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
  created_at: string
  updated_at: string
  brands: Brand
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