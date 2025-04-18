import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { JobListing } from '../types'

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')

      if (error) {
        throw error
      }

      return data as JobListing[]
    },
  })
} 