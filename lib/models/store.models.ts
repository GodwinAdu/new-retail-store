import { Model, model, models, Schema } from "mongoose";
import { IStore } from "../types";

const StoreSchema: Schema<IStore> = new Schema({
    name: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    storeEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    storePhone: {
        type: String,
        default: null,
    },
    storeAddress: {
        type: String,
        default: null,
    },
    posSettings: {
        type: Schema.Types.Mixed,
        default: {
            autoReceiptPrint: true,
            showItemImages: true,
            quickPayEnabled: true,
            taxIncluded: false,
            defaultTaxRate: 0.15,
            allowDiscounts: true,
            maxDiscountPercent: 20,
            requireCustomerInfo: false,
            soundEffects: true,
            compactMode: false,
            barcodeScanning: true,
            inventoryTracking: true,
            loyaltyProgram: false,
            multiCurrency: false,
        }
    },
    inventorySettings: {
        type: Schema.Types.Mixed,
        default: {
            lowStockAlert: true,
            lowStockThreshold: 10,
            autoReorder: false,
            reorderPoint: 5,
            trackExpiry: true,
            batchTracking: false,
            serialNumberTracking: false,
        }
    },

    subscriptionPlan: {
        period: {
            name: {
                type: String,
                default: 'Monthly',
            },
            value: {
                type: Number,
                default: 1
            }
        },
        subscriptionExpiry: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        paymentStatus: {
            type: String,
            default: 'Free Trial'
        },
        trialEndsAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        blockedAt: {
            type: Date,
            default: null
        },
    },
    banned: {
        type: Boolean,
        default: false
    },
    paymentHistory: [{
        reference: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, required: true },
        paidAt: { type: Date, required: true },
        paymentMethod: { type: String, required: true },
        transactionId: { type: String, required: true }
    }],
}, {
    timestamps: true,
    versionKey: false,
});

type StoreModel = Model<IStore>;
const Store: StoreModel = models.Store || model<IStore>("Store", StoreSchema);

export default Store;