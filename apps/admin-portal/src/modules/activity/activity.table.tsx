import React, { useEffect, useState } from 'react';
import { fetchActivityLogs } from './activity.service';
import type { ActivityLog } from './activity.type';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming shadcn/ui table is used
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Helper function to format activity details
const formatDetails = (details: any): string => {
  if (!details) return '-';
  // Simple formatting, adjust as needed based on expected detail structures
  if (typeof details === 'object') {
    return JSON.stringify(details);
  }
  return String(details);
};

export const ActivityLogTable: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedLogs = await fetchActivityLogs();
        setLogs(fetchedLogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  if (loading) {
    // TODO: Add a proper loading skeleton component
    return <div>Loading activity...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Type</TableHead>
              <TableHead>Target Name/ID</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell title={new Date(log.created_at).toLocaleString()}>
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{log.user_email || log.user_id}</TableCell>
                  <TableCell>{log.action_type}</TableCell>
                  <TableCell>{log.target_type}</TableCell>
                  <TableCell>{log.target_name || log.target_id}</TableCell>
                  <TableCell className="max-w-xs truncate" title={formatDetails(log.details)}>
                      {formatDetails(log.details)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 