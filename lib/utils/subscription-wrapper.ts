import { enforceSubscription } from "./subscription-guard";
import { currentUser } from "@/lib/helpers/current-user";

export function withSubscriptionCheck<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    let user: any = null;
    try {
      // Get current user to extract storeId
      user = await currentUser();
      if (!user?.storeId) {
        throw new Error("SUBSCRIPTION_BLOCKED: No store access");
      }

      // Enforce subscription before executing action
      await enforceSubscription(user.storeId);
      
      // Execute the original action
      return await action(...args);
    } catch (error: any) {
      if (error?.message?.startsWith("SUBSCRIPTION_BLOCKED:")) {
        // Return a standardized subscription error response
        return {
          success: false,
          error: "SUBSCRIPTION_EXPIRED",
          message: error.message.replace("SUBSCRIPTION_BLOCKED: ", ""),
          redirectTo: user?.storeId ? `/dashboard/${user.storeId}/billing` : "/billing"
        } as R;
      }
      throw error;
    }
  };
}

// For actions that need storeId as first parameter
export function withSubscriptionCheckByStoreId<T extends [string, ...any[]], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const [storeId] = args;
    
    // Validate storeId is a string
    if (typeof storeId !== 'string') {
      console.error('Invalid storeId type:', typeof storeId, storeId);
      throw new Error('Invalid storeId: must be a string');
    }
    
    try {
      // Enforce subscription before executing action
      await enforceSubscription(storeId);
      
      // Execute the original action
      return await action(...args);
    } catch (error: any) {
      if (error?.message?.startsWith("SUBSCRIPTION_BLOCKED:")) {
        return {
          success: false,
          error: "SUBSCRIPTION_EXPIRED", 
          message: error.message.replace("SUBSCRIPTION_BLOCKED: ", ""),
          redirectTo: `/dashboard/${storeId}/billing`,
        } as R;
      }
      throw error;
    }
  };
}