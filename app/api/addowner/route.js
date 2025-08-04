import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const ownerDb = db.collection("owners");
export async function POST(req) {
  try {
    const body = await req.json();
    const owner = body;
    if (!owner.name || !Array.isArray(owner.khatianIds) || owner.khatianIds.length === 0) {
      return NextResponse.json(
        { error: "Some information is missing. Please try again." },
        { status: 400 }
      );
    }
    const result = await ownerDb.insertOne(owner);
    if (result.acknowledged) {
      const insertedowner = await ownerDb.findOne({ _id: result.insertedId })
      return NextResponse.json({ owner: insertedowner, success: true }, { status: 200 })
    } else {
      return NextResponse.json(
        { error: "Failed to insert owner." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Insertion error:", error);
    return NextResponse.json(
      { error: "Failed to add owner", details: error.message },
      { status: 500 }
    );
  }
}



