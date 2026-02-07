"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Clock } from "lucide-react";
import { checkSubscriptionStatus, SubscriptionStatus } from "@/lib/utils/subscription-guard";

interface SubscriptionBlockerProps {
  storeId?: string;
  children: React.ReactNode;
}

export default function SubscriptionBlocker({ storeId, children }: SubscriptionBlockerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await checkSubscriptionStatus(storeId);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
    // Check every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (subscriptionStatus?.isBlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Subscription Expired</CardTitle>
            <CardDescription>
              {subscriptionStatus.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Your subscription has expired and the grace period is over. 
              Please renew your subscription to continue using the POS system.
            </div>
            <Button 
              onClick={() => router.push(`/dashboard/${storeId}/billing`)} 
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Renew Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscriptionStatus?.isExpired && subscriptionStatus?.gracePeriodDays > 0) {
    return (
      <div className="relative">
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-400 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-orange-700">
                <strong>Subscription Expired:</strong> {subscriptionStatus.gracePeriodDays} days remaining in grace period.
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => router.push(`/dashboard/${storeId}/billing`)}
                  className="ml-2 p-0 h-auto text-orange-700 underline"
                >
                  Renew now
                </Button>
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}