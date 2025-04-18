import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUserStore from "@/hooks/use-user-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function TestAuth() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, profile } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setSessionInfo({ error: error.message });
        } else {
          setSessionInfo(data);
        }
      } catch (e) {
        console.error('Exception when checking session:', e);
        setSessionInfo({ exception: String(e) });
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
  }, []);

  const handleSignIn = async () => {
    router.push('/auth');
  };

  const handleAddDepartment = () => {
    router.push('/departments/add');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Session Information:</h2>
          {loading ? (
            <p>Loading session information...</p>
          ) : (
            <pre className="bg-muted p-4 rounded overflow-auto max-h-[400px]">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          )}

          <h2 className="text-xl font-bold mt-8 mb-4">User Store State:</h2>
          <div className="bg-muted p-4 rounded">
            <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>User Email:</strong> {user.email}</p>
              </>
            )}
            {profile && (
              <p><strong>Profile Name:</strong> {profile.full_name}</p>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <Button onClick={handleSignIn}>
              Go to Login Page
            </Button>
            <Button onClick={handleAddDepartment}>
              Try Add Department Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 