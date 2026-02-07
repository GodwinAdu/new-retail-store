# Branch Feature Removal - Migration Guide

## Overview
The retail POS system has been simplified from a multi-branch architecture to a single-store management system. This document outlines all changes made.

## Key Changes

### 1. Database Models Updated
- **Store Model** (`lib/models/store.models.ts`)
  - Removed: `numberOfBranches` field
  - Removed: `branchIds` array

- **User Model** (`lib/models/user.models.ts`)
  - Removed: `accessLocation` array (branch access)

- **All Other Models** (Product, Sale, Customer, Category, etc.)
  - Removed: `branchId` field from all models

### 2. Type Definitions Updated
- **lib/types.d.ts**
  - Removed `branchId` from all interfaces:
    - IUser, IStore, ICategory, IProduct, ICustomer
    - ISocialPost, IOfflineSale, INotification, ISale
  - Removed `numberOfBranches` and `branchIds` from IStore
  - Removed `accessLocation` from IUser

### 3. Authentication Changes
- **lib/actions/auth.actions.ts**
  - Removed Branch model import
  - Removed branch selection logic from signIn
  - Removed branchId cookie management
  - Simplified redirect to `/dashboard/{storeId}`

### 4. Billing System Updated
- **lib/actions/billing.actions.ts**
  - Changed from per-branch to per-store pricing
  - Price: ₵80 per store per month (was ₵80 per branch)
  - Removed branch counting logic
  - Simplified billing calculation

### 5. Dashboard Actions Updated
- **lib/actions/dashboard.actions.ts**
  - Removed `branchId` parameter from `getDashboardData`
  - Updated all database queries to filter by `storeId` only
  - Signature: `getDashboardData(storeId, startDate?, endDate?)`

### 6. Sale Actions Updated
- **lib/actions/sale.actions.ts**
  - Removed `branchId` parameter from all functions:
    - `getSales(storeId, limit?, startDate?, endDate?)`
    - `getSaleStats(storeId, startDate?, endDate?)`
    - `createSale(storeId, saleData)`
    - `getTodaysSales(storeId)`
  - Removed `branchId` from saleData interface
  - Updated all queries to use `storeId` only

### 7. Route Structure Changes
- **Old Structure:**
  ```
  /dashboard/[storeId]/[branchId]/(dashboard)/page.tsx
  /dashboard/[storeId]/[branchId]/pos/page.tsx
  /dashboard/[storeId]/[branchId]/inventory/page.tsx
  etc.
  ```

- **New Structure:**
  ```
  /dashboard/[storeId]/(dashboard)/page.tsx
  /dashboard/[storeId]/pos/page.tsx
  /dashboard/[storeId]/inventory/page.tsx
  etc.
  ```

### 8. Component Updates
- **Created:** `app/dashboard/[storeId]/_components/DashboardClient.tsx`
  - Simplified version without branch dependencies
  - Removed BranchSwitcher component
  - Removed CreateBranchDialog component
  - Updated all links to remove branchId parameter

- **Updated:** `app/dashboard/[storeId]/page.tsx`
  - Removed branch fetching logic
  - Direct redirect to dashboard

### 9. UI/UX Changes
- Removed branch switcher from dashboard header
- Removed "Create Branch" button
- Removed "Branches" quick action
- Updated all navigation links to exclude branchId
- Simplified URL structure throughout the app

## Migration Steps for Existing Data

### Database Migration Required:
```javascript
// Remove branchId from all collections
db.products.updateMany({}, { $unset: { branchId: "" } });
db.sales.updateMany({}, { $unset: { branchId: "" } });
db.customers.updateMany({}, { $unset: { branchId: "" } });
db.categories.updateMany({}, { $unset: { branchId: "" } });
db.socialPosts.updateMany({}, { $unset: { branchId: "" } });
db.offlineSales.updateMany({}, { $unset: { branchId: "" } });
db.notifications.updateMany({}, { $unset: { branchId: "" } });

// Update users - remove accessLocation
db.users.updateMany({}, { $unset: { accessLocation: "" } });

// Update stores - remove branch references
db.stores.updateMany({}, { 
  $unset: { 
    numberOfBranches: "", 
    branchIds: "" 
  } 
});

// Optional: Drop branches collection if no longer needed
// db.branches.drop();
```

## Breaking Changes

### API Changes:
1. All server actions now require only `storeId` (no `branchId`)
2. Cookie management no longer includes `branchId`
3. Redirect URLs changed from `/dashboard/{storeId}/{branchId}` to `/dashboard/{storeId}`

### Component Props:
1. DashboardClient now expects `{ storeId }` instead of `{ storeId, branchId }`
2. All dashboard widgets updated to accept only `storeId`

### URL Structure:
- All routes simplified to remove `[branchId]` segment
- Update any bookmarks or saved links

## Benefits of This Change

1. **Simplified Architecture**: Easier to understand and maintain
2. **Reduced Complexity**: Fewer database queries and relationships
3. **Better Performance**: Less data to fetch and process
4. **Clearer Pricing**: Single store pricing is more straightforward
5. **Easier Onboarding**: New users don't need to understand branch concept

## Next Steps

### Required Actions:
1. Run database migration script on production
2. Update any external integrations that reference branchId
3. Clear user cookies to remove old branchId references
4. Update documentation and user guides
5. Test all features thoroughly

### Files That Still Need Updates:
- All pages under `/dashboard/[storeId]/[branchId]/` need to be moved to `/dashboard/[storeId]/`
- POS system pages
- Inventory pages
- Sales pages
- Customer pages
- Staff pages
- Settings pages
- Reports pages
- Marketing pages
- Supplier pages

### Components That Need Updates:
- Any component that accepts `branchId` as prop
- LowStockAlert component
- Dashboard widgets (InventoryAlertsWidget, TopSellingWidget, etc.)
- All action imports that use branchId

## Rollback Plan

If needed to rollback:
1. Restore previous version from git
2. Restore database backup
3. Clear application cache
4. Restart services

## Support

For questions or issues related to this migration, contact the development team.

---
**Migration Date**: [Current Date]
**Version**: 2.0.0
**Status**: In Progress
