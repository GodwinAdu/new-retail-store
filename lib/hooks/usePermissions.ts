"use client";

import { useEffect, useState } from "react";
import { hasPermission, hasAnyPermission, hasAllPermissions, type Permission, type Role } from "@/lib/permissions";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  storeId: string;
}

export function usePermissions(user?: User) {
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  
  useEffect(() => {
    if (!user && !currentUser) {
      // Get user from window object if passed from server
      const userData = (window as any).__USER_DATA__;
      if (userData) {
        setCurrentUser(userData);
      }
    }
  }, [user, currentUser]);

  const userRole = (currentUser?.role || 'cashier') as Role;

  return {
    userRole,
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    canManageStaff: hasPermission(userRole, 'manage_staff'),
    canViewReports: hasPermission(userRole, 'view_reports'),
    canManageInventory: hasPermission(userRole, 'manage_inventory'),
    canUsePOS: hasPermission(userRole, 'use_pos')
  };
}