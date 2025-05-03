export type ActivityLog = {
  id: string;
  enterprise_id: string;
  user_id: string;
  action_type: string; // Consider defining an enum if possible/consistent
  target_type: string; // Consider defining an enum
  target_id: string;
  target_name: string | null;
  details: any | null; // JSONB maps to any/unknown
  created_at: string; // Timestamps usually come as strings
  // Add related fields fetched via API, e.g.:
  user_email?: string;
};

// Type for data returned by the API list endpoint
export type ActivityLogDisplay = ActivityLog & {
  user_email?: string; // Example if API joins profile
};

// No Create/Update needed for logs via service
