import { Model, model, models, Schema } from "mongoose";
import { ISale } from "../types";

const SaleSchema: Schema<ISale> = new Schema(
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
        saleNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            default: null,
        },
        customerName: {
            type: String,
            default: null,
        },
        customerPhone: {
            type: String,
            default: null,
        },
        saleType: {
            type: String,
            required: true,
            enum: ['in-store', 'online', 'phone'],
            default: 'in-store',
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'completed', 'cancelled', 'refunded'],
            default: 'pending',
        },
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
                min: 0,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            variations: [{
                type: String,
            }],
            discount: {
                type: Number,
                default: 0,
                min: 0,
            },
        }],
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        taxType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
        },
        discount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['pending', 'partial', 'paid'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            default: null,
        },
        notes: {
            type: String,
            default: null,
        },
        cashierId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

type SaleModel = Model<ISale>;
const Sale: SaleModel = models.Sale || model<ISale>("Sale", SaleSchema);

export default Sale;