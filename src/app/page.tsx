"use client";

import { useState, useEffect, useMemo } from "react";
import type { CloudflareDnsRecord, DnsRecordFormData } from "@/types/dns";
import { AuthForm } from "@/components/cloudflare/AuthForm";
import { DnsRecordTable } from "@/components/cloudflare/DnsRecordTable";
import { DnsRecordForm } from "@/components/cloudflare/DnsRecordForm";
import { DeleteConfirmationDialog } from "@/components/cloudflare/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  fetchDnsRecordsAction,
  createDnsRecordAction,
  updateDnsRecordAction,
  deleteDnsRecordAction,
} from "./actions";
import { PlusCircle, Search, LogOut, RefreshCw, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CloudflareDnsManagerPage() {
  const [apiToken, setApiToken] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [dnsRecords, setDnsRecords] = useState<CloudflareDnsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof CloudflareDnsRecord | 'actions'; direction: 'ascending' | 'descending' } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CloudflareDnsRecord | null>(null);
  
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const recordToDelete = useMemo(() => dnsRecords.find(r => r.id === deletingRecordId), [dnsRecords, deletingRecordId]);

  const { toast } = useToast();

  // Load credentials from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("cfApiToken");
    const storedZoneId = localStorage.getItem("cfZoneId");
    if (storedToken && storedZoneId) {
      setApiToken(storedToken);
      setZoneId(storedZoneId);
      // setIsAuthenticated(true); // Delay auth until successful fetch
      // handleFetchRecords(storedToken, storedZoneId);
    }
  }, []);


  const handleConnect = async (token: string, zone: string) => {
    setIsAuthLoading(true);
    setError(null);
    try {
      const records = await fetchDnsRecordsAction(token, zone);
      setDnsRecords(records);
      setApiToken(token);
      setZoneId(zone);
      setIsAuthenticated(true);
      localStorage.setItem("cfApiToken", token);
      localStorage.setItem("cfZoneId", zone);
      toast({ title: "Success", description: "Connected to Cloudflare and records fetched." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect or fetch records.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  };
  
  const handleRefreshRecords = async () => {
    if (!apiToken || !zoneId) {
      toast({ title: "Error", description: "API Token and Zone ID are missing.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const records = await fetchDnsRecordsAction(apiToken, zoneId);
      setDnsRecords(records);
      toast({ title: "Success", description: "DNS records refreshed." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh records.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: DnsRecordFormData) => {
    setIsActionLoading(true);
    try {
      if (editingRecord) {
        await updateDnsRecordAction(apiToken, zoneId, editingRecord.id, data);
        toast({ title: "Success", description: "DNS record updated successfully." });
      } else {
        await createDnsRecordAction(apiToken, zoneId, data);
        toast({ title: "Success", description: "DNS record created successfully." });
      }
      setIsFormOpen(false);
      setEditingRecord(null);
      handleRefreshRecords(); // Refresh records after an update or create
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save record.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecordId) return;
    setIsActionLoading(true);
    try {
      await deleteDnsRecordAction(apiToken, zoneId, deletingRecordId);
      toast({ title: "Success", description: "DNS record deleted successfully." });
      setDeletingRecordId(null);
      handleRefreshRecords(); // Refresh records after a delete
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete record.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEdit = (record: CloudflareDnsRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (recordId: string) => {
    setDeletingRecordId(recordId);
  };

  const handleSort = (key: keyof CloudflareDnsRecord | 'actions') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleLogout = () => {
    setApiToken("");
    setZoneId("");
    setDnsRecords([]);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem("cfApiToken");
    localStorage.removeItem("cfZoneId");
    toast({ title: "Logged Out", description: "You have been logged out." });
  };


  const filteredAndSortedRecords = useMemo(() => {
    let filtered = dnsRecords.filter(
      (record) =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null && sortConfig.key !== 'actions') {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
         if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          return sortConfig.direction === 'ascending' ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
        }
        return 0;
      });
    }
    return filtered;
  }, [dnsRecords, searchTerm, sortConfig]);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Cloudflare DNS Manager</h1>
      </header>

      {!isAuthenticated ? (
        <AuthForm onConnect={handleConnect} isLoading={isAuthLoading} initialApiToken={apiToken} initialZoneId={zoneId}/>
      ) : (
        <div className="space-y-6 flex-grow flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
            <div className="relative w-full sm:max-w-xs">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search records (name, content)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefreshRecords} variant="outline" disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Record
              </Button>
               <Button onClick={handleLogout} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive rounded-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> 
              <p>{error}</p>
            </div>
          )}

          <div className="flex-grow">
            <DnsRecordTable
              records={filteredAndSortedRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSort={handleSort}
              sortConfig={sortConfig}
              isLoading={isLoading && dnsRecords.length === 0} /* Show table loading only on initial load */
            />
          </div>
        </div>
      )}

      <DnsRecordForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
        isLoading={isActionLoading}
      />

      <DeleteConfirmationDialog
        isOpen={!!deletingRecordId}
        onOpenChange={() => setDeletingRecordId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
        recordName={recordToDelete?.name}
      />
    </div>
  );
}
