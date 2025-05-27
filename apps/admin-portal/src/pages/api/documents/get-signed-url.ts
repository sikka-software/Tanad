import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Update bucket name to match your Supabase bucket
const DOCUMENTS_BUCKET_NAME = 'enterprise-documents';
const SIGNED_URL_EXPIRES_IN = 300; // 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { filePath, documentId } = req.query;

  if (!filePath && !documentId) {
    return res.status(400).json({ error: 'filePath or documentId is required' });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        // For API routes in Pages Router, set/remove are often not directly needed for auth read operations
        // If Supabase client needs to set cookies during this operation (e.g. on token refresh),
        // you would need to handle `res.setHeader('Set-Cookie', ...)` correctly.
        // However, for getUser and createSignedUrl, this might not be invoked if session is valid.
        set(name: string, value: string, options: CookieOptions) {
          // const cookie = serializeCookieHeader(name, value, options);
          // res.setHeader('Set-Cookie', cookie);
          // console.log('Simulating cookie set (Pages Router API):', name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // const cookie = serializeCookieHeader(name, '', { ...options, maxAge: 0 });
          // res.setHeader('Set-Cookie', cookie);
          // console.log('Simulating cookie remove (Pages Router API):', name, options);
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or user not authenticated:', userError);
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // Log the user object to inspect its structure on the server
    console.log('[API get-signed-url] Authenticated user object:', JSON.stringify(user, null, 2));

    let pathToSign = filePath as string;

    // Get user's enterprise ID from memberships table
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('enterprise_id')
      .eq('profile_id', user.id)
      .single();

    if (membershipError || !membership || !membership.enterprise_id) {
      console.error(`Failed to fetch enterprise membership for user ${user.id}:`, membershipError);
      let errorMessage = 'Forbidden: Could not verify enterprise membership.';
      if (membershipError) {
          errorMessage = `Forbidden: Error fetching membership - ${membershipError.message}`;
      } else if (!membership) {
          errorMessage = 'Forbidden: User is not a member of any enterprise.';
      } else if (!membership.enterprise_id) {
          errorMessage = 'Forbidden: Enterprise ID not set for membership.';
      }
      return res.status(403).json({ error: errorMessage });
    }
    const userEnterpriseId = membership.enterprise_id;

    if (documentId) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path, enterprise_id')
        .eq('id', documentId as string)
        .single();

      if (docError || !document) {
        console.error(`Error fetching document ${documentId}:`, docError);
        return res.status(404).json({ error: 'Document not found' });
      }

      if (!userEnterpriseId) {
        console.error(`Could not determine enterprise for user ${user.id} after profile query`);
        return res.status(403).json({ error: 'Forbidden: Could not verify enterprise membership for authorization.' });
      }

      if (document.enterprise_id !== userEnterpriseId) {
        console.warn(`User ${user.id} (Enterprise: ${userEnterpriseId}) attempted to access document ${documentId} (Enterprise: ${document.enterprise_id})`);
        return res.status(403).json({ error: 'Forbidden: You do not have access to this document' });
      }
      pathToSign = document.file_path;
    } else if (filePath) {
      console.warn(
        'Generating signed URL based on filePath only. '
        + 'This is less secure as specific document ownership cannot be verified without a documentId. '
        + 'Ensure RLS is configured on your storage bucket or always use documentId for proper authorization.'
      );
      // TODO: If using filePath only, consider if your file path convention includes an enterprise_id
      // that you can parse and validate against the user's enterprise_id.
      // e.g., if filePath is like `enterprise_abc/folder/file.pdf`
      // const pathEnterpriseId = pathToSign.split('/')[0];
      // if (pathEnterpriseId !== userEnterpriseId) { ... return 403 ... }
    }

    if (!pathToSign) {
        return res.status(400).json({ error: 'Could not determine file path to sign.'});
    }

    console.log('[API get-signed-url] Attempting to create signed URL for path:', pathToSign);
    console.log('[API get-signed-url] Using bucket:', DOCUMENTS_BUCKET_NAME);

    try {
      const { data, error: signError } = await supabase.storage
        .from(DOCUMENTS_BUCKET_NAME)
        .createSignedUrl(pathToSign, SIGNED_URL_EXPIRES_IN);

      if (signError) {
        console.error('Error creating signed URL:', signError);
        return res.status(500).json({ error: 'Could not create signed URL', details: signError.message });
      }

      if (!data?.signedUrl) {
        console.error('No signed URL data returned from Supabase.');
        return res.status(500).json({ error: 'Failed to retrieve signed URL' });
      }

      console.log('[API get-signed-url] Successfully created signed URL');
      return res.status(200).json({ signedUrl: data.signedUrl });

    } catch (error: any) {
      console.error('Unexpected error in get-signed-url handler:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }

  } catch (error: any) {
    console.error('Unexpected error in get-signed-url handler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 