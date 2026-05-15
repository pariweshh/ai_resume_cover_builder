import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete workspace
        await supabase.from("workspaces").delete().eq("user_id", user.id);

        // Delete generation history
        await supabase.from("generations").delete().eq("user_id", user.id);

        // Delete profile
        await supabase.from("profiles").delete().eq("id", user.id);

        // Delete auth user (must be last)
        await admin.auth.admin.deleteUser(user.id);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[Account Delete]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
