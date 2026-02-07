"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteCustomer } from "@/lib/actions/customer.actions";
import { ICustomer } from "@/lib/types";

interface DeleteCustomerDialogProps {
  customer: ICustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerDeleted?: () => void;
}

export default function DeleteCustomerDialog({ customer, open, onOpenChange, onCustomerDeleted }: DeleteCustomerDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      const result = await deleteCustomer(customer._id);
      
      if (result.success) {
        toast.success("Customer deleted successfully");
        onOpenChange(false);
        onCustomerDeleted?.();
      } else {
        toast.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      toast.error("Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {customer?.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading} 
            className="flex-1"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}