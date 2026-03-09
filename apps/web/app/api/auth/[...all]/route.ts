import { auth } from "@cocs/auth/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    return auth.handler(request);
}

export async function POST(request: NextRequest) {
    return auth.handler(request);
}
