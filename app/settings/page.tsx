import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Navbar } from "@/components/landing/navbar";

export default async function SettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-3xl px-6 pb-20 pt-24">
                <SettingsPanel />
            </div>
        </main>
    );
}
