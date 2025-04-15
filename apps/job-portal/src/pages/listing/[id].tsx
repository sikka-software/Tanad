import { GetServerSideProps } from 'next'
import { supabase } from '../../lib/supabase'
import { JobListing } from '../../types'

interface JobListingPageProps {
  job: JobListing | null
}

export default function JobListingPage({ job }: JobListingPageProps) {
  if (!job) {
    return <div>Job listing not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Company</h2>
          <p>{job.company}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <p>{job.location}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <ul className="list-disc pl-5">
            {job.requirements.map((req: string, index: number) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Salary</h2>
          <p>{job.salary}</p>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string }

  const { data: job, error } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching job listing:', error)
    return {
      props: {
        job: null
      }
    }
  }

  return {
    props: {
      job
    }
  }
} 