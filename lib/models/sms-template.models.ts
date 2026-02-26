import mongoose, { Schema, Document } from 'mongoose';

export interface ISMSTemplate extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  message: string;
  category: 'promotional' | 'transactional' | 'reminder' | 'announcement';
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SMSTemplateSchema = new Schema<ISMSTemplate>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  message: { type: String, required: true, maxlength: 160 },
  category: { type: String, enum: ['promotional', 'transactional', 'reminder', 'announcement'], required: true },
  variables: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.SMSTemplate || mongoose.model<ISMSTemplate>('SMSTemplate', SMSTemplateSchema);
