import { Model, model, models, Schema } from "mongoose";
import { IProduct } from "../types";

const ProductSchema: Schema<IProduct> = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        costPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        image: {
            type: String,
            default: null,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        barcode: {
            type: String,
            default: null,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        minStock: {
            type: Number,
            required: true,
            min: 0,
            default: 5,
        },
        maxStock: {
            type: Number,
            required: true,
            min: 0,
            default: 100,
        },
        supplier: {
            type: String,
            default: null,
        },
        supplierInfo: {
            name: { type: String, default: null },
            contact: { type: String, default: null },
            email: { type: String, default: null },
            address: { type: String, default: null },
        },
        reorderPoint: {
            type: Number,
            default: 10,
            min: 0,
        },
        autoReorder: {
            type: Boolean,
            default: false,
        },
        expiryDate: {
            type: Date,
            default: null,
        },
        batchNumber: {
            type: String,
            default: null,
        },
        isPerishable: {
            type: Boolean,
            default: false,
        },
        variations: [{
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
                min: 0,
            },
            isAvailable: {
                type: Boolean,
                default: true,
            },
        }],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

type ProductModel = Model<IProduct>;
const Product: ProductModel = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;