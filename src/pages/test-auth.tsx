import { useEffect, useState } from "react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";
import useUserStore from "@/hooks/use-user-store";
import { createJob } from "@/services/jobService";

export default function TestAuthPage() {
  const t = useTranslations();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createJobResult, setCreateJobResult] = useState<any>(null);
  
  // Get user from Zustand store
  const storeUser = useUserStore((state) => state.user);
  const fetchUserAndProfile = useUserStore((state) => state.fetchUserAndProfile);
  const initialized = useUserStore((state) => state.initialized);

  useEffect(() => {
    // Test direct Supabase auth
    const getSupabaseUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setSupabaseUser(data.user);
      } catch (err: any) {
        console.error("Error getting Supabase user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    getSupabaseUser();
    
    // Ensure user store is initialized
    if (!initialized || !storeUser) {
      fetchUserAndProfile();
    }
  }, [initialized, fetchUserAndProfile, storeUser]);

  const refreshUserStore = async () => {
    setLoading(true);
    await fetchUserAndProfile();
    setLoading(false);
  };

  const createTestJob = async () => {
    try {
      setCreateJobResult(null);
      
      // Get user directly from store for the userId
      const user = useUserStore.getState().user;
      
      if (!user || !user.id) {
        throw new Error("No user found in store");
      }
      
      // Call the job service that uses Zustand store
      const job = await createJob({
        title: "Test Job " + new Date().toISOString(),
        type: "Full-time",
        department: "Engineering",
        location: "Remote",
        isActive: true,
        userId: user.id // Adding userId to satisfy TypeScript, though jobService will override it
      });
      
      setCreateJobResult({ success: true, data: job });
      alert("Test job created successfully!");
    } catch (error: any) {
      console.error("Error creating test job:", error);
      setCreateJobResult({ success: false, error: error.message });
      alert(`Error: ${error.message}`);
    }
  };

  const createTestJobManual = async () => {
    try {
      setCreateJobResult(null);
      
      // Get user directly from store
      const user = useUserStore.getState().user;
      
      if (!user || !user.id) {
        throw new Error("No user found in store");
      }
      
      console.log("About to send request with user ID:", user.id);
      
      // Create the request body
      const requestBody = {
        title: "Manual Test Job " + new Date().toISOString(),
        type: "Full-time",
        department: "Testing",
        location: "Manual Test",
        isActive: true,
        userId: user.id
      };
      
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      
      // Make a direct fetch call with userId in body
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      console.log("Response from server:", result);
      
      if (!response.ok) {
        // Try alternative field name to match schema
        console.log("First attempt failed. Trying with user_id instead...");
        
        const alternativeRequestBody = {
          title: "Manual Test Job Alternative " + new Date().toISOString(),
          type: "Full-time",
          department: "Testing",
          location: "Manual Test",
          isActive: true,
          user_id: user.id  // Try alternative field name
        };
        
        console.log("Alternative request body:", JSON.stringify(alternativeRequestBody, null, 2));
        
        const alternativeResponse = await fetch("/api/jobs/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(alternativeRequestBody),
        });
        
        const alternativeResult = await alternativeResponse.json();
        console.log("Alternative response from server:", alternativeResult);
        
        if (!alternativeResponse.ok) {
          throw new Error(result.error || result.details || "Failed to create job");
        }
        
        setCreateJobResult({ success: true, data: alternativeResult });
        alert("Manual test job created successfully with alternative field name!");
        return;
      }
      
      setCreateJobResult({ success: true, data: result });
      alert("Manual test job created successfully!");
    } catch (error: any) {
      console.error("Manual job test error:", error);
      setCreateJobResult({ success: false, error: error.message });
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <PageTitle
        title="Authentication Test Page"
        createButtonLink="/jobs"
        createButtonText="Back to Jobs"
      />
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading authentication status...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Supabase Direct Auth:</h3>
                  {error ? (
                    <p className="text-red-500">{error}</p>
                  ) : supabaseUser ? (
                    <div>
                      <p className="text-green-500">User is authenticated!</p>
                      <p className="font-mono">User ID: {supabaseUser.id}</p>
                    </div>
                  ) : (
                    <p className="text-red-500">User is not authenticated</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">User Store:</h3>
                  {storeUser ? (
                    <div>
                      <p className="text-green-500">User found in store! (Initialized: {initialized ? "Yes" : "No"})</p>
                      <p className="font-mono">User ID: {storeUser.id}</p>
                    </div>
                  ) : (
                    <p className="text-red-500">No user found in store (Initialized: {initialized ? "Yes" : "No"})</p>
                  )}
                </div>
                
                {createJobResult && (
                  <div>
                    <h3 className="text-lg font-medium">Job Creation Result:</h3>
                    {createJobResult.success ? (
                      <div>
                        <p className="text-green-500">Job created successfully!</p>
                        <p className="font-mono">Job ID: {createJobResult.data.id}</p>
                      </div>
                    ) : (
                      <p className="text-red-500">Error: {createJobResult.error}</p>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <Button onClick={refreshUserStore}>
                    Refresh User Store
                  </Button>
                  <Button onClick={createTestJob}>
                    Create Job (Service)
                  </Button>
                  <Button onClick={createTestJobManual}>
                    Create Job (Manual)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
}; 