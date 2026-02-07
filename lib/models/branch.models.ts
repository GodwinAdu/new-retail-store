import { Model, model, models, Schema } from "mongoose";
import { IBranch } from "../types";

const BranchSchema: Schema<IBranch> = new Schema({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        default: null,
    },
    manager: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    operatingHours: [{
        day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: false,
        },
        openingTime: {
            type: String,
            required: false,
        },
        closingTime: {
            type: String,
            required: false,
        },
    }],
    posSettings: {
        autoReceiptPrint: {
            type: Boolean,
            default: true,
        },
        showItemImages: {
            type: Boolean,
            default: true,
        },
        quickPayEnabled: {
            type: Boolean,
            default: true,
        },
        taxIncluded: {
            type: Boolean,
            default: false,
        },
        defaultTaxRate: {
            type: Number,
            default: 0.15,
            min: 0,
            max: 1,
        },
        allowDiscounts: {
            type: Boolean,
            default: true,
        },
        maxDiscountPercent: {
            type: Number,
            default: 20,
            min: 0,
            max: 100,
        },
        requireCustomerInfo: {
            type: Boolean,
            default: false,
        },
        soundEffects: {
            type: Boolean,
            default: true,
        },
        compactMode: {
            type: Boolean,
            default: false,
        },
        barcodeScanning: {
            type: Boolean,
            default: true,
        },
        inventoryTracking: {
            type: Boolean,
            default: true,
        },
        loyaltyProgram: {
            type: Boolean,
            default: false,
        },
        multiCurrency: {
            type: Boolean,
            default: false,
        },
    },
    inventorySettings: {
        lowStockAlert: {
            type: Boolean,
            default: true,
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
        },
        autoReorder: {
            type: Boolean,
            default: false,
        },
        reorderPoint: {
            type: Number,
            default: 5,
        },
        trackExpiry: {
            type: Boolean,
            default: true,
        },
        batchTracking: {
            type: Boolean,
            default: false,
        },
        serialNumberTracking: {
            type: Boolean,
            default: false,
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

type BranchModel = Model<IBranch>;
const Branch: BranchModel = models.Branch || model<IBranch>("Branch", BranchSchema);

export default Branch;