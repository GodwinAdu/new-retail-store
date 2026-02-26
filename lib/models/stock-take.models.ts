import { Model, model, models, Schema } from "mongoose";

export interface IStockTake {
  _id: string;
  storeId: Schema.Types.ObjectId;
  stockTakeNumber: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  scheduledDate: Date;
  completedDate?: Date;
  items: {
    productId: Schema.Types.ObjectId;
    name: string;
    systemStock: number;
    physicalCount: number;
    variance: number;
    notes?: string;
  }[];
  totalVariance: number;
  adjustmentCreated: boolean;
  notes?: string;
  createdBy: Schema.Types.ObjectId;
  completedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockTakeSchema = new Schema<IStockTake>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    stockTakeNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["scheduled", "in-progress", "completed", "cancelled"], default: "scheduled" },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      systemStock: { type: Number, required: true },
      physicalCount: { type: Number, required: true },
      variance: { type: Number, required: true },
      notes: { type: String }
    }],
    totalVariance: { type: Number, default: 0 },
    adjustmentCreated: { type: Boolean, default: false },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true, versionKey: false }
);

StockTakeSchema.index({ storeId: 1, stockTakeNumber: 1 });
StockTakeSchema.index({ storeId: 1, status: 1 });

type StockTakeModel = Model<IStockTake>;
const StockTake: StockTakeModel = models.StockTake || model<IStockTake>("StockTake", StockTakeSchema);

export default StockTake;
