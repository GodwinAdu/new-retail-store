import { Model, model, models, Schema } from "mongoose";
import { IUser } from "../types";

const UserSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            unique: true,
            lowercase: true,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            default: null
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['owner', 'admin', 'manager', 'cashier', 'sales_associate', 'inventory_manager'],
            default: 'sales_associate'
        },
        avatarUrl: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

type UserModel = Model<IUser>;
const User: UserModel = models.User || model<IUser>("User", UserSchema);

export default User;