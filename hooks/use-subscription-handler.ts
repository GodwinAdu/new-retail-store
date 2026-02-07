"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

export function useSubscriptionHandler() {
  const router = useRouter();

  const handleSubscriptionError = useCallback((error: any) => {
    if (error?.error === "SUBSCRIPTION_EXPIRED") {
      toast.error("Subscription Expired", {
        description: error.message || "Please renew your subscription to continue.",
        action: {
          label: "Renew",
          onClick: () => router.push(error.redirectTo || "/billing")
        },
        duration: 10000
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(error.redirectTo || "/billing");
      }, 2000);
      
      return true; // Indicates the error was handled
    }
    return false; // Let other error handlers deal with it
  }, [router]);

  const executeWithSubscriptionCheck = useCallback(async <T>(
    action: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await action();
      
      // Check if result indicates subscription error
      if (result && typeof result === 'object' && 'error' in result) {
        if (handleSubscriptionError(result)) {
          return null;
        }
      }
      
      return result;
    } catch (error) {
      if (!handleSubscriptionError(error)) {
        // Handle other errors
        toast.error(errorMessage || "An error occurred");
        console.error(error);
      }
      return null;
    }
  }, [handleSubscriptionError]);

  return {
    handleSubscriptionError,
    executeWithSubscriptionCheck
  };
}