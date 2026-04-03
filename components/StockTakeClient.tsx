"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, CheckCircle, ArrowLeft, Calendar, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStockTakes, createStockTake, updateStockTakeCount, completeStockTake } from "@/lib/actions/stock-take.actions";
import { toast } from "sonner";

export default function StockTakeClient({ storeId, userId }: { storeId: string; userId: string }) {
  const [stockTakes, setStockTakes] = useState<any[]>([]);
  const [selectedStockTake, setSelectedStockTake] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countDialogOpen, setCountDialogOpen] = useState(false);

  useEffect(() => { loadData(); }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    const data = await getStockTakes(storeId);
    setStockTakes(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createStockTake(storeId, {
      scheduledDate: new Date(formData.get("scheduledDate") as string),
      notes: formData.get("notes"),
      createdBy: userId
    });
    if (result?.success) {
      toast.success("Stock take scheduled");
      setDialogOpen(false);
      loadData();
    } else {
      toast.error(result?.error || "Failed to create stock take");
    }
  };

  const handleUpdateCount = async (productId: string, count: number) => {
    if (!selectedStockTake) return;
    const result = await updateStockTakeCount(storeId, selectedStockTake._id, productId, count);
    if (result) {
      setSelectedStockTake(result);
      toast.success("Count updated");
    }
  };

  const handleComplete = async () => {
    if (!selectedStockTake) return;
    if (confirm("Complete this stock take and adjust inventory?")) {
      const result = await completeStockTake(storeId, selectedStockTake._id, userId, true);
      if (result?.success) {
        toast.success("Stock take completed, inventory adjusted");
        setCountDialogOpen(false);
        setSelectedStockTake(null);
        loadData();
      } else {
        toast.error(result?.error || "Failed to complete stock take");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700",
      "in-progress": "bg-amber-100 text-amber-700",
      completed: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-red-100 text-red-700"
    };
    return map[status] || map.scheduled;
  };

  const totalTakes = stockTakes.length;
  const activeTakes = stockTakes.filter(s => s.status === "scheduled" || s.status === "in-progress").length;
  const completedTakes = stockTakes.filter(s => s.status === "completed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/70 rounded-2xl p-6 shadow-lg">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
      <div className="p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/dashboard/${storeId}/inventory`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Inventory
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Stock Take</h1>
              <p className="text-gray-500 mt-1">Physical inventory counting and variance tracking</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />Schedule Stock Take
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Stock Take</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label>Scheduled Date</Label>
                    <Input type="date" name="scheduledDate" required />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input name="notes" placeholder="Optional notes..." />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">Schedule</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Stock Takes</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTakes}</p>
                  </div>
                  <ClipboardCheck className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active / Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">{activeTakes}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedTakes}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Takes List */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">All Stock Takes</CardTitle>
            </CardHeader>
            <CardContent>
              {stockTakes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No stock takes yet</p>
                  <p className="text-sm mt-1">Schedule your first stock take to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockTakes.map(st => (
                    <div key={st._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-900 font-semibold">{st.stockTakeNumber}</h3>
                          <p className="text-sm text-gray-500">
                            Scheduled: {new Date(st.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusBadge(st.status)} border-0`}>
                            {st.status.charAt(0).toUpperCase() + st.status.slice(1)}
                          </Badge>
                          {st.status !== "completed" && st.status !== "cancelled" && (
                            <Button size="sm" onClick={() => { setSelectedStockTake(st); setCountDialogOpen(true); }} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                              <ClipboardCheck className="w-4 h-4 mr-1" />Count
                            </Button>
                          )}
                        </div>
                      </div>
                      {st.status === "completed" && (
                        <div className="mt-2 flex items-center text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                          <span className="text-gray-500">Total Variance:</span>
                          <span className="text-gray-900 ml-1 font-medium">{st.totalVariance}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Count Dialog */}
      <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stock Count — {selectedStockTake?.stockTakeNumber}</DialogTitle>
          </DialogHeader>
          {selectedStockTake && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 font-semibold text-sm border-b border-gray-200 pb-2 text-gray-500">
                <div className="col-span-2">Product</div>
                <div>System</div>
                <div>Physical</div>
                <div>Variance</div>
              </div>
              {selectedStockTake.items.map((item: any) => (
                <div key={item.productId} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2 text-sm text-gray-900 font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.systemStock}</div>
                  <Input
                    type="number"
                    min="0"
                    defaultValue={item.physicalCount}
                    onBlur={(e) => handleUpdateCount(item.productId, parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                  <div className={`text-sm font-semibold ${item.variance > 0 ? "text-emerald-600" : item.variance < 0 ? "text-red-600" : "text-gray-400"}`}>
                    {item.variance > 0 ? "+" : ""}{item.variance}
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setCountDialogOpen(false)}>Close</Button>
                <Button onClick={handleComplete} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                  <CheckCircle className="w-4 h-4 mr-2" />Complete & Adjust
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
