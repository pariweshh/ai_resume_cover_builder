import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Workspace } from "@/components/dashboard/workspace";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    return <ErrorBoundary><Workspace /></ErrorBoundary>;
}
