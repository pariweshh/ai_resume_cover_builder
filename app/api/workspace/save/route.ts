import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, state } = body;

        if (!user_id || !state) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user || user.id !== user_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await supabase
            .from("workspaces")
            .upsert({ user_id, state }, { onConflict: "user_id" });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }
}
