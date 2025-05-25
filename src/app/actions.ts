"use server";
import type { CloudflareDnsRecord, DnsRecordFormData, CloudflareApiErrorResponse, CloudflareApiSuccessResponse } from "@/types/dns";

const CLOUDFLARE_API_BASE_URL = "https://api.cloudflare.com/client/v4";

async function makeCloudflareRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  apiToken: string,
  zoneId: string,
  body?: any
): Promise<T> {
  const headers = {
    "Authorization": `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  const url = `${CLOUDFLARE_API_BASE_URL}/zones/${zoneId}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store', // Ensure fresh data
    });

    const data: CloudflareApiSuccessResponse<T> | CloudflareApiErrorResponse = await response.json();

    if (!data.success) {
      const errorMessages = data.errors.map(err => `Error ${err.code}: ${err.message}`).join(", ");
      throw new Error(errorMessages || "Cloudflare API request failed");
    }
    
    return (data as CloudflareApiSuccessResponse<T>).result;

  } catch (error) {
    if (error instanceof Error) {
      console.error(`Cloudflare API Error (${method} ${url}):`, error.message);
      throw new Error(`Cloudflare API request failed: ${error.message}`);
    }
    console.error(`Cloudflare API Error (${method} ${url}): Unknown error`);
    throw new Error("An unknown error occurred while communicating with Cloudflare API.");
  }
}

export async function fetchDnsRecordsAction(apiToken: string, zoneId: string): Promise<CloudflareDnsRecord[]> {
  if (!apiToken || !zoneId) {
    throw new Error("API Token and Zone ID are required.");
  }
  return makeCloudflareRequest<CloudflareDnsRecord[]>(`/dns_records`, "GET", apiToken, zoneId);
}

export async function createDnsRecordAction(apiToken: string, zoneId: string, data: DnsRecordFormData): Promise<CloudflareDnsRecord> {
  if (!apiToken || !zoneId) {
    throw new Error("API Token and Zone ID are required.");
  }
  const payload: any = {
    type: data.type,
    name: data.name,
    content: data.content,
    ttl: data.ttl,
    proxied: data.proxied ?? false,
  };
  if (data.type === "MX" && data.priority !== undefined) {
    payload.priority = data.priority;
  }
  return makeCloudflareRequest<CloudflareDnsRecord>(`/dns_records`, "POST", apiToken, zoneId, payload);
}

export async function updateDnsRecordAction(apiToken: string, zoneId: string, recordId: string, data: DnsRecordFormData): Promise<CloudflareDnsRecord> {
  if (!apiToken || !zoneId || !recordId) {
    throw new Error("API Token, Zone ID, and Record ID are required.");
  }
   const payload: any = {
    type: data.type,
    name: data.name,
    content: data.content,
    ttl: data.ttl,
    proxied: data.proxied ?? false,
  };
  if (data.type === "MX" && data.priority !== undefined) {
    payload.priority = data.priority;
  }
  return makeCloudflareRequest<CloudflareDnsRecord>(`/dns_records/${recordId}`, "PUT", apiToken, zoneId, payload);
}

export async function deleteDnsRecordAction(apiToken: string, zoneId: string, recordId: string): Promise<{ id: string }> {
   if (!apiToken || !zoneId || !recordId) {
    throw new Error("API Token, Zone ID, and Record ID are required.");
  }
  // The delete operation returns an object with the id of the deleted record.
  return makeCloudflareRequest<{ id: string }>(`/dns_records/${recordId}`, "DELETE", apiToken, zoneId);
}
