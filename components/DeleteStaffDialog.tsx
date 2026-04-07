"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteStaffMember } from "@/lib/actions/staff.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteStaffDialogProps {
    staffId: string;
    staffName: string;
}

export default function DeleteStaffDialog({ staffId, staffName }: DeleteStaffDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteStaffMember(staffId);
            toast.success("Staff member deleted");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete staff member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:border-red-200">
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center text-red-600">
                        <AlertTriangle className="w-5 h-5 mr-2" />Delete Staff Member
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">{staffName}</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleDelete} disabled={loading} variant="destructive">
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
