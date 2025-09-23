import db from "@/lib/db";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const batches = await db('playwright_batches').select("*");
    return NextResponse.json(batches)
}