import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
const client = await clientPromise;
const db = client.db("landsurvey");
const transferDb = db.collection("transfer");
export async function POST(request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { message: "Invalid transfer data" },
        { status: 400 }
      );
    }

    // ObjectId এবং Date সঠিক ফরম্যাটে রূপান্তর
    const formattedData = body.map((item) => ({
      ...item,
      _id: new ObjectId(),
      khatianId: new ObjectId(item.khatianId?.$oid || item.khatianId),
      source: {
        ...item.source,
        from: new ObjectId(item.source.from?.$oid || item.source.from),
        deedDate: new Date(item.source.deedDate?.$date || item.source.deedDate),
      },
      to: new ObjectId(item.to?.$oid || item.to),
    }));

    const result = await transferDb.insertMany(formattedData);

    return NextResponse.json(
      {
        message: "Transfers saved successfully",
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting transfers:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
