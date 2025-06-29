import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const userDb = db.collection("khatian");
export async function POST(req) {
    try {
        const khatianInfo = await req.json();

        const result = await userDb.insertOne({ khatianInfo });
        if (result.acknowledged) {
            const response = NextResponse.json(
                { message: "khatian added successfully" },
                { status: 200 }
            );
            return response;
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to add khatian", error }, { status: 500 });
    }
}
