"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, ArrowLeft, Users, CheckCircle, XCircle, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

interface Supplier {
  _id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  paymentTerms?: string;
  notes?: string;
  createdAt: string;
}

export default function SuppliersClient({ storeId }: { storeId: string }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", contact: "", email: "", phone: "", address: "", paymentTerms: "", notes: ""
  });

  useEffect(() => { fetchSuppliers(); }, [storeId]);

  const fetchSuppliers = async () => {
    try {
      const { getSuppliers } = await import("@/lib/actions/supplier.actions");
      const data = await getSuppliers(storeId);
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createSupplier, updateSupplier } = await import("@/lib/actions/supplier.actions");
      const result = editingSupplier
        ? await updateSupplier(storeId, editingSupplier._id, formData)
        : await createSupplier(storeId, formData);

      if (result?.success) {
        toast.success(editingSupplier ? "Supplier updated" : "Supplier created");
        setIsDialogOpen(false);
        setEditingSupplier(null);
        resetForm();
        fetchSuppliers();
      } else {
        toast.error(result?.error || "Failed to save supplier");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save supplier");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name, contact: supplier.contact || "", email: supplier.email || "",
      phone: supplier.phone || "", address: supplier.address || "",
      paymentTerms: supplier.paymentTerms || "", notes: supplier.notes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { deleteSupplier } = await import("@/lib/actions/supplier.actions");
      const result = await deleteSupplier(storeId, deleteTarget._id);
      if (result?.success) { toast.success("Supplier deleted"); fetchSuppliers(); }
      else toast.error(result?.error || "Failed to delete supplier");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete supplier");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", contact: "", email: "", phone: "", address: "", paymentTerms: "", notes: "" });
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = suppliers.filter(s => s.isActive).length;
  const inactiveCount = suppliers.filter(s => !s.isActive).length;

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
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/70 rounded-2xl p-6 shadow-lg h-48 animate-pulse" />
            ))}
          </div>
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
              <Link href={`/dashboard/${storeId}`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
              <p className="text-gray-500 mt-1">Manage your supplier relationships</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingSupplier(null); }} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact">Contact Person</Label>
                      <Input id="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input id="paymentTerms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="e.g., Net 30 days" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                      {editingSupplier ? "Update" : "Create"} Supplier
                    </Button>
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
                    <p className="text-gray-500 text-sm">Total Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Inactive</p>
                    <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Badge variant="secondary" className="text-sm">{filteredSuppliers.length} suppliers</Badge>
          </div>

          {/* Supplier Cards */}
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">
                {searchTerm ? "No suppliers found matching your search." : "No suppliers added yet."}
              </p>
              {!searchTerm && (
                <Button onClick={() => { resetForm(); setEditingSupplier(null); setIsDialogOpen(true); }} className="mt-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />Add Your First Supplier
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier._id} className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-900">{supplier.name}</CardTitle>
                      <Badge className={`border-0 ${supplier.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {supplier.contact && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {supplier.contact}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                    {supplier.paymentTerms && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Payment:</span> {supplier.paymentTerms}
                      </div>
                    )}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(supplier)} className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(supplier)} className="text-red-500 hover:text-red-600 hover:border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Delete Confirmation */}
    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteTarget?.name}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700 text-white">
            {deleteLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
