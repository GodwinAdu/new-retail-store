"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Loader2 } from "lucide-react";
import { updateStaffMember } from "@/lib/actions/staff.actions";
import { useRouter } from "next/navigation";

interface EditStaffDialogProps {
    staff: {
        _id: string;
        fullName: string;
        email: string;
        phone?: string;
        role: string;
        isActive: boolean;
    };
}

export default function EditStaffDialog({ staff }: EditStaffDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phone || "",
        role: staff.role,
        isActive: staff.isActive
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateStaffMember(staff._id, formData);
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating staff member:", error);
            alert("Failed to update staff member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Edit Staff Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="bg-slate-800 border-slate-600 text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="bg-slate-800 border-slate-600 text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="bg-slate-800 border-slate-600 text-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="sales_associate">Sales Associate</SelectItem>
                                <SelectItem value="cashier">Cashier</SelectItem>
                                <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.isActive.toString()} onValueChange={(value) => setFormData({...formData, isActive: value === 'true'})}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-white hover:bg-slate-800">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Staff
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}