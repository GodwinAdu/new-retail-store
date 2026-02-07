import { Model, model, models, Schema } from "mongoose";
import { ICustomer } from "../types";

const CustomerSchema: Schema<ICustomer> = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: false,
            default: null,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            default: null,
            lowercase: true,
        },
        phone: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            default: null,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPurchases: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastVisit: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

type CustomerModel = Model<ICustomer>;
const Customer: CustomerModel = models.Customer || model<ICustomer>("Customer", CustomerSchema);

export default Customer;