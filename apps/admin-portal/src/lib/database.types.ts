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
      activity_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["activity_log_action_type"]
          created_at: string
          details: Json | null
          enterprise_id: string
          id: string
          target_id: string
          target_name: string | null
          target_type: Database["public"]["Enums"]["activity_target_type"]
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["activity_log_action_type"]
          created_at?: string
          details?: Json | null
          enterprise_id: string
          id?: string
          target_id: string
          target_name?: string | null
          target_type: Database["public"]["Enums"]["activity_target_type"]
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["activity_log_action_type"]
          created_at?: string
          details?: Json | null
          enterprise_id?: string
          id?: string
          target_id?: string
          target_name?: string | null
          target_type?: Database["public"]["Enums"]["activity_target_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          bank_name: string
          created_at: string | null
          enterprise_id: string
          iban: string
          id: string
          name: string
          notes: Json | null
          routing_number: string | null
          status: Database["public"]["Enums"]["common_status"]
          swift_bic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          bank_name: string
          created_at?: string | null
          enterprise_id: string
          iban: string
          id?: string
          name: string
          notes?: Json | null
          routing_number?: string | null
          status: Database["public"]["Enums"]["common_status"]
          swift_bic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string
          created_at?: string | null
          enterprise_id?: string
          iban?: string
          id?: string
          name?: string
          notes?: Json | null
          routing_number?: string | null
          status?: Database["public"]["Enums"]["common_status"]
          swift_bic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          additional_number: string | null
          area: string | null
          building_number: string | null
          city: string | null
          code: string | null
          country: string | null
          created_at: string
          email: string | null
          enterprise_id: string
          id: string
          manager: string | null
          name: string
          notes: Json | null
          phone: string | null
          region: string | null
          short_address: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          street_name: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          area?: string | null
          building_number?: string | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id: string
          id?: string
          manager?: string | null
          name: string
          notes?: Json | null
          phone?: string | null
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          area?: string | null
          building_number?: string | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id?: string
          id?: string
          manager?: string | null
          name?: string
          notes?: Json | null
          phone?: string | null
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_branch_manager"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          annual_payment: number | null
          code: string | null
          color: string | null
          created_at: string
          daily_payment: number | null
          enterprise_id: string
          id: string
          license_country: string | null
          license_plate: string | null
          make: string
          model: string
          monthly_payment: number | null
          name: string
          notes: Json | null
          ownership_status:
            | Database["public"]["Enums"]["vehicle_ownership_status"]
            | null
          payment_cycle: Database["public"]["Enums"]["payment_cycle"] | null
          purchase_date: string | null
          purchase_price: number | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at: string
          user_id: string
          vin: string | null
          weekly_payment: number | null
          year: number
        }
        Insert: {
          annual_payment?: number | null
          code?: string | null
          color?: string | null
          created_at?: string
          daily_payment?: number | null
          enterprise_id: string
          id?: string
          license_country?: string | null
          license_plate?: string | null
          make: string
          model: string
          monthly_payment?: number | null
          name: string
          notes?: Json | null
          ownership_status?:
            | Database["public"]["Enums"]["vehicle_ownership_status"]
            | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          user_id: string
          vin?: string | null
          weekly_payment?: number | null
          year: number
        }
        Update: {
          annual_payment?: number | null
          code?: string | null
          color?: string | null
          created_at?: string
          daily_payment?: number | null
          enterprise_id?: string
          id?: string
          license_country?: string | null
          license_plate?: string | null
          make?: string
          model?: string
          monthly_payment?: number | null
          name?: string
          notes?: Json | null
          ownership_status?:
            | Database["public"]["Enums"]["vehicle_ownership_status"]
            | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          user_id?: string
          vin?: string | null
          weekly_payment?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          additional_number: string | null
          building_number: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          enterprise_id: string
          id: string
          name: string
          notes: Json | null
          phone: string
          region: string | null
          short_address: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          street_name: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          building_number?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id: string
          id?: string
          name: string
          notes?: Json | null
          phone: string
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          building_number?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id?: string
          id?: string
          name?: string
          notes?: Json | null
          phone?: string
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          additional_number: string | null
          building_number: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          enterprise_id: string
          id: string
          industry: string | null
          name: string
          notes: Json | null
          phone: string | null
          region: string | null
          short_address: string | null
          size: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          street_name: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          building_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          enterprise_id: string
          id?: string
          industry?: string | null
          name: string
          notes?: Json | null
          phone?: string | null
          region?: string | null
          short_address?: string | null
          size?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          building_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          enterprise_id?: string
          id?: string
          industry?: string | null
          name?: string
          notes?: Json | null
          phone?: string | null
          region?: string | null
          short_address?: string | null
          size?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      department_locations: {
        Row: {
          created_at: string
          department_id: string
          enterprise_id: string
          id: string
          location_id: string
          location_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          enterprise_id: string
          id?: string
          location_id: string
          location_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          enterprise_id?: string
          id?: string
          location_id?: string
          location_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_locations_department_id_departments_id_fk"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          enterprise_id: string
          id: string
          name: string
          notes: Json | null
          status: Database["public"]["Enums"]["common_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enterprise_id: string
          id?: string
          name: string
          notes?: Json | null
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enterprise_id?: string
          id?: string
          name?: string
          notes?: Json | null
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          enterprise_id: string
          entity_id: string
          entity_type: string
          file_path: string
          id: string
          name: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enterprise_id: string
          entity_id: string
          entity_type: string
          file_path: string
          id?: string
          name: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          enterprise_id?: string
          entity_id?: string
          entity_type?: string
          file_path?: string
          id?: string
          name?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      domains: {
        Row: {
          annual_payment: number | null
          created_at: string
          domain_name: string
          enterprise_id: string
          id: string
          monthly_payment: number | null
          notes: Json | null
          payment_cycle: Database["public"]["Enums"]["payment_cycle"] | null
          registrar: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_payment?: number | null
          created_at?: string
          domain_name: string
          enterprise_id: string
          id?: string
          monthly_payment?: number | null
          notes?: Json | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          registrar?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_payment?: number | null
          created_at?: string
          domain_name?: string
          enterprise_id?: string
          id?: string
          monthly_payment?: number | null
          notes?: Json | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          registrar?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_requests: {
        Row: {
          amount: number | null
          attachments: Json | null
          created_at: string
          description: string | null
          employee_id: string
          end_date: string | null
          enterprise_id: string
          id: string
          notes: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["employee_request_status"]
          title: string
          type: Database["public"]["Enums"]["employee_request_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          attachments?: Json | null
          created_at?: string
          description?: string | null
          employee_id: string
          end_date?: string | null
          enterprise_id: string
          id?: string
          notes?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["employee_request_status"]
          title: string
          type: Database["public"]["Enums"]["employee_request_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          attachments?: Json | null
          created_at?: string
          description?: string | null
          employee_id?: string
          end_date?: string | null
          enterprise_id?: string
          id?: string
          notes?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["employee_request_status"]
          title?: string
          type?: Database["public"]["Enums"]["employee_request_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_employee_id_employees_id_fk"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          additional_number: string | null
          birth_date: string | null
          building_number: string | null
          city: string | null
          country: string | null
          created_at: string
          education_level: string | null
          email: string
          emergency_contact: Json | null
          employee_number: string | null
          enterprise_id: string
          eqama_id: string | null
          first_name: string
          gender: string | null
          hire_date: string | null
          id: string
          job_id: string | null
          last_name: string
          marital_status: string | null
          national_id: string | null
          nationality: string | null
          notes: Json | null
          offboarding_status: string | null
          onboarding_status: string | null
          phone: string | null
          region: string | null
          salary: Json | null
          short_address: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          street_name: string | null
          termination_date: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          birth_date?: string | null
          building_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          email: string
          emergency_contact?: Json | null
          employee_number?: string | null
          enterprise_id: string
          eqama_id?: string | null
          first_name: string
          gender?: string | null
          hire_date?: string | null
          id?: string
          job_id?: string | null
          last_name: string
          marital_status?: string | null
          national_id?: string | null
          nationality?: string | null
          notes?: Json | null
          offboarding_status?: string | null
          onboarding_status?: string | null
          phone?: string | null
          region?: string | null
          salary?: Json | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          street_name?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          birth_date?: string | null
          building_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          email?: string
          emergency_contact?: Json | null
          employee_number?: string | null
          enterprise_id?: string
          eqama_id?: string | null
          first_name?: string
          gender?: string | null
          hire_date?: string | null
          id?: string
          job_id?: string | null
          last_name?: string
          marital_status?: string | null
          national_id?: string | null
          nationality?: string | null
          notes?: Json | null
          offboarding_status?: string | null
          onboarding_status?: string | null
          phone?: string | null
          region?: string | null
          salary?: Json | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          street_name?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_job_id_jobs_id_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprises: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          founded: number | null
          id: string
          industry: string | null
          logo: string | null
          name: string
          registration_country: string | null
          registration_number: string | null
          size: string | null
          vat_enabled: boolean | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded?: number | null
          id?: string
          industry?: string | null
          logo?: string | null
          name: string
          registration_country?: string | null
          registration_number?: string | null
          size?: string | null
          vat_enabled?: boolean | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded?: number | null
          id?: string
          industry?: string | null
          logo?: string | null
          name?: string
          registration_country?: string | null
          registration_number?: string | null
          size?: string | null
          vat_enabled?: boolean | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          enterprise_id: string
          expense_number: string
          id: string
          incurred_at: string | null
          issue_date: string | null
          notes: Json | null
          status: Database["public"]["Enums"]["expense_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          enterprise_id: string
          expense_number: string
          id?: string
          incurred_at?: string | null
          issue_date?: string | null
          notes?: Json | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          enterprise_id?: string
          expense_number?: string
          id?: string
          incurred_at?: string | null
          issue_date?: string | null
          notes?: Json | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_enterprises"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "expenses_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          due_date: string | null
          enterprise_id: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          notes: Json | null
          seller_name: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string
          user_id: string | null
          vat_number: string | null
          zatca_enabled: boolean | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          enterprise_id?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          notes?: Json | null
          seller_name?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
          zatca_enabled?: boolean | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          enterprise_id?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          notes?: Json | null
          seller_name?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
          zatca_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_enterprises"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invoices_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listing_jobs: {
        Row: {
          created_at: string
          enterprise_id: string
          id: string
          job_id: string
          job_listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enterprise_id: string
          id?: string
          job_id: string
          job_listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          enterprise_id?: string
          id?: string
          job_id?: string
          job_listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listing_jobs_job_id_jobs_id_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listing_jobs_job_listing_id_job_listings_id_fk"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          created_at: string
          currency: string | null
          departments: Json | null
          description: string | null
          enable_search_filtering: boolean | null
          enterprise_id: string
          id: string
          is_public: boolean
          locations: Json | null
          slug: string
          status: Database["public"]["Enums"]["common_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          departments?: Json | null
          description?: string | null
          enable_search_filtering?: boolean | null
          enterprise_id: string
          id?: string
          is_public?: boolean
          locations?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["common_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          departments?: Json | null
          description?: string | null
          enable_search_filtering?: boolean | null
          enterprise_id?: string
          id?: string
          is_public?: boolean
          locations?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["common_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          benefits: string | null
          created_at: string
          department: string | null
          description: string | null
          end_date: string | null
          enterprise_id: string
          id: string
          location: string | null
          location_id: string | null
          location_type: string | null
          occupied_positions: number
          requirements: string | null
          responsibilities: string | null
          salary: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          title: string
          total_positions: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          benefits?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          end_date?: string | null
          enterprise_id: string
          id?: string
          location?: string | null
          location_id?: string | null
          location_type?: string | null
          occupied_positions?: number
          requirements?: string | null
          responsibilities?: string | null
          salary?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          title: string
          total_positions?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          benefits?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          end_date?: string | null
          enterprise_id?: string
          id?: string
          location?: string | null
          location_id?: string | null
          location_type?: string | null
          occupied_positions?: number
          requirements?: string | null
          responsibilities?: string | null
          salary?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          title?: string
          total_positions?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string | null
          enterprise_id: string | null
          id: string
          profile_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          enterprise_id?: string | null
          id?: string
          profile_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          enterprise_id?: string | null
          id?: string
          profile_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_enterprises"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          additional_number: string | null
          area: string | null
          building_number: string | null
          capacity: number | null
          city: string | null
          code: string | null
          country: string | null
          created_at: string
          email: string | null
          enterprise_id: string
          id: string
          manager: string | null
          name: string
          notes: Json | null
          phone: string | null
          region: string | null
          short_address: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          street_name: string | null
          updated_at: string
          user_id: string
          working_hours: Json | null
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          area?: string | null
          building_number?: string | null
          capacity?: number | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id: string
          id?: string
          manager?: string | null
          name: string
          notes?: Json | null
          phone?: string | null
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id: string
          working_hours?: Json | null
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          area?: string | null
          building_number?: string | null
          capacity?: number | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id?: string
          id?: string
          manager?: string | null
          name?: string
          notes?: Json | null
          phone?: string | null
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id?: string
          working_hours?: Json | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_office_manager"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      online_stores: {
        Row: {
          created_at: string
          domain_name: string
          enterprise_id: string
          id: string
          notes: Json | null
          platform: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain_name: string
          enterprise_id: string
          id?: string
          notes?: Json | null
          platform?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain_name?: string
          enterprise_id?: string
          id?: string
          notes?: Json | null
          platform?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_stores_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          enterprise_id: string
          id: string
          name: string
          notes: Json | null
          price: number
          sku: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          stock_quantity: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          enterprise_id: string
          id?: string
          name: string
          notes?: Json | null
          price: number
          sku?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          stock_quantity?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          enterprise_id?: string
          id?: string
          name?: string
          notes?: Json | null
          price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          stock_quantity?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cancel_at: number | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          email: string | null
          enterprise_id: string | null
          full_name: string | null
          id: string
          price_id: string | null
          role: string
          stripe_customer_id: string | null
          subscribed_to: string | null
          updated_at: string | null
          user_settings: Json | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          cancel_at?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          email?: string | null
          enterprise_id?: string | null
          full_name?: string | null
          id: string
          price_id?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscribed_to?: string | null
          updated_at?: string | null
          user_settings?: Json | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          cancel_at?: number | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          email?: string | null
          enterprise_id?: string | null
          full_name?: string | null
          id?: string
          price_id?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscribed_to?: string | null
          updated_at?: string | null
          user_settings?: Json | null
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          enterprise_id: string
          id: string
          incurred_at: string | null
          issue_date: string | null
          notes: Json | null
          purchase_number: string
          status: Database["public"]["Enums"]["purchase_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          enterprise_id: string
          id?: string
          incurred_at?: string | null
          issue_date?: string | null
          notes?: Json | null
          purchase_number: string
          status?: Database["public"]["Enums"]["purchase_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          enterprise_id?: string
          id?: string
          incurred_at?: string | null
          issue_date?: string | null
          notes?: Json | null
          purchase_number?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_enterprises"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchases_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string
          id: string
          product_id: string | null
          quantity: number
          quote_id: string
          unit_price: number
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description: string
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id: string
          unit_price: number
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          enterprise_id: string
          expiry_date: string
          id: string
          issue_date: string
          notes: Json | null
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          enterprise_id: string
          expiry_date: string
          id?: string
          issue_date: string
          notes?: Json | null
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          enterprise_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          notes?: Json | null
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_enterprises"
            referencedColumns: ["user_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          enterprise_id: string | null
          id: string
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enterprise_id?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enterprise_id?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      salaries: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deductions: Json | null
          employee_id: string
          end_date: string | null
          enterprise_id: string
          id: string
          notes: Json | null
          payment_date: string | null
          payment_frequency: string
          start_date: string
          status: Database["public"]["Enums"]["common_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          deductions?: Json | null
          employee_id: string
          end_date?: string | null
          enterprise_id: string
          id?: string
          notes?: Json | null
          payment_date?: string | null
          payment_frequency?: string
          start_date: string
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deductions?: Json | null
          employee_id?: string
          end_date?: string | null
          enterprise_id?: string
          id?: string
          notes?: Json | null
          payment_date?: string | null
          payment_frequency?: string
          start_date?: string
          status?: Database["public"]["Enums"]["common_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          annual_payment: number | null
          created_at: string
          enterprise_id: string
          id: string
          ip_address: unknown | null
          location: string | null
          monthly_payment: number | null
          name: string
          notes: Json | null
          os: string | null
          payment_cycle: Database["public"]["Enums"]["payment_cycle"] | null
          provider: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          tags: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_payment?: number | null
          created_at?: string
          enterprise_id: string
          id?: string
          ip_address?: unknown | null
          location?: string | null
          monthly_payment?: number | null
          name: string
          notes?: Json | null
          os?: string | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          provider?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          tags?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_payment?: number | null
          created_at?: string
          enterprise_id?: string
          id?: string
          ip_address?: unknown | null
          location?: string | null
          monthly_payment?: number | null
          name?: string
          notes?: Json | null
          os?: string | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          provider?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          tags?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servers_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_reactivations: {
        Row: {
          created_at: string
          id: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          content: Json
          created_at: string | null
          enterprise_id: string
          id: string
          is_default: boolean
          name: string
          type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          enterprise_id: string
          id?: string
          is_default?: boolean
          name: string
          type: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          enterprise_id?: string
          id?: string
          is_default?: boolean
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      trucks: {
        Row: {
          annual_payment: number | null
          code: string | null
          color: string | null
          created_at: string
          daily_payment: number | null
          enterprise_id: string
          id: string
          license_country: string | null
          license_plate: string | null
          make: string
          model: string
          monthly_payment: number | null
          name: string
          notes: Json | null
          ownership_status:
            | Database["public"]["Enums"]["vehicle_ownership_status"]
            | null
          payment_cycle: Database["public"]["Enums"]["payment_cycle"] | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at: string
          user_id: string
          vin: string | null
          weekly_payment: number | null
          year: number
        }
        Insert: {
          annual_payment?: number | null
          code?: string | null
          color?: string | null
          created_at?: string
          daily_payment?: number | null
          enterprise_id: string
          id?: string
          license_country?: string | null
          license_plate?: string | null
          make: string
          model: string
          monthly_payment?: number | null
          name: string
          notes?: Json | null
          ownership_status?:
            | Database["public"]["Enums"]["vehicle_ownership_status"]
            | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          user_id: string
          vin?: string | null
          weekly_payment?: number | null
          year: number
        }
        Update: {
          annual_payment?: number | null
          code?: string | null
          color?: string | null
          created_at?: string
          daily_payment?: number | null
          enterprise_id?: string
          id?: string
          license_country?: string | null
          license_plate?: string | null
          make?: string
          model?: string
          monthly_payment?: number | null
          name?: string
          notes?: Json | null
          ownership_status?:
            | Database["public"]["Enums"]["vehicle_ownership_status"]
            | null
          payment_cycle?: Database["public"]["Enums"]["payment_cycle"] | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          user_id?: string
          vin?: string | null
          weekly_payment?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "trucks_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_enterprise_roles: {
        Row: {
          created_at: string
          enterprise_id: string
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enterprise_id: string
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enterprise_id?: string
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          enterprise_id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enterprise_id: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enterprise_id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          additional_number: string | null
          building_number: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string
          enterprise_id: string
          id: string
          name: string
          notes: Json | null
          phone: string
          region: string | null
          short_address: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          street_name: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          building_number?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          enterprise_id: string
          id?: string
          name: string
          notes?: Json | null
          phone: string
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          building_number?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          enterprise_id?: string
          id?: string
          name?: string
          notes?: Json | null
          phone?: string
          region?: string | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          additional_number: string | null
          area: string | null
          building_number: string | null
          capacity: number | null
          city: string | null
          code: string | null
          country: string | null
          created_at: string
          email: string | null
          enterprise_id: string
          id: string
          manager: string | null
          name: string
          notes: Json | null
          operating_hours: Json | null
          phone: string | null
          region: string | null
          safety_compliance: Json | null
          short_address: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          street_name: string | null
          temperature_control: boolean | null
          updated_at: string
          user_id: string
          warehouse_type: string | null
          zip_code: string | null
        }
        Insert: {
          additional_number?: string | null
          area?: string | null
          building_number?: string | null
          capacity?: number | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id: string
          id?: string
          manager?: string | null
          name: string
          notes?: Json | null
          operating_hours?: Json | null
          phone?: string | null
          region?: string | null
          safety_compliance?: Json | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          temperature_control?: boolean | null
          updated_at?: string
          user_id: string
          warehouse_type?: string | null
          zip_code?: string | null
        }
        Update: {
          additional_number?: string | null
          area?: string | null
          building_number?: string | null
          capacity?: number | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          enterprise_id?: string
          id?: string
          manager?: string | null
          name?: string
          notes?: Json | null
          operating_hours?: Json | null
          phone?: string | null
          region?: string | null
          safety_compliance?: Json | null
          short_address?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          street_name?: string | null
          temperature_control?: boolean | null
          updated_at?: string
          user_id?: string
          warehouse_type?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_warehouse_manager"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          created_at: string
          description: string | null
          domain_name: string
          enterprise_id: string
          id: string
          notes: Json | null
          privacy_policy_url: string | null
          status: Database["public"]["Enums"]["common_status"] | null
          tags: Json | null
          terms_of_service_url: string | null
          updated_at: string
          user_id: string
          website_name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_name: string
          enterprise_id: string
          id?: string
          notes?: Json | null
          privacy_policy_url?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          tags?: Json | null
          terms_of_service_url?: string | null
          updated_at?: string
          user_id: string
          website_name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_name?: string
          enterprise_id?: string
          id?: string
          notes?: Json | null
          privacy_policy_url?: string | null
          status?: Database["public"]["Enums"]["common_status"] | null
          tags?: Json | null
          terms_of_service_url?: string | null
          updated_at?: string
          user_id?: string
          website_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "websites_enterprise_id_enterprises_id_fk"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_enterprises: {
        Row: {
          enterprise_id: string | null
          user_id: string | null
        }
        Insert: {
          enterprise_id?: string | null
          user_id?: string | null
        }
        Update: {
          enterprise_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_permissions_view: {
        Row: {
          enterprise_id: string | null
          is_system: boolean | null
          permission_id: string | null
          permission_name: string | null
          role_id: string | null
          role_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_enterprises"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      api_delete_employees: {
        Args: { ids: string[]; cascade?: boolean }
        Returns: Json
      }
      check_employee_has_requests: {
        Args: { employee_ids: string[] }
        Returns: Json
      }
      check_user_can_create_role_in_enterprise: {
        Args: { p_enterprise_id: string }
        Returns: boolean
      }
      create_enterprise: {
        Args: {
          enterprise_name: string
          enterprise_email: string
          enterprise_industry: string
          enterprise_size: string
        }
        Returns: string
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      delete_employee_with_requests: {
        Args: { employee_ids: string[]; should_cascade: boolean }
        Returns: Json
      }
      get_activity_logs_with_user_email: {
        Args: { p_enterprise_id: string }
        Returns: {
          id: string
          enterprise_id: string
          user_id: string
          action_type: Database["public"]["Enums"]["activity_log_action_type"]
          target_type: Database["public"]["Enums"]["activity_target_type"]
          target_id: string
          target_name: string
          details: Json
          created_at: string
          user_email: string
          user_full_name: string
        }[]
      }
      get_daily_activity_counts: {
        Args: {
          p_enterprise_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          activity_date: string
          activity_count: number
        }[]
      }
      get_module_analytics_branch: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          branches_added: number
          branches_removed: number
          branches_updated: number
        }[]
      }
      get_module_analytics_cars: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          cars_added: number
          cars_removed: number
          cars_updated: number
        }[]
      }
      get_module_analytics_client: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          clients_added: number
          clients_removed: number
          clients_updated: number
        }[]
      }
      get_module_analytics_domain: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          domains_added: number
          domains_removed: number
          domains_updated: number
        }[]
      }
      get_module_analytics_employee: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          employees_added: number
          employees_removed: number
          employees_updated: number
        }[]
      }
      get_module_analytics_employee_request: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          employee_requests_added: number
          employee_requests_removed: number
          employee_requests_updated: number
        }[]
      }
      get_module_analytics_expense: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          expenses_added: number
          expenses_removed: number
          expenses_updated: number
        }[]
      }
      get_module_analytics_invoice: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          invoices_added: number
          invoices_removed: number
          invoices_updated: number
        }[]
      }
      get_module_analytics_job: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          jobs_added: number
          jobs_removed: number
          jobs_updated: number
        }[]
      }
      get_module_analytics_job_listing: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          job_listings_added: number
          job_listings_removed: number
          job_listings_updated: number
        }[]
      }
      get_module_analytics_office: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          offices_added: number
          offices_removed: number
          offices_updated: number
        }[]
      }
      get_module_analytics_online_stores: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          online_stores_added: number
          online_stores_removed: number
          online_stores_updated: number
        }[]
      }
      get_module_analytics_product: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          products_added: number
          products_removed: number
          products_updated: number
        }[]
      }
      get_module_analytics_purchases: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          purchases_added: number
          purchases_removed: number
          purchases_updated: number
        }[]
      }
      get_module_analytics_server: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          servers_added: number
          servers_removed: number
          servers_updated: number
        }[]
      }
      get_module_analytics_warehouse: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          warehouses_added: number
          warehouses_removed: number
          warehouses_updated: number
        }[]
      }
      get_module_analytics_website: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          websites_added: number
          websites_removed: number
          websites_updated: number
        }[]
      }
      get_module_analytics_websites: {
        Args: { start_date?: string; end_date?: string; time_interval?: string }
        Returns: {
          period_start: string
          websites_added: number
          websites_removed: number
          websites_updated: number
        }[]
      }
      get_or_create_role: {
        Args: { role_name: string; enterprise_id: string }
        Returns: string
      }
      get_user_id_by_email: {
        Args: { user_email: string }
        Returns: {
          id: string
        }[]
      }
      get_user_permissions: {
        Args: { enterprise_id: string; user_id: string }
        Returns: {
          permission: string
        }[]
      }
      is_member_of_enterprise: {
        Args: { p_enterprise_id: string }
        Returns: boolean
      }
      postgres_fdw_disconnect: {
        Args: { "": string }
        Returns: boolean
      }
      postgres_fdw_disconnect_all: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      postgres_fdw_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      postgres_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_profile_subscription: {
        Args: {
          user_id_param: string
          subscription_param: string
          price_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_log_action_type:
        | "INSERT"
        | "UPDATE"
        | "DELETE"
        | "CREATED"
        | "UPDATED"
        | "DELETED"
      activity_log_target_type:
        | "ENTERPRISE"
        | "USER"
        | "EMPLOYEE"
        | "ROLE"
        | "PERMISSION"
        | "INVOICE"
        | "EXPENSE"
        | "SETTING"
        | "NOTIFICATION"
        | "SYSTEM"
      activity_target_type:
        | "USER"
        | "ROLE"
        | "COMPANY"
        | "CLIENT"
        | "INVOICE"
        | "EXPENSE"
        | "QUOTE"
        | "BRANCH"
        | "VENDOR"
        | "OFFICE"
        | "WAREHOUSE"
        | "PURCHASE"
        | "PRODUCT"
        | "EMPLOYEE"
        | "DEPARTMENT"
        | "SALARY"
        | "SERVER"
        | "JOB_LISTING"
        | "APPLICANT"
        | "JOB"
        | "TEMPLATE"
        | "DOCUMENT"
        | "ENTERPRISE_SETTINGS"
        | "EMPLOYEE_REQUEST"
        | "DOMAIN"
        | "WEBSITE"
        | "ONLINE_STORE"
        | "CAR"
        | "TRUCK"
      app_permission:
        | "users.create"
        | "users.read"
        | "users.update"
        | "users.delete"
        | "users.export"
        | "users.invite"
        | "roles.create"
        | "roles.read"
        | "roles.update"
        | "roles.delete"
        | "roles.export"
        | "roles.assign"
        | "companies.create"
        | "companies.read"
        | "companies.update"
        | "companies.delete"
        | "companies.export"
        | "companies.duplicate"
        | "branches.create"
        | "branches.read"
        | "branches.update"
        | "branches.delete"
        | "branches.export"
        | "branches.duplicate"
        | "clients.create"
        | "clients.read"
        | "clients.update"
        | "clients.delete"
        | "clients.export"
        | "clients.duplicate"
        | "vendors.create"
        | "vendors.read"
        | "vendors.update"
        | "vendors.delete"
        | "vendors.export"
        | "vendors.duplicate"
        | "products.create"
        | "products.read"
        | "products.update"
        | "products.delete"
        | "products.export"
        | "products.duplicate"
        | "invoices.create"
        | "invoices.read"
        | "invoices.update"
        | "invoices.delete"
        | "invoices.export"
        | "invoices.duplicate"
        | "expenses.create"
        | "expenses.read"
        | "expenses.update"
        | "expenses.delete"
        | "expenses.export"
        | "expenses.duplicate"
        | "settings.read"
        | "settings.update"
        | "users.duplicate"
        | "roles.duplicate"
        | "jobs.read"
        | "jobs.create"
        | "jobs.delete"
        | "jobs.update"
        | "jobs.duplicate"
        | "jobs.export"
        | "job_listings.read"
        | "job_listings.create"
        | "job_listings.delete"
        | "job_listings.update"
        | "job_listings.duplicate"
        | "job_listings.export"
        | "departments.read"
        | "departments.create"
        | "departments.delete"
        | "departments.update"
        | "departments.duplicate"
        | "departments.export"
        | "salaries.read"
        | "salaries.create"
        | "salaries.delete"
        | "salaries.update"
        | "salaries.duplicate"
        | "salaries.export"
        | "offices.read"
        | "offices.create"
        | "offices.delete"
        | "offices.update"
        | "offices.duplicate"
        | "offices.export"
        | "warehouses.read"
        | "warehouses.create"
        | "warehouses.delete"
        | "warehouses.update"
        | "warehouses.duplicate"
        | "warehouses.export"
        | "employees.read"
        | "employees.create"
        | "employees.delete"
        | "employees.update"
        | "employees.duplicate"
        | "employees.export"
        | "employee_requests.read"
        | "employee_requests.create"
        | "employee_requests.delete"
        | "employee_requests.update"
        | "employee_requests.duplicate"
        | "employee_requests.export"
        | "quotes.read"
        | "quotes.create"
        | "quotes.delete"
        | "quotes.update"
        | "quotes.duplicate"
        | "quotes.export"
        | "activity_logs.read"
        | "activity_logs.delete"
        | "activity_logs.export"
        | "domains.read"
        | "domains.create"
        | "domains.delete"
        | "domains.update"
        | "domains.export"
        | "servers.read"
        | "servers.create"
        | "servers.delete"
        | "servers.update"
        | "servers.export"
        | "servers.duplicate"
        | "purchases.read"
        | "purchases.create"
        | "purchases.delete"
        | "purchases.update"
        | "purchases.export"
        | "purchases.duplicate"
        | "websites.read"
        | "websites.create"
        | "websites.delete"
        | "websites.update"
        | "websites.export"
        | "websites.duplicate"
        | "online_stores.read"
        | "online_stores.create"
        | "online_stores.delete"
        | "online_stores.update"
        | "online_stores.export"
        | "online_stores.duplicate"
        | "cars.read"
        | "cars.create"
        | "cars.delete"
        | "cars.update"
        | "cars.export"
        | "cars.duplicate"
        | "trucks.read"
        | "trucks.create"
        | "trucks.delete"
        | "trucks.update"
        | "trucks.export"
        | "trucks.duplicate"
      app_role: "superadmin" | "admin" | "accounting" | "hr" | "it"
      common_status: "active" | "inactive" | "draft" | "archived"
      employee_request_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "revoked"
        | "pending_additional_info"
        | "completed"
        | "escalated"
        | "archived"
      employee_request_type: "leave" | "expense" | "document" | "other"
      employee_status:
        | "active"
        | "onboarding"
        | "probation"
        | "on_leave"
        | "terminated"
        | "retired"
        | "suspended"
      expense_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "pending_verification"
        | "approved"
        | "partially_approved"
        | "rejected"
        | "pending_payment"
        | "paid"
        | "disputed"
        | "audit_flagged"
        | "closed"
        | "archived"
      invoice_status:
        | "draft"
        | "pending_approval"
        | "sent"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "disputed"
        | "void"
        | "scheduled"
        | "payment_failed"
        | "refunded"
        | "written_off"
        | "archived"
      payment_cycle:
        | "monthly"
        | "annual"
        | "daily"
        | "weekly"
        | "biweekly"
        | "quarterly"
      purchase_status:
        | "draft"
        | "issued"
        | "acknowledged"
        | "partially_fulfilled"
        | "fulfilled"
        | "shipped"
        | "delayed"
        | "received"
        | "invoice_matched"
        | "payment_initiated"
        | "closed"
        | "cancelled"
      quote_status:
        | "draft"
        | "sent"
        | "revised"
        | "under_review"
        | "accepted"
        | "rejected"
        | "expired"
        | "converted_to_invoice"
        | "negotiating"
        | "archived"
      vehicle_ownership_status: "owned" | "financed" | "rented"
      vehicle_status:
        | "active"
        | "maintenance"
        | "sold"
        | "totaled"
        | "retired"
        | "stored"
        | "other"
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
    Enums: {
      activity_log_action_type: [
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATED",
        "UPDATED",
        "DELETED",
      ],
      activity_log_target_type: [
        "ENTERPRISE",
        "USER",
        "EMPLOYEE",
        "ROLE",
        "PERMISSION",
        "INVOICE",
        "EXPENSE",
        "SETTING",
        "NOTIFICATION",
        "SYSTEM",
      ],
      activity_target_type: [
        "USER",
        "ROLE",
        "COMPANY",
        "CLIENT",
        "INVOICE",
        "EXPENSE",
        "QUOTE",
        "BRANCH",
        "VENDOR",
        "OFFICE",
        "WAREHOUSE",
        "PURCHASE",
        "PRODUCT",
        "EMPLOYEE",
        "DEPARTMENT",
        "SALARY",
        "SERVER",
        "JOB_LISTING",
        "APPLICANT",
        "JOB",
        "TEMPLATE",
        "DOCUMENT",
        "ENTERPRISE_SETTINGS",
        "EMPLOYEE_REQUEST",
        "DOMAIN",
        "WEBSITE",
        "ONLINE_STORE",
        "CAR",
        "TRUCK",
      ],
      app_permission: [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "users.export",
        "users.invite",
        "roles.create",
        "roles.read",
        "roles.update",
        "roles.delete",
        "roles.export",
        "roles.assign",
        "companies.create",
        "companies.read",
        "companies.update",
        "companies.delete",
        "companies.export",
        "companies.duplicate",
        "branches.create",
        "branches.read",
        "branches.update",
        "branches.delete",
        "branches.export",
        "branches.duplicate",
        "clients.create",
        "clients.read",
        "clients.update",
        "clients.delete",
        "clients.export",
        "clients.duplicate",
        "vendors.create",
        "vendors.read",
        "vendors.update",
        "vendors.delete",
        "vendors.export",
        "vendors.duplicate",
        "products.create",
        "products.read",
        "products.update",
        "products.delete",
        "products.export",
        "products.duplicate",
        "invoices.create",
        "invoices.read",
        "invoices.update",
        "invoices.delete",
        "invoices.export",
        "invoices.duplicate",
        "expenses.create",
        "expenses.read",
        "expenses.update",
        "expenses.delete",
        "expenses.export",
        "expenses.duplicate",
        "settings.read",
        "settings.update",
        "users.duplicate",
        "roles.duplicate",
        "jobs.read",
        "jobs.create",
        "jobs.delete",
        "jobs.update",
        "jobs.duplicate",
        "jobs.export",
        "job_listings.read",
        "job_listings.create",
        "job_listings.delete",
        "job_listings.update",
        "job_listings.duplicate",
        "job_listings.export",
        "departments.read",
        "departments.create",
        "departments.delete",
        "departments.update",
        "departments.duplicate",
        "departments.export",
        "salaries.read",
        "salaries.create",
        "salaries.delete",
        "salaries.update",
        "salaries.duplicate",
        "salaries.export",
        "offices.read",
        "offices.create",
        "offices.delete",
        "offices.update",
        "offices.duplicate",
        "offices.export",
        "warehouses.read",
        "warehouses.create",
        "warehouses.delete",
        "warehouses.update",
        "warehouses.duplicate",
        "warehouses.export",
        "employees.read",
        "employees.create",
        "employees.delete",
        "employees.update",
        "employees.duplicate",
        "employees.export",
        "employee_requests.read",
        "employee_requests.create",
        "employee_requests.delete",
        "employee_requests.update",
        "employee_requests.duplicate",
        "employee_requests.export",
        "quotes.read",
        "quotes.create",
        "quotes.delete",
        "quotes.update",
        "quotes.duplicate",
        "quotes.export",
        "activity_logs.read",
        "activity_logs.delete",
        "activity_logs.export",
        "domains.read",
        "domains.create",
        "domains.delete",
        "domains.update",
        "domains.export",
        "servers.read",
        "servers.create",
        "servers.delete",
        "servers.update",
        "servers.export",
        "servers.duplicate",
        "purchases.read",
        "purchases.create",
        "purchases.delete",
        "purchases.update",
        "purchases.export",
        "purchases.duplicate",
        "websites.read",
        "websites.create",
        "websites.delete",
        "websites.update",
        "websites.export",
        "websites.duplicate",
        "online_stores.read",
        "online_stores.create",
        "online_stores.delete",
        "online_stores.update",
        "online_stores.export",
        "online_stores.duplicate",
        "cars.read",
        "cars.create",
        "cars.delete",
        "cars.update",
        "cars.export",
        "cars.duplicate",
        "trucks.read",
        "trucks.create",
        "trucks.delete",
        "trucks.update",
        "trucks.export",
        "trucks.duplicate",
      ],
      app_role: ["superadmin", "admin", "accounting", "hr", "it"],
      common_status: ["active", "inactive", "draft", "archived"],
      employee_request_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "revoked",
        "pending_additional_info",
        "completed",
        "escalated",
        "archived",
      ],
      employee_request_type: ["leave", "expense", "document", "other"],
      employee_status: [
        "active",
        "onboarding",
        "probation",
        "on_leave",
        "terminated",
        "retired",
        "suspended",
      ],
      expense_status: [
        "draft",
        "submitted",
        "under_review",
        "pending_verification",
        "approved",
        "partially_approved",
        "rejected",
        "pending_payment",
        "paid",
        "disputed",
        "audit_flagged",
        "closed",
        "archived",
      ],
      invoice_status: [
        "draft",
        "pending_approval",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "disputed",
        "void",
        "scheduled",
        "payment_failed",
        "refunded",
        "written_off",
        "archived",
      ],
      payment_cycle: [
        "monthly",
        "annual",
        "daily",
        "weekly",
        "biweekly",
        "quarterly",
      ],
      purchase_status: [
        "draft",
        "issued",
        "acknowledged",
        "partially_fulfilled",
        "fulfilled",
        "shipped",
        "delayed",
        "received",
        "invoice_matched",
        "payment_initiated",
        "closed",
        "cancelled",
      ],
      quote_status: [
        "draft",
        "sent",
        "revised",
        "under_review",
        "accepted",
        "rejected",
        "expired",
        "converted_to_invoice",
        "negotiating",
        "archived",
      ],
      vehicle_ownership_status: ["owned", "financed", "rented"],
      vehicle_status: [
        "active",
        "maintenance",
        "sold",
        "totaled",
        "retired",
        "stored",
        "other",
      ],
    },
  },
} as const
