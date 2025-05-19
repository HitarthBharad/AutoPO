import { NextResponse, NextRequest } from "next/server"
import { _oid, mongodb } from "@/lib/db.server";

export async function GET(request: NextRequest) {

    const dbInstance = await mongodb();
    const datasets = await dbInstance.collection("orders").find().toArray();
    return NextResponse.json(datasets, {status: 200});
}