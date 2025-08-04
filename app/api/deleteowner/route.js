import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const ownerDb = db.collection("owners");
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Some information is missing. Please try again." },
        { status: 400 }
      );
    }
    const result = await ownerDb.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount) {

      return NextResponse.json({ message: "deleted buyer successfully", success: true }, { status: 200 })
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



