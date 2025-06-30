import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const khatindb = db.collection("khatian");
export async function POST(req) {
  try {
    const khatianInfo = await req.json();
    const result = await khatindb.insertOne(khatianInfo);
    if (result.acknowledged) {
      const response = NextResponse.json(
        { message: "khatian added successfully" },
        { status: 200 }
      );
      return response;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add khatian", error },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const result = await khatindb.find().toArray();
    if (result.length > 0) {
      const response = NextResponse.json(result, { status: 200 });
      return response;
    } else
      return NextResponse.json({ message: "No data found" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "No data found" }, { status: 501 });
  }
}
