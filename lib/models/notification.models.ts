import { Model, model, models, Schema } from "mongoose";
import { INotification } from "../types";

const NotificationSchema: Schema<INotification> = new Schema(
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
        type: {
            type: String,
            enum: ['sms', 'email', 'push'],
            required: true,
        },
        recipient: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            default: null,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'delivered'],
            default: 'pending',
        },
        relatedSaleId: {
            type: Schema.Types.ObjectId,
            ref: "Sale",
            default: null,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        sentAt: {
            type: Date,
            default: null,
        },
        deliveredAt: {
            type: Date,
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

type NotificationModel = Model<INotification>;
const Notification: NotificationModel = models.Notification || model<INotification>("Notification", NotificationSchema);

export default Notification;