import { Model, model, models, Schema } from "mongoose";
import { IOfflineSale } from "../types";

const OfflineSaleSchema: Schema<IOfflineSale> = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },
        localId: {
            type: String,
            required: true,
        },
        saleData: {
            type: Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'synced', 'failed'],
            default: 'pending',
        },
        syncAttempts: {
            type: Number,
            default: 0,
        },
        lastSyncAttempt: {
            type: Date,
            default: null,
        },
        syncedSaleId: {
            type: Schema.Types.ObjectId,
            ref: "Sale",
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
        deviceId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

type OfflineSaleModel = Model<IOfflineSale>;
const OfflineSale: OfflineSaleModel = models.OfflineSale || model<IOfflineSale>("OfflineSale", OfflineSaleSchema);

export default OfflineSale;