export interface JobListing {
  id: string
  title: string
  description: string | null
  isActive: boolean
  slug: string
  createdAt: string
  updatedAt: string
  userId: string
} 