"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface StoreRedirectProps {
  storeId: string;
  branches: Array<{ _id: string }>;
}

export default function StoreRedirect({ storeId, branches }: StoreRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const lastBranchId = localStorage.getItem(`lastBranch_${storeId}`);
    
    if (lastBranchId && branches.some(b => b._id === lastBranchId)) {
      router.replace(`/dashboard/${storeId}/${lastBranchId}`);
    } else {
      router.replace(`/dashboard/${storeId}/${branches[0]._id}`);
    }
  }, [storeId, branches, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
