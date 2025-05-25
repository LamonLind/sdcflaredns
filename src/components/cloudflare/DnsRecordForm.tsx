"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { DnsRecordFormData, DnsRecordType, CloudflareDnsRecord } from "@/types/dns";
import { DnsRecordTypes } from "@/types/dns";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const formSchema = z.object({
  type: z.custom<DnsRecordType>((val) => DnsRecordTypes.includes(val as DnsRecordType), {
    message: "Invalid DNS record type",
  }),
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  ttl: z.coerce.number().min(1, "TTL must be at least 1 (or 60-86400)"), // 1 for automatic
  proxied: z.boolean().optional(),
  priority: z.coerce.number().optional(), // For MX records
});

interface DnsRecordFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: DnsRecordFormData) => Promise<void>;
  initialData?: CloudflareDnsRecord | null;
  isLoading: boolean;
}

export function DnsRecordForm({ isOpen, onOpenChange, onSubmit, initialData, isLoading }: DnsRecordFormProps) {
  const form = useForm<DnsRecordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "A",
      name: initialData?.name || "",
      content: initialData?.content || "",
      ttl: initialData?.ttl || 3600, // Default to 1 hour or Cloudflare's automatic
      proxied: initialData?.proxied ?? false,
      priority: (initialData?.meta as any)?.priority ?? 10,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        name: initialData.name,
        content: initialData.content,
        ttl: initialData.ttl,
        proxied: initialData.proxied,
        priority: (initialData.meta as any)?.priority ?? (initialData.type === "MX" ? 10 : undefined),
      });
    } else {
      form.reset({
        type: "A",
        name: "",
        content: "",
        ttl: 3600,
        proxied: false,
        priority: 10,
      });
    }
  }, [initialData, form, isOpen]);

  const watchType = form.watch("type");

  const handleFormSubmit = async (values: DnsRecordFormData) => {
    await onSubmit(values);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit DNS Record" : "Create DNS Record"}</SheetTitle>
          <SheetDescription>
            {initialData ? "Modify the details of your DNS record." : "Add a new DNS record to your zone."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select DNS record type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DnsRecordTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., example.com or www" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 192.0.2.1 or your.cname.target" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchType === "MX" && (
               <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="ttl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TTL (Time To Live)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 3600 for 1 hour, 1 for Auto" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            { (initialData?.proxiable || watchType === 'A' || watchType === 'AAAA' || watchType === 'CNAME') && (
              <FormField
                control={form.control}
                name="proxied"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Proxied</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable Cloudflare proxy (Orange Cloud)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <SheetFooter className="pt-6">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? <LoadingSpinner size={20} /> : (initialData ? "Save Changes" : "Create Record")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
