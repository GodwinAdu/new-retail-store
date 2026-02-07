"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteStaffMember } from "@/lib/actions/staff.actions";
import { useRouter } from "next/navigation";

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
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error deleting staff member:", error);
            alert("Failed to delete staff member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-red-400">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Delete Staff Member
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to delete <span className="font-semibold text-white">{staffName}</span>? 
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setOpen(false)} 
                            className="border-slate-600 text-white hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDelete} 
                            disabled={loading} 
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete Staff
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}