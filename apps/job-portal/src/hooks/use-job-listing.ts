import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { JobListing } from '../types'

export function useJobListing(id: string) {
  return useQuery({
    queryKey: ['job-listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data as JobListing
    },
  })
} 