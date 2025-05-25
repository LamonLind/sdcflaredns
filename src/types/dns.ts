export interface CloudflareDnsRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: DnsRecordType;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number; // 1 for 'automatic' or 60-86400
  locked: boolean;
  meta: any;
  comment: string | null;
  tags: string[];
  created_on: string;
  modified_on: string;
}

export type DnsRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV" | "NS" | "CAA" | "PTR" | "SPF" | "CERT" | "DNSKEY" | "DS" | "NAPTR" | "SMIMEA" | "SSHFP" | "SVCB" | "TLSA" | "URI";

export const DnsRecordTypes: DnsRecordType[] = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS", "CAA", "PTR", "SPF"];


export interface DnsRecordFormData {
  type: DnsRecordType;
  name: string;
  content: string;
  ttl: number;
  proxied?: boolean;
  priority?: number; // For MX records
}

export interface CloudflareApiErrorResponse {
  success: boolean;
  errors: { code: number; message: string }[];
  messages: { code: number; message: string }[];
  result: null;
}

export interface CloudflareApiSuccessResponse<T> {
  success: boolean;
  errors: [];
  messages: { code: number; message: string }[];
  result: T;
  result_info?: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
    total_pages: number;
  };
}
