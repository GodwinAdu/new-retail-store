import { Model, model, models, Schema } from "mongoose";

export interface IProductBundle {
  _id: string;
  storeId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  components: {
    productId: Schema.Types.ObjectId;
    name: string;
    quantity: number;
  }[];
  bundlePrice: number;
  individualPrice: number;
  savings: number;
  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductBundleSchema = new Schema<IProductBundle>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String, required: true },
    barcode: { type: String },
    components: [{
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }],
    bundlePrice: { type: Number, required: true, min: 0 },
    individualPrice: { type: Number, required: true, min: 0 },
    savings: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    image: { type: String }
  },
  { timestamps: true, versionKey: false }
);

ProductBundleSchema.index({ storeId: 1, sku: 1 }, { unique: true });

type ProductBundleModel = Model<IProductBundle>;
const ProductBundle: ProductBundleModel = models.ProductBundle || model<IProductBundle>("ProductBundle", ProductBundleSchema);

export default ProductBundle;
