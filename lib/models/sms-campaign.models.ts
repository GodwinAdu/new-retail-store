import mongoose, { Schema, Document } from 'mongoose';

export interface ISMSCampaign extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  message: string;
  recipients: {
    type: 'all' | 'segment' | 'custom';
    customerIds?: mongoose.Types.ObjectId[];
    segment?: {
      minPurchases?: number;
      maxPurchases?: number;
      minSpent?: number;
      maxSpent?: number;
      lastPurchaseDays?: number;
    };
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    total: number;
    sent: number;
    failed: number;
    cost: number;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SMSCampaignSchema = new Schema<ISMSCampaign>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  message: { type: String, required: true, maxlength: 160 },
  recipients: {
    type: { type: String, enum: ['all', 'segment', 'custom'], required: true },
    customerIds: [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
    segment: {
      minPurchases: Number,
      maxPurchases: Number,
      minSpent: Number,
      maxSpent: Number,
      lastPurchaseDays: Number,
    },
  },
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'], default: 'draft' },
  scheduledAt: Date,
  sentAt: Date,
  stats: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.SMSCampaign || mongoose.model<ISMSCampaign>('SMSCampaign', SMSCampaignSchema);
