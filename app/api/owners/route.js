import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const ownerDb = db.collection("owners");
// export async function POST(req) {
//   try {
//     const owners = await req.json();
//     if (!Array.isArray(owners) || owners.length === 0) {
//       return NextResponse.json(
//         { error: "Owners must be a non-empty array" },
//         { status: 400 }
//       );
//     }
//     const result = await ownerDb.insertMany(owners);
//     if (result.acknowledged) {
//       const response = NextResponse.json(
//         {
//           success: true,
//           message: "Owners added successfully",
//         },
//         { status: 200 }
//       );
//       return response;
//     }
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to add khatian", error },
//       { status: 500 }
//     );
//   }
// }
export async function GET(req) {

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  console.log(id);

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {

    const result = await ownerDb.findOne({ _id: new ObjectId(id) });

    if (result) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
