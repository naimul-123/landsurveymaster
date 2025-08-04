import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const client = await clientPromise;
const db = client.db("landsurvey");
const ownerDb = db.collection("owners");
const transferDb = db.collection("transfer");
const khatiandb = db.collection("khatian");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const owner = await ownerDb.findOne({ _id: new ObjectId(id) });

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const acquired = await transferDb.find({ "to": new ObjectId(id) }).toArray() || [];
    const transferred = await transferDb.find({ "source.from": new ObjectId(id) }).toArray() || [];

    const khatian = await khatiandb.findOne({ _id: new ObjectId(owner?.khatianId) });

    if (!khatian) {
      return NextResponse.json({ error: "Khatian not found" }, { status: 404 });
    }

    // ✅ এখন acquired এর প্রতিটি item enriched করি
    const enrichedAcquired = acquired?.map(acq => {
      const calculatedPlots = acq.plots?.map(p => {
        const khatianPlot = khatian.plots.find(kp => kp.plot_no === p.plot_no);
        const totalLandInPlot = parseFloat(khatianPlot?.totalLandInPlot || 0);
        const plotShare = parseFloat(khatianPlot?.share || 1); // fallback 1
        const acquiredShare = parseFloat(p.share || 0) * plotShare;
        return {
          ...p,
          totalLandInPlot,
          acquiredShare,
        };
      }) || [];

      return {

        ...acq,
        plots: calculatedPlots,
      };
    });
    // ✅ এখন transferred এর প্রতিটি item enriched করি
    const enrichedTransfered = transferred?.map(tnans => {
      const calculatedPlots = tnans.plots?.map(p => {
        const khatianPlot = khatian.plots.find(kp => kp.plot_no === p.plot_no);
        const totalLandInPlot = parseFloat(khatianPlot?.totalLandInPlot || 0);
        const plotShare = parseFloat(khatianPlot?.share || 1); // fallback 1
        const acquiredShare = parseFloat(p.share || 0) * plotShare;
        return {
          ...p,
          totalLandInPlot,
          acquiredShare,
        };
      }) || [];

      return {

        ...tnans,
        plots: calculatedPlots,
      };
    });
    const { _id, plots, totalLand, ...rest } = khatian
    const result = {
      ...rest,
      ...owner,
      acquired: enrichedAcquired,
      transfered: enrichedTransfered,
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
