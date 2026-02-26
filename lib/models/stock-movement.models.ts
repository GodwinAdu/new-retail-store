import { Model, model, models, Schema } from "mongoose";

export interface IStockMovement {
    _id: string;
    storeId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer' | 'damage' | 'expired';
    quantity: number; // Positive for additions, negative for reductions
    previousStock: number;
    newStock: number;
    reason?: string;
    referenceId?: Schema.Types.ObjectId; // Sale ID, PO ID, etc.
    referenceType?: string; // 'Sale', 'PurchaseOrder', etc.
    userId: Schema.Types.ObjectId; // Who made the change
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StockMovementSchema: Schema<IStockMovement> = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['sale', 'purchase', 'adjustment', 'return', 'transfer', 'damage', 'expired'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        previousStock: {
            type: Number,
            required: true,
        },
        newStock: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            default: null,
        },
        referenceId: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        referenceType: {
            type: String,
            default: null,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        notes: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for better query performance
StockMovementSchema.index({ storeId: 1, productId: 1, createdAt: -1 });
StockMovementSchema.index({ storeId: 1, type: 1, createdAt: -1 });

type StockMovementModel = Model<IStockMovement>;
const StockMovement: StockMovementModel = 
    models.StockMovement || model<IStockMovement>("StockMovement", StockMovementSchema);

export default StockMovement;
