import { mongodb } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { line_items } = body;
    
        const newOrder = {
            order_number: "ORD-" + Math.floor(Math.random() * 10000),
            line_items,
            created_at: new Date()
        };

        const dbInstance = await mongodb();

        const orderInstance = await dbInstance
            .collection("orders")
            .insertOne(newOrder);

        return NextResponse.json({...newOrder, _id: orderInstance.insertedId}, { status: 201 })

    }
    catch (err) {
        console.error(err);
        return NextResponse.json({success: false, message: "Something went wrong"}, {status: 500})
    }
}