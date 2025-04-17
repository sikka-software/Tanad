import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase';

export interface ExtendedNextApiRequest extends NextApiRequest {
  user_id?: string;
}

export type ApiHandler = (
  req: ExtendedNextApiRequest, 
  res: NextApiResponse
) => Promise<unknown> | unknown;

export const withAuth = (handler: ApiHandler) => {
  return async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    try {
      // First try getting the auth directly from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (!error && data.session) {
        // Set the user ID on the request object
        req.user_id = data.session.user.id;
        console.log("User authenticated via Supabase session:", req.user_id);
        return handler(req, res);
      }
      
      // If that fails, try getting from the header or body as fallback
      const headeruser_id = req.headers['x-user-id'] as string;
      const bodyuser_id = req.body?.user_id;
      
      // Set the user ID if found in header or body
      if (headeruser_id || bodyuser_id) {
        req.user_id = headeruser_id || bodyuser_id;
        console.log("User authenticated via header/body:", req.user_id);
        return handler(req, res);
      }
      
      // If no authentication is found, return unauthorized
      return res.status(401).json({
        error: 'Unauthorized',
        detail: 'You must be logged in to access this resource',
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        detail: 'Failed to authenticate user',
      });
    }
  };
}; 