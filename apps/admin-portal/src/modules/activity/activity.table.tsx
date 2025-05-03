"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLogTableProps {
  eventType?: string;
}

// Mock data for the activity log
const mockActivityData = [
  {
    id: "1",
    timestamp: "2025-05-03T07:30:00Z",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "User login",
    resource: "Dashboard",
    ipAddress: "192.168.1.1",
    status: "success",
    details: "Successful login from Chrome on macOS",
  },
  {
    id: "2",
    timestamp: "2025-05-03T07:15:22Z",
    user: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Deployment",
    resource: "Production",
    ipAddress: "192.168.1.45",
    status: "success",
    details: "Deployed version v2.3.0 to production",
  },
  {
    id: "3",
    timestamp: "2025-05-03T06:58:10Z",
    user: {
      name: "Alex Rodriguez",
      email: "alex.r@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Permission change",
    resource: "User Management",
    ipAddress: "192.168.2.15",
    status: "warning",
    details: "Changed role from Developer to Admin for user james.smith@example.com",
  },
  {
    id: "4",
    timestamp: "2025-05-03T06:45:33Z",
    user: {
      name: "Emily Wilson",
      email: "e.wilson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "API key created",
    resource: "Security",
    ipAddress: "192.168.3.22",
    status: "success",
    details: "Created new API key for integration with CRM system",
  },
  {
    id: "5",
    timestamp: "2025-05-03T06:30:15Z",
    user: {
      name: "James Smith",
      email: "j.smith@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Failed login attempt",
    resource: "Authentication",
    ipAddress: "203.0.113.42",
    status: "error",
    details: "Multiple failed login attempts detected from unknown IP",
  },
  {
    id: "6",
    timestamp: "2025-05-03T06:15:00Z",
    user: {
      name: "Lisa Wang",
      email: "l.wang@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Environment variable updated",
    resource: "Configuration",
    ipAddress: "192.168.1.30",
    status: "success",
    details: "Updated DATABASE_URL in staging environment",
  },
  {
    id: "7",
    timestamp: "2025-05-03T06:00:45Z",
    user: {
      name: "David Kim",
      email: "d.kim@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "User invited",
    resource: "Team Management",
    ipAddress: "192.168.4.10",
    status: "success",
    details: "Invited new user olivia.parker@example.com with Developer role",
  },
  {
    id: "8",
    timestamp: "2025-05-03T05:45:30Z",
    user: {
      name: "System",
      email: "system@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Automatic backup",
    resource: "Database",
    ipAddress: "10.0.0.5",
    status: "success",
    details: "Scheduled daily backup completed successfully",
  },
  {
    id: "9",
    timestamp: "2025-05-03T05:30:15Z",
    user: {
      name: "Robert Taylor",
      email: "r.taylor@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Domain added",
    resource: "Domains",
    ipAddress: "192.168.5.20",
    status: "warning",
    details: "Added domain example-staging.com but DNS verification pending",
  },
  {
    id: "10",
    timestamp: "2025-05-03T05:15:00Z",
    user: {
      name: "Olivia Parker",
      email: "o.parker@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Project created",
    resource: "Projects",
    ipAddress: "192.168.6.25",
    status: "success",
    details: "Created new project 'Customer Portal v2'",
  },
];

export function ActivityLogTable({ eventType }: ActivityLogTableProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(mockActivityData.length / itemsPerPage);

  // Filter data based on eventType if provided
  const filteredData = eventType
    ? mockActivityData.filter((item) => {
        if (eventType === "user")
          return (
            item.resource.includes("User") ||
            item.action.includes("User") ||
            item.action.includes("login")
          );
        if (eventType === "deployment")
          return item.action.includes("Deploy") || item.resource.includes("Production");
        if (eventType === "security")
          return (
            item.resource.includes("Security") ||
            item.action.includes("login") ||
            item.action.includes("API") ||
            item.status === "error"
          );
        return true;
      })
    : mockActivityData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700"
          >
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-yellow-200 bg-yellow-50 text-yellow-700"
          >
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700"
          >
            <AlertTriangle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700"
          >
            <Info className="h-3 w-3" />
            Info
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="max-w-[300px] w-[300px]">User</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{formatDate(activity.timestamp)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.user.avatar || "/placeholder.svg"}
                        alt={activity.user.name}
                      />
                      <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{activity.user.name}</div>
                      <div className="text-muted-foreground text-xs">{activity.user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{activity.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing <strong>{filteredData.length}</strong> of{" "}
          <strong>{mockActivityData.length}</strong> events
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
