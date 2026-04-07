"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, User, Calendar, CreditCard, Package, RefreshCw, Printer } from "lucide-react";
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
      setLoading(true);
      getSaleDetails(saleId).then(data => { setSale(data); setLoading(false); });
    }
  }, [saleId, open]);

  const handleRefund = async () => {
    if (!sale) return;
    setActionLoading(true);
    const result = await refundSale(sale._id);
    if (result.success) { toast.success("Sale refunded"); onSaleUpdated(); onOpenChange(false); }
    else toast.error(result.error || "Failed to refund sale");
    setActionLoading(false);
  };

  const handleStatusUpdate = async (status: 'pending' | 'completed' | 'cancelled' | 'refunded') => {
    if (!sale) return;
    setActionLoading(true);
    const result = await updateSaleStatus(sale._id, status);
    if (result.success) { toast.success("Status updated"); setSale({ ...sale, status }); onSaleUpdated(); }
    else toast.error(result.error || "Failed to update status");
    setActionLoading(false);
  };

  const printReceipt = () => {
    window.print();
    toast.success("Receipt sent to printer");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      cancelled: "bg-gray-100 text-gray-600",
      refunded: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-blue-100 text-blue-700";
  };

  if (!sale && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center text-gray-900">
            <Receipt className="w-5 h-5 mr-2" />Sale Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading sale details...</div>
        ) : sale ? (
          <div className="space-y-6">
            {/* Sale Info & Payment - hidden during print */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 flex items-center justify-between text-base">
                    Sale Information
                    <Badge className={`${getStatusBadge(sale.status)} border-0`}>{sale.status?.toUpperCase()}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600"><Receipt className="w-4 h-4 mr-2 text-gray-400" />Sale #{sale.saleNumber}</div>
                  <div className="flex items-center text-gray-600"><Calendar className="w-4 h-4 mr-2 text-gray-400" />{new Date(sale.createdAt).toLocaleString()}</div>
                  {sale.customerName && <div className="flex items-center text-gray-600"><User className="w-4 h-4 mr-2 text-gray-400" />{sale.customerName}</div>}
                  {sale.customerPhone && <div className="flex items-center text-gray-500 ml-6">{sale.customerPhone}</div>}
                  {sale.paymentMethod && <div className="flex items-center text-gray-600"><CreditCard className="w-4 h-4 mr-2 text-gray-400" />{sale.paymentMethod}</div>}
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-base">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="text-gray-900">GH₵{(sale.subtotal || 0).toFixed(2)}</span></div>
                  {(sale.discount || 0) > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount:</span><span className="text-red-600">-GH₵{(sale.discount || 0).toFixed(2)}</span></div>}
                  {(sale.tax || 0) > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax:</span><span className="text-gray-900">GH₵{(sale.tax || 0).toFixed(2)}</span></div>}
                  <div className="border-t pt-2">
                    <div className="flex justify-between"><span className="text-gray-900 font-semibold">Total:</span><span className="text-gray-900 font-bold text-lg">GH₵{(sale.total || 0).toFixed(2)}</span></div>
                  </div>
                  <Badge className={`border-0 ${sale.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : sale.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {sale.paymentStatus?.toUpperCase() || 'PENDING'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Items Card - hidden during print */}
            <Card className="border-gray-200 no-print">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 flex items-center text-base"><Package className="w-5 h-5 mr-2" />Items ({sale.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(sale.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-900 font-medium">{item.name}</p>
                        <p className="text-gray-500 text-sm">
                          Qty: {item.quantity} × GH₵{(item.price || 0).toFixed(2)}
                          {item.variations && item.variations.length > 0 && <span className="ml-2">({item.variations.join(', ')})</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-semibold">GH₵{((item.price || 0) * item.quantity - (item.discount || 0)).toFixed(2)}</p>
                        {item.discount && item.discount > 0 && <p className="text-red-500 text-sm">-GH₵{item.discount.toFixed(2)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {sale.notes && (
              <Card className="border-gray-200 no-print">
                <CardHeader className="pb-3"><CardTitle className="text-gray-900 text-base">Notes</CardTitle></CardHeader>
                <CardContent><p className="text-gray-600">{sale.notes}</p></CardContent>
              </Card>
            )}

            {/* Printable Receipt - Epson 80mm thermal */}
            <div id="receipt-print" className="hidden print:block bg-white font-mono text-sm p-4">
              <div className="receipt-header text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-lg font-bold tracking-wide">QounterPay</h2>
                <p className="text-xs text-gray-500">================================</p>
                <p className="text-xs text-gray-600">{new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString()}</p>
                <p className="text-xs text-gray-600">Sale: #{sale.saleNumber}</p>
                {sale.customerName && <p className="text-xs text-gray-600">Customer: {sale.customerName}</p>}
                {sale.customerPhone && <p className="text-xs text-gray-600">Phone: {sale.customerPhone}</p>}
              </div>

              <div className="receipt-items border-b border-dashed border-gray-300 pb-3 mb-3">
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>ITEM</span>
                  <span>AMOUNT</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">--------------------------------</p>
                {(sale.items || []).map((item, index) => (
                  <div key={index} className="receipt-item mb-1">
                    <div className="flex justify-between text-xs">
                      <span className="receipt-item-name text-gray-800 truncate max-w-[60%]">{item.name}</span>
                      <span className="text-gray-800">GH₵{((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 pl-2">{item.quantity} x GH₵{(item.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="receipt-totals border-b border-dashed border-gray-300 pb-3 mb-3 space-y-1">
                <div className="receipt-total-row flex justify-between text-xs text-gray-600">
                  <span>Subtotal:</span>
                  <span>GH₵{(sale.subtotal || 0).toFixed(2)}</span>
                </div>
                {(sale.discount || 0) > 0 && (
                  <div className="receipt-total-row flex justify-between text-xs text-gray-600">
                    <span>Discount:</span>
                    <span>-GH₵{(sale.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                {(sale.tax || 0) > 0 && (
                  <div className="receipt-total-row flex justify-between text-xs text-gray-600">
                    <span>Tax:</span>
                    <span>GH₵{(sale.tax || 0).toFixed(2)}</span>
                  </div>
                )}
                <p className="text-xs text-gray-400">================================</p>
                <div className="receipt-grand-total flex justify-between text-sm font-bold text-gray-900 pt-1">
                  <span>TOTAL:</span>
                  <span>GH₵{(sale.total || 0).toFixed(2)}</span>
                </div>
                {sale.paymentMethod && (
                  <div className="receipt-total-row flex justify-between text-xs text-gray-600 pt-1">
                    <span>Payment:</span>
                    <span className="uppercase">{sale.paymentMethod}</span>
                  </div>
                )}
                <div className="receipt-total-row flex justify-between text-xs text-gray-600">
                  <span>Status:</span>
                  <span className="uppercase">{sale.status}</span>
                </div>
              </div>

              <div className="receipt-footer text-center pt-2">
                <p className="text-xs text-gray-500">Thank you for your purchase!</p>
                <p className="text-xs text-gray-500">Visit us again soon</p>
                <p className="text-xs text-gray-400 mt-2">================================</p>
                <p className="text-[10px] text-gray-400 mt-1">Powered by QounterPay</p>
              </div>
            </div>

            {/* Actions - hidden during print */}
            <div className="flex justify-between no-print">
              <Button variant="outline" onClick={printReceipt}>
                <Printer className="w-4 h-4 mr-2" />Print Receipt
              </Button>
              <div className="flex space-x-2">
                {sale.status === 'completed' && (
                  <Button variant="destructive" onClick={handleRefund} disabled={actionLoading}>
                    {actionLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}Refund Sale
                  </Button>
                )}
                {sale.status === 'pending' && (
                  <Button onClick={() => handleStatusUpdate('completed')} disabled={actionLoading} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                    {actionLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}Mark Completed
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
