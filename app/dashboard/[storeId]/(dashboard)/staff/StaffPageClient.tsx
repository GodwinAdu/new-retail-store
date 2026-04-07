"use client";

import { useState, useMemo } from "react";
import { Users, Search, Eye, UserCheck, Clock, ArrowLeft, Mail, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import AddStaffDialog from "@/components/AddStaffDialog";
import EditStaffDialog from "@/components/EditStaffDialog";
import DeleteStaffDialog from "@/components/DeleteStaffDialog";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";

interface StaffPageClientProps {
    storeId: string;
    staff: any[];
    stats: any;
    user: any;
}

const roleColors: Record<string, string> = {
    owner: "bg-amber-100 text-amber-700",
    admin: "bg-blue-100 text-blue-700",
    manager: "bg-emerald-100 text-emerald-700",
    sales_associate: "bg-cyan-100 text-cyan-700",
    cashier: "bg-purple-100 text-purple-700",
    inventory_manager: "bg-orange-100 text-orange-700",
};

const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

export default function StaffPageClient({ storeId, staff, stats, user }: StaffPageClientProps) {
    const { hasPermission } = usePermissions(user);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredStaff = useMemo(() => {
        return staff.filter(m => {
            const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.phoneNumber || "").includes(searchTerm);
            const matchesRole = roleFilter === "all" || m.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [staff, searchTerm, roleFilter]);

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
                            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                            <p className="text-gray-500 mt-1">Manage your team members and roles</p>
                        </div>
                        {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                            <AddStaffDialog storeId={storeId} />
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Staff</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Active</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-cyan-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">On Break</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.onBreak}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Roles</p>
                                        <p className="text-2xl font-bold text-gray-900">{new Set(staff.map(s => s.role)).size}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search & Filter */}
                    <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <CardTitle className="text-gray-900">Staff Members ({filteredStaff.length})</CardTitle>
                                <div className="flex space-x-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-56">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="sales_associate">Sales Associate</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                            <SelectItem value="inventory_manager">Inventory Mgr</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredStaff.length === 0 ? (
                                <div className="text-center py-16">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-lg font-medium text-gray-500">
                                        {searchTerm || roleFilter !== "all" ? "No staff found matching your criteria." : "No staff members yet."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredStaff.map((member: any) => (
                                        <div key={member._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 hover:shadow-md transition-all">
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${member.isActive ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                    {getInitials(member.fullName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-gray-900 font-semibold truncate">{member.fullName}</h3>
                                                        <Badge className={`${member.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'} border-0 text-[10px] ml-2`}>
                                                            {member.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <Badge className={`${roleColors[member.role] || 'bg-gray-100 text-gray-600'} border-0 text-[10px] mt-1`}>
                                                        {member.role.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mt-3 space-y-1.5 text-sm">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                                {member.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{member.phoneNumber}</span>
                                                    </div>
                                                )}
                                                {member.lastLogin && (
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                        <Clock className="w-3 h-3" />
                                                        Last login: {new Date(member.lastLogin).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                                {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                                                    <EditStaffDialog staff={member} />
                                                )}
                                                {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                                                    <DeleteStaffDialog staffId={member._id} staffName={member.fullName} />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
