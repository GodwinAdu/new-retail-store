"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductVariationDialogProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVariation: (variation: any) => void;
}

export default function ProductVariationDialog({ product, open, onOpenChange, onSelectVariation }: ProductVariationDialogProps) {
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  const handleSelect = () => {
    if (selectedVariation) {
      onSelectVariation(selectedVariation);
      onOpenChange(false);
      setSelectedVariation(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Select Variation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white">{product?.name}</h3>
            <p className="text-sm text-gray-400">Choose a variation to add to cart</p>
          </div>

          <div className="space-y-2">
            {product?.variations?.filter((v: any) => v.isAvailable).map((variation: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedVariation(variation)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedVariation?.name === variation.name
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-white font-medium">{variation.name}</p>
                    <p className="text-sm text-gray-400">Base price: ₵{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">₵{variation.price}</p>
                    {variation.price !== product.price && (
                      <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                        {variation.price > product.price ? "+" : ""}₵{(variation.price - product.price).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/20 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedVariation}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
