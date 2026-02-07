"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Calendar, ShoppingBag, Star } from "lucide-react";
import { getCustomerDetails } from "@/lib/actions/customer.actions";
import { ICustomer } from "@/lib/types";

interface CustomerDetailsDialogProps {
  customer: ICustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerDetailsDialog({ customer, open, onOpenChange }: CustomerDetailsDialogProps) {
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && open) {
      loadCustomerDetails();
    }
  }, [customer, open]);

  const loadCustomerDetails = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const details = await getCustomerDetails(customer._id);
      setCustomerDetails(details);
    } catch (error) {
      console.error("Error loading customer details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerStatus = (totalPurchases: number) => {
    if (totalPurchases >= 1000) return { label: "VIP", color: "bg-yellow-500/20 text-yellow-400" };
    if (totalPurchases >= 500) return { label: "PREMIUM", color: "bg-purple-500/20 text-purple-400" };
    return { label: "REGULAR", color: "bg-green-500/20 text-green-400" };
  };

  if (!customer) return null;

  const status = getCustomerStatus(customer.totalPurchases);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Customer Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <Badge className={`${status.color} border-0`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{customer.email || "No email"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{customer.phone || "No phone"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{customer.address || "No address"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-2xl font-bold">${customer.totalPurchases.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Total Spent</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold">{customer.loyaltyPoints}</p>
                <p className="text-sm text-gray-400">Loyalty Points</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold">
                  {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "Never"}
                </p>
                <p className="text-sm text-gray-400">Last Visit</p>
              </CardContent>
            </Card>
          </div>

          {customerDetails?.sales && customerDetails.sales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customerDetails.sales.slice(0, 5).map((sale: any) => (
                    <div key={sale._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">#{sale.saleNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${sale.total.toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}