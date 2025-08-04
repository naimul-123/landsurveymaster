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
  const khatianId = searchParams.get("khatianId");

  if (!khatianId) {
    return NextResponse.json({ error: "Missing khatianId parameter" }, { status: 400 });
  }

  try {
    const owners = await ownerDb.find({ khatianIds: khatianId, alive: true }).toArray();

    if (owners.length <= 0) {
      return NextResponse.json({ error: "No owner found in this khatian" }, { status: 404 });
    }

    const khatian = await khatiandb.findOne({ _id: new ObjectId(khatianId) });
    if (!khatian) {
      return NextResponse.json({ error: "Khatian not found" }, { status: 404 });
    }

    // ✅ helper function: enrich plots with share info
    const enrichPlots = (plots) => {
      return plots.map(p => {
        const khatianPlot = khatian.plots.find(kp => kp.plot_no === p.plot_no);
        const totalLandInPlot = parseFloat(khatianPlot?.totalLandInPlot || 0);
        const plotShare = parseFloat(khatianPlot?.share || 1);
        const acquiredShare = parseFloat(p.share || 0) * plotShare;
        return {
          ...p,
          totalLandInPlot,
          acquiredShare,
        };
      });
    };

    const enrichedOwners = await Promise.all(
      owners.map(async (owner) => {
        // Acquired
        const acquiredDocs = await transferDb.find({ to: owner._id }).toArray();
        const enrichedAcquired = acquiredDocs.flatMap(doc => enrichPlots(doc.plots || []));

        // Transferred
        const transferredDocs = await transferDb.find({ "source.from": owner._id }).toArray();
        const enrichedTransferred = transferredDocs.flatMap(doc => enrichPlots(doc.plots || []));

        // Transferable = acquired - transferred (by plot_no)
        const transferableMap = {};

        for (const plot of enrichedAcquired) {
          const key = plot.plot_no;
          if (!transferableMap[key]) transferableMap[key] = 0;
          transferableMap[key] += plot.acquiredShare;
        }

        for (const plot of enrichedTransferred) {
          const key = plot.plot_no;
          if (!transferableMap[key]) transferableMap[key] = 0;
          transferableMap[key] -= plot.acquiredShare;
        }

        const transferable = Object.entries(transferableMap)
          .filter(([_, val]) => val > 0)
          .map(([plot_no, acquiredShare]) => {
            const plotInfo = khatian.plots.find(p => p.plot_no === plot_no);
            const totalLandInPlot = parseFloat(plotInfo?.totalLandInPlot || 0);
            const plotShare = parseFloat(plotInfo?.share || 0);
            const transferableTotalLand = totalLandInPlot * acquiredShare * plotShare;

            return {
              plot_no,
              acquiredShare,
              transferableTotalLand,
            };
          });


        return {
          ...owner,
          transferable,
          acquired: enrichedAcquired
        };
      })
    );

    return NextResponse.json({ owners: enrichedOwners }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
