"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, User, Calendar, CreditCard, Package, RefreshCw, Download } from "lucide-react";
import { getSaleDetails, refundSale, updateSaleStatus } from "@/lib/actions/sale.actions";
import { toast } from "sonner";
import { ISale } from "@/lib/types";

interface SaleDetailsDialogProps {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleUpdated: () => void;
}

export default function SaleDetailsDialog({ saleId, open, onOpenChange, onSaleUpdated }: SaleDetailsDialogProps) {
  const [sale, setSale] = useState<ISale | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (saleId && open) {
      loadSaleDetails();
    }
  }, [saleId, open]);

  const loadSaleDetails = async () => {
    if (!saleId) return;
    setLoading(true);
    const saleData = await getSaleDetails(saleId);
    setSale(saleData);
    setLoading(false);
  };

  const handleRefund = async () => {
    if (!sale) return;
    setActionLoading(true);
    const result = await refundSale(sale._id);
    if (result.success) {
      toast.success("Sale refunded successfully");
      onSaleUpdated();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to refund sale");
    }
    setActionLoading(false);
  };

  const handleStatusUpdate = async (status: 'pending' | 'completed' | 'cancelled' | 'refunded') => {
    if (!sale) return;
    setActionLoading(true);
    const result = await updateSaleStatus(sale._id, status);
    if (result.success) {
      toast.success("Sale status updated successfully");
      setSale({ ...sale, status });
      onSaleUpdated();
    } else {
      toast.error(result.error || "Failed to update sale status");
    }
    setActionLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      case 'refunded': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  if (!sale && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Sale Details
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading sale details...</div>
        ) : sale ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Sale Information
                    <Badge className={`${getStatusColor(sale.status)} border-0`}>
                      {sale.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <Receipt className="w-4 h-4 mr-2" />
                    <span>Sale #{sale.saleNumber}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(sale.createdAt).toLocaleString()}</span>
                  </div>
                  {sale.customerId && (
                    <div className="flex items-center text-gray-300">
                      <User className="w-4 h-4 mr-2" />
                      <span>{sale.customerName || 'Customer'}</span>
                    </div>
                  )}
                  {sale.customerPhone && (
                    <div className="flex items-center text-gray-300">
                      <span className="ml-6">{sale.customerPhone}</span>
                    </div>
                  )}
                  {sale.paymentMethod && (
                    <div className="flex items-center text-gray-300">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>{sale.paymentMethod}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal:</span>
                    <span className="text-white">GH₵{(sale.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {(sale.discount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Discount:</span>
                      <span className="text-red-400">-GH₵{(sale.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {(sale.tax || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tax:</span>
                      <span className="text-white">GH₵{(sale.tax || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-white font-semibold text-lg">GH₵{(sale.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <Badge className={`${
                    sale.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                    sale.paymentStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  } border-0`}>
                    {sale.paymentStatus?.toUpperCase() || 'PENDING'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Items ({sale.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(sale.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">
                          Qty: {item.quantity} × GH₵{(item.price || 0).toFixed(2)}
                          {item.variations && item.variations.length > 0 && (
                            <span className="ml-2">({item.variations.join(', ')})</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          GH₵{((item.price || 0) * item.quantity - (item.discount || 0)).toFixed(2)}
                        </p>
                        {item.discount && item.discount > 0 && (
                          <p className="text-red-400 text-sm">-GH₵{item.discount.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {sale.notes && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{sale.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
              <div className="flex space-x-2">
                {sale.status === 'completed' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleRefund}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    Refund Sale
                  </Button>
                )}
                {sale.status === 'pending' && (
                  <Button 
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">Sale not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}