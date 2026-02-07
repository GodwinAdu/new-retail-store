import { Model, model, models, Schema } from "mongoose";
import { ISocialPost } from "../types";

const SocialPostSchema: Schema<ISocialPost> = new Schema(
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
        platform: {
            type: String,
            enum: ['facebook', 'instagram', 'twitter', 'whatsapp'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        mediaUrls: [{
            type: String,
        }],
        hashtags: [{
            type: String,
        }],
        scheduledFor: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['draft', 'scheduled', 'posted', 'failed'],
            default: 'draft',
        },
        postId: {
            type: String,
            default: null,
        },
        engagement: {
            likes: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            reach: { type: Number, default: 0 },
        },
        relatedProductIds: [{
            type: Schema.Types.ObjectId,
            ref: "Product",
        }],
        relatedSaleIds: [{
            type: Schema.Types.ObjectId,
            ref: "Sale",
        }],
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

type SocialPostModel = Model<ISocialPost>;
const SocialPost: SocialPostModel = models.SocialPost || model<ISocialPost>("SocialPost", SocialPostSchema);

export default SocialPost;