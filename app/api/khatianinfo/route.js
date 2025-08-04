import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const khatiandb = db.collection("khatian");
const ownerDb = db.collection("owners");
const transferDb = db.collection("transfer");

export async function POST(req) {
  try {
    const body = await req.json();
    const { owners, plots, totalLand, ...khatianInfo } = body;

    if (!owners || !Array.isArray(owners) || owners.length === 0) {
      return NextResponse.json(
        { error: "At least one owner is required." },
        { status: 400 }
      );
    }

    if (!plots || !Array.isArray(plots) || plots.length === 0) {
      return NextResponse.json(
        { error: "At least one plot is required." },
        { status: 400 }
      );
    }

    // 🔹 Step 1: Insert khatian
    const khatianResult = await khatiandb.insertOne({
      ...khatianInfo,
      plots,
      totalLand,
    });

    if (!khatianResult.acknowledged) {
      return NextResponse.json(
        { error: "Failed to insert khatian" },
        { status: 500 }
      );
    }

    const khatianId = khatianResult.insertedId;

    // 🔹 Step 2: Prepare owners
    const ownerDocs = owners.map((owner) => ({
      name: owner.name,
      khatianId,
      alive: true,
    }));

    // 🔹 Step 3: Insert owners
    const ownerResult = await ownerDb.insertMany(ownerDocs);

    if (!ownerResult.acknowledged) {
      return NextResponse.json(
        { error: "Khatian saved but owners failed to insert" },
        { status: 500 }
      );
    }

    const insertedOwnerIds = Object.values(ownerResult.insertedIds);

    // 🔹 Step 4: Insert into transferDb
    const transferDocs = insertedOwnerIds.map((ownerId, index) => ({
      khatianId,
      source: {
        acquiredType: "খতিয়ান",
        from: khatianId,
      },
      to: ownerId,
      plots: plots.map((plot) => ({
        plot_no: plot.plot_no,
        share: owners[index].share * plot.share,
      })),
    }));

    const transferResult = await transferDb.insertMany(transferDocs);

    if (!transferResult.acknowledged) {
      return NextResponse.json(
        { error: "Khatian and owners saved, but transfer records failed" },
        { status: 500 }
      );
    }

    // 🔹 Success Response
    return NextResponse.json(
      {
        message: "Khatian, owners, and transfer records added successfully",
        success: true,
        ownerCount: ownerResult.insertedCount,
        transferCount: transferResult.insertedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Insertion error:", error);
    return NextResponse.json(
      { error: "Failed to add khatian, owners, and transfers", details: error.message },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   try {
//     const result = await khatiandb.aggregate([
//       {
//         $lookup: {
//           from: "transfer",
//           localField: "_id",
//           foreignField: "source.from",
//           as: "transfers"
//         }
//       },
//       {
//         $unwind: "$transfers"
//       },
//       {
//         $lookup: {
//           from: "owners",
//           localField: "transfers.to",



//           foreignField: "_id",
//           as: "ownerInfo"
//         }
//       },
//       {
//         $unwind: "$ownerInfo"
//       },
//       {
//         $group: {
//           _id: "$_id",
//           district: { $first: "$district" },
//           thana: { $first: "$thana" },
//           mouja: { $first: "$mouja" },
//           khatian_No: { $first: "$khatian_No" },
//           plots: { $first: "$plots" },
//           totalLand: { $first: "$totalLand" },
//           owners: {
//             $push: {
//               _id: "$ownerInfo._id",
//               name: "$ownerInfo.name",
//               alive: "$ownerInfo.alive",
//               acquired: "$ownerInfo.acquired",
//               transferred: "$ownerInfo.transferred",
//               shareInfo: "$transfers.plots" // 🟢 transfer থেকে পাওয়া প্লট অনুযায়ী শেয়ার
//             }
//           }
//         }
//       }
//     ]).toArray();

//     if (result.length === 0) {
//       return NextResponse.json({ message: "No data found" }, { status: 404 });
//     }

//     return NextResponse.json(result, { status: 200 });

//   } catch (error) {
//     console.error("Aggregation error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch khatian with owners", details: error.message },
//       { status: 500 }
//     );
//   }
// }
export async function GET() {
  try {
    const result = await khatiandb.find({}).toArray();

    if (result.length === 0) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Aggregation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch khatian with owners", details: error.message },
      { status: 500 }
    );
  }
}

