import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const khatiandb = db.collection("khatian");
const ownerDb = db.collection("owners");


export async function POST(req) {
  try {
    const body = await req.json();
    // 🔹 owners এবং plots আলাদা করে নিচ্ছি, বাকিগুলো ...khatianInfo দিয়ে নিচ্ছি
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

    // 🔹 Step 2: Prepare owners with acquired plot data
    const ownerDocs = owners.map((owner) => ({
      name: owner.name,
      alive: true,
      acquired: [
        {
          acquiredType: "khatian",
          acquiredId: khatianId,
          plots: plots.map((plot) => ({
            plot_no: plot.plot_no,
            acquiredLand:
              parseFloat(plot.totalLandInPlot || 0) *
              parseFloat(owner.share || 0) *
              parseFloat(plot.share || 0),
          })),
        },
      ],
      transferred: [],
    }));

    // 🔹 Step 3: Insert owners
    const ownerResult = await ownerDb.insertMany(ownerDocs);

    if (!ownerResult.acknowledged) {
      return NextResponse.json(
        { error: "Khatian saved but owners failed to insert" },
        { status: 500 }
      );
    }

    // 🔹 Success Response
    return NextResponse.json(
      {
        message: "Khatian and owners added successfully",
        success: true,
        ownerCount: ownerResult.insertedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Insertion error:", error);
    return NextResponse.json(
      { error: "Failed to add khatian and owners", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {

    const result = await khatiandb.aggregate([
      {
        $lookup: {
          from: "owners",
          let: { khatianId: "$_id" },
          pipeline: [
            { $unwind: "$acquired" }, // মালিকদের acquired আলাদা আলাদা করো
            {
              $match: {
                $expr: {
                  $eq: ["$acquired.acquiredId", "$$khatianId"], // মিলাও acquiredId == khatian._id
                },
              },
            },
            {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                alive: { $first: "$alive" },
                transferred: { $first: "$transferred" },
                acquired: { $push: "$acquired" } // আবার সব মিলিয়ে push করো
              },
            },
          ],
          as: "owners",
        },
      }
    ]).toArray();


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
