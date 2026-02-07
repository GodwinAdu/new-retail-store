import { redirect } from "next/navigation";
import { currentUser } from "@/lib/helpers/current-user";

export default async function DashboardRootPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    if (!user.storeId) {
        redirect("/sign-up");
    }

    redirect(`/dashboard/${user.storeId}`);
}