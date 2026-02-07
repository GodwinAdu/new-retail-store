"use client"

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Permission, Role } from '@/lib/permissions';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  user: any;
  requiredPermissions?: Permission[];
  requiredRole?: Role;
  requireAny?: boolean; // If true, user needs ANY of the permissions, if false, needs ALL
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  user,
  requiredPermissions = [],
  requiredRole,
  requireAny = false,
  fallback
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canAccessRole } = usePermissions(user);

  // Check role-based access
  if (requiredRole && !canAccessRole(requiredRole)) {
    return fallback || <AccessDenied />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAny 
      ? hasAnyPermission(requiredPermissions)
      : hasAllPermissions(requiredPermissions);
    
    if (!hasAccess) {
      return fallback || <AccessDenied />;
    }
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-300 text-sm font-medium">Insufficient Permissions</span>
          </div>
        </div>
      </div>
    </div>
  );
}