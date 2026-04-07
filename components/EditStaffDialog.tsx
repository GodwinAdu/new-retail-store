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
import { toast } from "sonner";

interface EditStaffDialogProps {
    staff: any;
}

export default function EditStaffDialog({ staff }: EditStaffDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phoneNumber || "",
        role: staff.role,
        isActive: staff.isActive
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const storeId = typeof staff.storeId === 'object' ? staff.storeId._id || staff.storeId : staff.storeId;
            await updateStaffMember(storeId.toString(), staff._id, formData);
            toast.success("Staff member updated");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update staff member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3.5 h-3.5 mr-1" />Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="sales_associate">Sales Associate</SelectItem>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select value={formData.isActive.toString()} onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Update Staff
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
