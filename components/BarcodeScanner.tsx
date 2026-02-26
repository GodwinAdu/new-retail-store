"use client";

import { useState, useEffect, useRef } from "react";
import { Scan, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchByBarcode } from "@/lib/actions/inventory.actions";
import { toast } from "sonner";

interface BarcodeScannerProps {
  storeId: string;
  onProductFound: (product: any) => void;
}

export default function BarcodeScanner({ storeId, onProductFound }: BarcodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleScan = async (code: string) => {
    if (!code) return;
    
    setScanning(true);
    const product = await searchByBarcode(storeId, code);
    
    if (product) {
      toast.success(`Found: ${product.name}`);
      onProductFound(product);
      setOpen(false);
      setBarcode("");
    } else {
      toast.error("Product not found");
    }
    
    setScanning(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleScan(barcode);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Scan className="w-4 h-4 mr-2" />
        Scan Barcode
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Scan className="w-5 h-5 mr-2" />
              Barcode Scanner
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Scan barcode or enter manually
              </p>
              <Input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan or type barcode..."
                className="bg-white/10 border-white/20 text-white"
                disabled={scanning}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleScan(barcode)} disabled={scanning || !barcode}>
                {scanning ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
