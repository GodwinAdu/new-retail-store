export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isBlocked: boolean;
  daysRemaining: number;
  gracePeriodDays: number;
  message?: string;
}

export async function checkSubscriptionStatus(storeId?: string): Promise<SubscriptionStatus> {
  try {
    // Client-side check - make API call
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/subscription/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }
      
      return await response.json();
    }

    // Server-side check - dynamic import to avoid client-side issues
    const { connectToDB } = await import("@/lib/mongoose");
    const { default: Store } = await import("@/lib/models/store.models");
    const { currentUser } = await import("@/lib/helpers/current-user");
    
    await connectToDB();
    
    let store;
    if (storeId) {
      store = await Store.findById(storeId);
    } else {
      const user = await currentUser();
      if (!user?.storeId) {
        return {
          isActive: false,
          isExpired: true,
          isBlocked: true,
          daysRemaining: 0,
          gracePeriodDays: 0,
          message: "No store found"
        };
      }
      store = await Store.findById(user.storeId);
    }

    if (!store) {
      return {
        isActive: false,
        isExpired: true,
        isBlocked: true,
        daysRemaining: 0,
        gracePeriodDays: 0,
        message: "Store not found"
      };
    }

    const now = new Date();
    const subscriptionExpiry = new Date(store.subscriptionPlan.subscriptionExpiry);
    const trialEndsAt = new Date(store.subscriptionPlan.trialEndsAt);
    
    // Check if manually blocked
    if (store.subscriptionPlan.isBlocked || store.banned) {
      return {
        isActive: false,
        isExpired: true,
        isBlocked: true,
        daysRemaining: 0,
        gracePeriodDays: 0,
        message: store.banned ? "Store is banned" : "Subscription is blocked"
      };
    }

    // Calculate days remaining
    const effectiveExpiry = subscriptionExpiry > trialEndsAt ? subscriptionExpiry : trialEndsAt;
    const daysRemaining = Math.ceil((effectiveExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Grace period: 7 days after expiry
    const gracePeriodDays = 7;
    const gracePeriodEnd = new Date(effectiveExpiry.getTime() + (gracePeriodDays * 24 * 60 * 60 * 1000));
    
    // Check if subscription is active
    const isActive = now <= effectiveExpiry;
    const isExpired = now > effectiveExpiry;
    const isInGracePeriod = isExpired && now <= gracePeriodEnd;
    const isBlocked = now > gracePeriodEnd;

    // Auto-block if grace period is over
    if (isBlocked && !store.subscriptionPlan.isBlocked) {
      await Store.findByIdAndUpdate(store._id, {
        'subscriptionPlan.isBlocked': true,
        'subscriptionPlan.blockedAt': now
      });
    }

    return {
      isActive: isActive || isInGracePeriod,
      isExpired,
      isBlocked,
      daysRemaining: Math.max(0, daysRemaining),
      gracePeriodDays: isInGracePeriod ? Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      message: isBlocked 
        ? "Subscription expired. Please renew to continue using the service."
        : isInGracePeriod 
        ? `Subscription expired. ${Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days remaining in grace period.`
        : undefined
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return {
      isActive: false,
      isExpired: true,
      isBlocked: true,
      daysRemaining: 0,
      gracePeriodDays: 0,
      message: "Error checking subscription status"
    };
  }
}

export async function enforceSubscription(storeId?: string) {
  const status = await checkSubscriptionStatus(storeId);
  
  if (status.isBlocked) {
    throw new Error(`SUBSCRIPTION_BLOCKED: ${status.message}`);
  }
  
  return status;
}