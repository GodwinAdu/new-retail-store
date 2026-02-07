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
                            <h1 className="text-3xl font-bold text-white">Staff Management</h1>
                            <p className="text-gray-300 mt-1">Manage your team members and schedules</p>
                        </div>
                        {hasPermission(PERMISSIONS.MANAGE_STAFF) && (
                            <AddStaffDialog storeId={storeId}  />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-300 text-sm">Total Staff</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalStaff}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-300 text-sm">On Duty</p>
                                        <p className="text-2xl font-bold text-white">{stats.activeStaff}</p>
                                    </div>
                                    <UserCheck className="w-8 h-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-300 text-sm">On Break</p>
                                        <p className="text-2xl font-bold text-white">{stats.onBreak}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-300 text-sm">Avg. Hours/Week</p>
                                        <p className="text-2xl font-bold text-white">{stats.avgHours}</p>
                                    </div>
                                    <div className="text-green-400">+2.3</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white">Staff Members</CardTitle>
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
                                        <tr className="border-b border-white/10">
                                            <th className="text-left text-gray-300 font-medium py-3">Staff Member</th>
                                            <th className="text-left text-gray-300 font-medium py-3">Role</th>
                                            <th className="text-left text-gray-300 font-medium py-3">Shift</th>
                                            <th className="text-left text-gray-300 font-medium py-3">Hours/Week</th>
                                            <th className="text-left text-gray-300 font-medium py-3">Status</th>
                                            <th className="text-left text-gray-300 font-medium py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff.length > 0 ? staff.map((member: any) => (
                                            <tr key={member._id} className="border-b border-white/5">
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
                                                <td className="py-4 text-gray-300">Full Day</td>
                                                <td className="py-4 text-white font-medium">40h</td>
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
                                                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
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