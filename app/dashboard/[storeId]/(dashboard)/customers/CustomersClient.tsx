"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Search, Filter, Eye, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AddCustomerDialog from "@/components/AddCustomerDialog";
import EditCustomerDialog from "@/components/EditCustomerDialog";
import DeleteCustomerDialog from "@/components/DeleteCustomerDialog";
import CustomerDetailsDialog from "@/components/CustomerDetailsDialog";
import { getCustomers, getCustomerStats } from "@/lib/actions/customer.actions";
import { ICustomer } from "@/lib/types";

interface CustomersClientProps {
  storeId: string;
  initialCustomers: ICustomer[];
  initialStats: {
    totalCustomers: number;
    newThisMonth: number;
    vipCustomers: number;
    avgSpend: number;
  };
}

export default function CustomersClient({ storeId,initialCustomers, initialStats }: CustomersClientProps) {
  const [customers, setCustomers] = useState<ICustomer[]>(initialCustomers);
  const [stats, setStats] = useState(initialStats);
  const [filteredCustomers, setFilteredCustomers] = useState<ICustomer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const refreshData = async () => {
    const [newCustomers, newStats] = await Promise.all([
      getCustomers(storeId),
      getCustomerStats(storeId)
    ]);
    setCustomers(newCustomers);
    setStats(newStats);
  };

  const getCustomerStatus = (totalPurchases: number) => {
    if (totalPurchases >= 1000) return { label: "VIP", color: "bg-yellow-500/20 text-yellow-400" };
    if (totalPurchases >= 500) return { label: "PREMIUM", color: "bg-purple-500/20 text-purple-400" };
    return { label: "REGULAR", color: "bg-green-500/20 text-green-400" };
  };

  const handleEdit = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDelete = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href={`/dashboard/${storeId}`}>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-white">Customer Management</h1>
              <p className="text-gray-300 mt-1">Manage your customer database and loyalty program</p>
            </div>
            <AddCustomerDialog 
              storeId={storeId} 
              onCustomerAdded={refreshData}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">New This Month</p>
                    <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
                  </div>
                  <Plus className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">VIP Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.vipCustomers}</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0">VIP</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Avg. Spend</p>
                    <p className="text-2xl font-bold text-white">GH₵{stats.avgSpend.toFixed(0)}</p>
                  </div>
                  <div className="text-green-400">+12%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Customer List</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <Button variant="outline" size="sm" >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-3">Customer</th>
                      <th className="text-left text-gray-300 font-medium py-3">Contact</th>
                      <th className="text-left text-gray-300 font-medium py-3">Total Spent</th>
                      <th className="text-left text-gray-300 font-medium py-3">Points</th>
                      <th className="text-left text-gray-300 font-medium py-3">Status</th>
                      <th className="text-left text-gray-300 font-medium py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => {
                      const status = getCustomerStatus(customer.totalPurchases);
                      return (
                        <tr key={customer._id} className="border-b border-white/5">
                          <td className="py-4">
                            <div>
                              <p className="text-white font-medium">{customer.name}</p>
                              <p className="text-gray-400 text-sm">
                                Joined {new Date(customer.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-gray-300">{customer.email || "No email"}</p>
                              <p className="text-gray-400 text-sm">{customer.phone || "No phone"}</p>
                            </div>
                          </td>
                          <td className="py-4 text-white font-medium">GH₵{customer.totalPurchases.toFixed(2)}</td>
                          <td className="py-4 text-yellow-400 font-medium">{customer.loyaltyPoints}</td>
                          <td className="py-4">
                            <Badge className={`${status.color} border-0`}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-400 hover:text-blue-300"
                                onClick={() => handleViewDetails(customer)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-green-400 hover:text-green-300"
                                onClick={() => handleEdit(customer)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete(customer)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    {searchTerm ? "No customers found matching your search." : "No customers found."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditCustomerDialog
        customer={selectedCustomer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onCustomerUpdated={refreshData}
      />

      <DeleteCustomerDialog
        customer={selectedCustomer}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onCustomerDeleted={refreshData}
      />

      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}