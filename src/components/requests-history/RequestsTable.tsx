"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Video, Copy, Check, Info } from "lucide-react";
import { ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Request {
  id: string;
  request_id?: string;
  prompt: string;
  type: "image" | "video";
  status: string;
  created_at: string;
  aspect_ratio: string;
  duration?: string;
  output_image?: string;
  url?: string;
  error?: string;
}

interface RequestsTableProps {
  requests: Request[];
}

const RequestsTable = ({ requests }: RequestsTableProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        title="No requests found"
        description="You haven't made any image or video generation requests yet."
        icon={<ImageIcon className="h-12 w-12" />}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full bg-gradient-to-tl from-background to-muted/50 border border-primary/10 shadow-lg">
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Settings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={`${request.type}-${request.id}`}>
                <TableCell>
                  <div className="flex items-center">
                    {request.type === "image" ? (
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-primary/5 mr-2 border border-primary/10">
                        {request.status === "completed" && request.output_image ? (
                          <NextImage 
                            width={56} 
                            height={56} 
                            src={request.output_image} 
                            alt="Generated image" 
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-primary/5 mr-2 border border-primary/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="ml-2 capitalize">{request.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{request.request_id ? request.request_id.substring(0, 8) : request.id.substring(0, 8)}...</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => {
                        const idToCopy = request.request_id || request.id;
                        navigator.clipboard.writeText(idToCopy);
                        toast.success("ID copied to clipboard");
                        setCopiedId(idToCopy);
                        
                        // Reset the copied state after 2 seconds
                        setTimeout(() => {
                          setCopiedId(null);
                        }, 2000);
                      }}
                    >
                      {copiedId === request.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(request.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="truncate cursor-pointer border-b border-dotted border-muted-foreground flex items-center gap-1">
                        <span>{request.prompt}</span>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-md">
                      <div className="font-medium text-sm mb-2">Prompt:</div>
                      <div className="text-sm whitespace-normal">{request.prompt}</div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs space-y-1">
                    <span>Ratio: {request.aspect_ratio}</span>
                    {request.type === "video" && request.duration && (
                      <span>Duration: {request.duration}s</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(request.status)} capitalize`}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {request.status === "completed" && (
                    <Button variant="outline" size="sm" asChild>
                      {request.type === "image" && request.output_image ? (
                        <a 
                          href={request.output_image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      ) : request.type === "video" && request.url ? (
                        <a 
                          href={request.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      ) : (
                        <Link
                          href={request.type === "image" ? "/gallery/images" : "gallery/videos"}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Link>
                      )}
                    </Button>
                  )}
                  {(request.status === "failed" || request.status === "error") && (
                    <div className="text-xs text-red-500">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="truncate max-w-[150px] cursor-pointer border-b border-dotted border-red-300 flex items-center gap-1">
                            <span>{request.error || "Unknown error"}</span>
                            <Info className="h-3 w-3" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-md">
                          <div className="font-medium text-sm mb-2 text-red-500">Error details:</div>
                          <div className="text-sm whitespace-normal">{request.error || "Unknown error"}</div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RequestsTable; 