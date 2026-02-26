import { Model, model, models, Schema } from "mongoose";

export interface IPurchaseOrder {
  _id: string;
  storeId: Schema.Types.ObjectId;
  poNumber: string;
  supplierId: Schema.Types.ObjectId;
  status: "draft" | "pending" | "approved" | "received" | "cancelled";
  items: {
    productId: Schema.Types.ObjectId;
    name: string;
    quantity: number;
    costPrice: number;
    receivedQuantity: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  expectedDeliveryDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: Schema.Types.ObjectId;
  approvedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    poNumber: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    status: { type: String, enum: ["draft", "pending", "approved", "received", "cancelled"], default: "draft" },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      costPrice: { type: Number, required: true, min: 0 },
      receivedQuantity: { type: Number, default: 0, min: 0 }
    }],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    expectedDeliveryDate: { type: Date },
    receivedDate: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true, versionKey: false }
);

PurchaseOrderSchema.index({ storeId: 1, poNumber: 1 });
PurchaseOrderSchema.index({ storeId: 1, status: 1 });

type PurchaseOrderModel = Model<IPurchaseOrder>;
const PurchaseOrder: PurchaseOrderModel = models.PurchaseOrder || model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);

export default PurchaseOrder;
