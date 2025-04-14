import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase';

export interface ExtendedNextApiRequest extends NextApiRequest {
  userId?: string;
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
        req.userId = data.session.user.id;
        console.log("User authenticated via Supabase session:", req.userId);
        return handler(req, res);
      }
      
      // If that fails, try getting from the header or body as fallback
      const headerUserId = req.headers['x-user-id'] as string;
      const bodyUserId = req.body?.userId;
      
      // Set the user ID if found in header or body
      if (headerUserId || bodyUserId) {
        req.userId = headerUserId || bodyUserId;
        console.log("User authenticated via header/body:", req.userId);
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