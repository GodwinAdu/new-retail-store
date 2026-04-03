"use client";

import { Users, Search, Filter, Eye, UserCheck, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function StaffPageClient({ storeId, staff, stats, user }: StaffPageClientProps) {
    const { hasPermission } = usePermissions(user);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
            <div className="p-6 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                <Link href={`/dashboard/${storeId}`}>
                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                            <p className="text-gray-500 mt-1">Manage your team members and schedules</p>
                        </div>
                        {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                            <AddStaffDialog storeId={storeId}  />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Staff</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">On Duty</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
                                    </div>
                                    <UserCheck className="w-8 h-8 text-cyan-500" />
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
                                    <Clock className="w-8 h-8 text-amber-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Avg. Hours/Week</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.avgHours}</p>
                                    </div>
                                    <div className="text-green-400">+2.3</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-gray-900">Staff Members</CardTitle>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Search className="w-4 h-4 mr-2" />
                                        Search
                                    </Button>
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
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left text-gray-500 font-medium py-3">Staff Member</th>
                                            <th className="text-left text-gray-500 font-medium py-3">Role</th>
                                            <th className="text-left text-gray-500 font-medium py-3">Shift</th>
                                            <th className="text-left text-gray-500 font-medium py-3">Hours/Week</th>
                                            <th className="text-left text-gray-500 font-medium py-3">Status</th>
                                            <th className="text-left text-gray-500 font-medium py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff.length > 0 ? staff.map((member: any) => (
                                            <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="py-4">
                                                    <div>
                                                        <p className="text-white font-medium">{member.fullName}</p>
                                                        <p className="text-gray-400 text-sm">{member.email}</p>
                                                        <p className="text-gray-500 text-xs">{member.phoneNumber || 'N/A'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-0">
                                                        {member.role.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-gray-600">Full Day</td>
                                                <td className="py-4 text-gray-900 font-medium">40h</td>
                                                <td className="py-4">
                                                    <Badge className={`${
                                                        member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    } border-0`}>
                                                        {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex space-x-2">
                                                        {hasPermission(PERMISSIONS.VIEW_STAFF) && (
                                                            <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                                                            <EditStaffDialog staff={member} />
                                                        )}
                                                        {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                                                            <DeleteStaffDialog staffId={member._id} staffName={member.fullName} />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-gray-400">
                                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p>No staff members found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}