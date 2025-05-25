"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, KeyRound, Globe } from "lucide-react";

interface AuthFormProps {
  onConnect: (apiToken: string, zoneId: string) => void;
  isLoading: boolean;
  initialApiToken?: string;
  initialZoneId?: string;
}

export function AuthForm({ onConnect, isLoading, initialApiToken = "", initialZoneId = "" }: AuthFormProps) {
  const [apiToken, setApiToken] = useState(initialApiToken);
  const [zoneId, setZoneId] = useState(initialZoneId);
  const [showApiToken, setShowApiToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(apiToken, zoneId);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Connect to Cloudflare</CardTitle>
        <CardDescription className="text-center">
          Enter your API token and Zone ID to manage DNS records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="apiToken"
                type={showApiToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Your Cloudflare API Token"
                required
                className="pl-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowApiToken(!showApiToken)}
                aria-label={showApiToken ? "Hide API token" : "Show API token"}
              >
                {showApiToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zoneId">Zone ID</Label>
             <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="zoneId"
                type="text"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                placeholder="Your Cloudflare Zone ID"
                required
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? "Connecting..." : "Fetch DNS Records"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
