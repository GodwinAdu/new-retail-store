"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Save, CheckCircle } from "lucide-react";
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

  useEffect(() => {
    loadData();
  }, [storeId]);

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

  const getStatusColor = (status: string) => {
    const colors: any = {
      scheduled: "bg-blue-500/20 text-blue-400",
      "in-progress": "bg-yellow-500/20 text-yellow-400",
      completed: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400"
    };
    return colors[status] || colors.scheduled;
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Stock Take</h1>
          <p className="text-gray-300 mt-1">Physical inventory counting and variance tracking</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Schedule Stock Take</Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 text-white border-white/20">
            <DialogHeader>
              <DialogTitle>Schedule Stock Take</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Scheduled Date</Label>
                <Input type="date" name="scheduledDate" required className="bg-white/10 border-white/20" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input name="notes" className="bg-white/10 border-white/20" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Stock Takes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockTakes.map(st => (
              <div key={st._id} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{st.stockTakeNumber}</h3>
                    <p className="text-sm text-gray-400">
                      Scheduled: {new Date(st.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(st.status)}>{st.status}</Badge>
                    {st.status !== "completed" && st.status !== "cancelled" && (
                      <Button size="sm" onClick={() => { setSelectedStockTake(st); setCountDialogOpen(true); }}>
                        <ClipboardCheck className="w-4 h-4 mr-2" />Count
                      </Button>
                    )}
                  </div>
                </div>
                {st.status === "completed" && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Total Variance:</span>
                    <span className="text-white ml-2">{st.totalVariance}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Stock Count - {selectedStockTake?.stockTakeNumber}</DialogTitle>
          </DialogHeader>
          {selectedStockTake && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 font-semibold text-sm border-b border-white/10 pb-2">
                <div className="col-span-2">Product</div>
                <div>System</div>
                <div>Physical</div>
                <div>Variance</div>
              </div>
              {selectedStockTake.items.map((item: any) => (
                <div key={item.productId} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2 text-sm">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.systemStock}</div>
                  <Input
                    type="number"
                    min="0"
                    defaultValue={item.physicalCount}
                    onBlur={(e) => handleUpdateCount(item.productId, parseInt(e.target.value) || 0)}
                    className="bg-white/10 border-white/20 h-8"
                  />
                  <div className={`text-sm font-semibold ${item.variance > 0 ? "text-green-400" : item.variance < 0 ? "text-red-400" : "text-gray-400"}`}>
                    {item.variance > 0 ? "+" : ""}{item.variance}
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setCountDialogOpen(false)}>Close</Button>
                <Button onClick={handleComplete}>
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
