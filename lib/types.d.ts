import { Document, Schema } from "mongoose";

// User Types
export interface IUser extends Document {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
  storeId: Schema.Types.ObjectId;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Store Types
export interface IStore extends Document {
  _id: string;
  name: string;
  avatar?: string;
  owner: Schema.Types.ObjectId;
  storeEmail: string;
  storePhone?: string;
  storeAddress?: string;
  posSettings?: {
    autoReceiptPrint: boolean;
    showItemImages: boolean;
    quickPayEnabled: boolean;
    taxIncluded: boolean;
    defaultTaxRate: number;
    allowDiscounts: boolean;
    maxDiscountPercent: number;
    requireCustomerInfo: boolean;
    soundEffects: boolean;
    compactMode: boolean;
    barcodeScanning: boolean;
    inventoryTracking: boolean;
    loyaltyProgram: boolean;
    multiCurrency: boolean;
  };
  inventorySettings?: {
    lowStockAlert: boolean;
    lowStockThreshold: number;
    autoReorder: boolean;
    reorderPoint: number;
    trackExpiry: boolean;
    batchTracking: boolean;
    serialNumberTracking: boolean;
  };
  subscriptionPlan: {
    period: { name: string; value: number };
    subscriptionExpiry: Date;
    paymentStatus: string;
    trialEndsAt: Date;
    isBlocked: boolean;
    blockedAt?: Date;
  };
  paymentHistory: {
    reference: string;
    amount: number;
    status: string;
    paidAt: Date;
    paymentMethod: string;
    transactionId: string;
  }[];
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Branch Types
export interface IBranch extends Document {
  _id: Schema.Types.ObjectId;
  storeId: Schema.Types.ObjectId;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  email?: string;
  operatingHours: {
    day: string;
    openingTime: string;
    closingTime: string;
  }[];
  posSettings: {
    autoReceiptPrint: boolean;
    showItemImages: boolean;
    quickPayEnabled: boolean;
    taxIncluded: boolean;
    defaultTaxRate: number;
    allowDiscounts: boolean;
    maxDiscountPercent: number;
    requireCustomerInfo: boolean;
    soundEffects: boolean;
    compactMode: boolean;
    barcodeScanning: boolean;
    inventoryTracking: boolean;
    loyaltyProgram: boolean;
    multiCurrency: boolean;
  };
  inventorySettings: {
    lowStockAlert: boolean;
    lowStockThreshold: number;
    autoReorder: boolean;
    reorderPoint: number;
    trackExpiry: boolean;
    batchTracking: boolean;
    serialNumberTracking: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface ICategory extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Types
export interface ISupplier extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  products: Schema.Types.ObjectId[];
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface IProduct extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  categoryId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  sku: string;
  barcode?: string;
  stock: number;
  minStock: number;
  maxStock: number;
  supplier?: string;
  supplierInfo?: {
    name?: string;
    contact?: string;
    email?: string;
    address?: string;
  };
  reorderPoint: number;
  autoReorder: boolean;
  expiryDate?: Date;
  batchNumber?: string;
  isPerishable: boolean;
  variations: {
    name: string;
    price: number;
    isAvailable: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Customer Types
export interface ICustomer extends Document {
  _id:string;
  storeId: Schema.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalPurchases: number;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Social Media Types
export interface ISocialPost extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp';
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  postId?: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    reach: number;
  };
  relatedProductIds: Schema.Types.ObjectId[];
  relatedSaleIds: Schema.Types.ObjectId[];
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Offline Sale Types
export interface IOfflineSale extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  localId: string;
  saleData: any;
  status: 'pending' | 'synced' | 'failed';
  syncAttempts: number;
  lastSyncAttempt?: Date;
  syncedSaleId?: Schema.Types.ObjectId;
  errorMessage?: string;
  deviceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface INotification extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  type: 'sms' | 'email' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  relatedSaleId?: Schema.Types.ObjectId;
  metadata?: any;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sale Types
export interface ISale extends Document {
  _id: string;
  storeId: Schema.Types.ObjectId;
  saleNumber: string;
  customerId?: Schema.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  saleType: 'in-store' | 'online' | 'phone';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  items: {
    productId: Schema.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    variations?: string[];
    discount?: number;
  }[];
  subtotal: number;
  tax: number;
  taxType?: 'percentage' | 'fixed';
  discount: number;
  discountType?: 'percentage' | 'fixed';
  total: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  notes?: string;
  cashierId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}