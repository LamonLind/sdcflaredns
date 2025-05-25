"use client";

import type { CloudflareDnsRecord } from "@/types/dns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3, Trash2, ArrowUpDown, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface DnsRecordTableProps {
  records: CloudflareDnsRecord[];
  onEdit: (record: CloudflareDnsRecord) => void;
  onDelete: (recordId: string) => void;
  onSort: (column: keyof CloudflareDnsRecord | 'actions') => void;
  sortConfig: { key: keyof CloudflareDnsRecord | 'actions' ; direction: 'ascending' | 'descending' } | null;
  isLoading: boolean;
}

export function DnsRecordTable({ records, onEdit, onDelete, onSort, sortConfig, isLoading }: DnsRecordTableProps) {
  const getSortIndicator = (column: keyof CloudflareDnsRecord | 'actions') => {
    if (!sortConfig || sortConfig.key !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };
  
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center">
            <div className="flex justify-center items-center">
              <LoadingSpinner size={32} />
              <span className="ml-2">Loading records...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (records.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center">
            No DNS records found.
          </TableCell>
        </TableRow>
      );
    }

    return records.map((record) => (
      <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
        <TableCell>
          <Badge variant={record.type === 'A' || record.type === 'CNAME' ? "default" : "secondary"}>
            {record.type}
          </Badge>
        </TableCell>
        <TableCell className="font-medium">{record.name}</TableCell>
        <TableCell className="max-w-xs truncate" title={record.content}>{record.content}</TableCell>
        <TableCell>{record.ttl === 1 ? "Auto" : record.ttl}</TableCell>
        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`inline-flex items-center p-1 rounded-full ${record.proxied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {record.proxied ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{record.proxied ? "Proxied (Orange Cloud)" : "DNS Only (Grey Cloud)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="space-x-2 text-right">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onEdit(record)} aria-label="Edit Record">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Record</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)} aria-label="Delete Record">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Record</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>
    ));
  };


  const SortableHeader = ({ column, label }: { column: keyof CloudflareDnsRecord | 'actions', label: string }) => (
    <TableHead onClick={() => onSort(column)} className="cursor-pointer hover:bg-accent/50 transition-colors">
      <div className="flex items-center">
        {label}
        {getSortIndicator(column)}
      </div>
    </TableHead>
  );
  
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <SortableHeader column="type" label="Type" />
            <SortableHeader column="name" label="Name" />
            <SortableHeader column="content" label="Content" />
            <SortableHeader column="ttl" label="TTL" />
            <SortableHeader column="proxied" label="Proxied" />
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableContent()}
        </TableBody>
      </Table>
    </div>
  );
}
