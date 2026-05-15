import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [profileRes, workspaceRes, generationsRes] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, email, full_name, subscription_tier, created_at")
                .eq("id", user.id)
                .single(),
            supabase
                .from("workspaces")
                .select("state, updated_at")
                .eq("user_id", user.id)
                .single(),
            supabase
                .from("generations")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
        ]);

        const data = {
            exportDate: new Date().toISOString(),
            account: profileRes.data,
            workspace: workspaceRes.data?.state ?? null,
            workspaceLastUpdated: workspaceRes.data?.updated_at ?? null,
            generations: generationsRes.data ?? [],
        };

        return new NextResponse(JSON.stringify(data, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="resumeforge_data_${user.id.slice(0, 8)}.json"`,
            },
        });
    } catch (err) {
        console.error("[Account Export]", err);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
