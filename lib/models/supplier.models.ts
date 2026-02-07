import { Model, model, models, Schema } from "mongoose";
import { ISupplier } from "../types";

const SupplierSchema: Schema<ISupplier> = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        phone: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        products: [{
            type: Schema.Types.ObjectId,
            ref: "Product",
        }],
        paymentTerms: {
            type: String,
            default: null,
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

type SupplierModel = Model<ISupplier>;
const Supplier: SupplierModel = models.Supplier || model<ISupplier>("Supplier", SupplierSchema);

export default Supplier;