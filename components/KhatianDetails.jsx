import Link from "next/link";
import React from "react";

const KhatianDetails = ({ khatian }) => {

  console.log(khatian);
  if (khatian) {
    return (
      <div>
        <div>
          <h2 className="text-center text-3xl">
            খতিয়ান নং {khatian.khatian_No}
          </h2>
          <div className="flex justify-between">
            <p>জেলা: {khatian?.district} </p>
            <p> থানা: {khatian.thana} </p>
            <p> মৌজা:{khatian.mouja} </p>
            <p> {khatian?.khatian_type} </p>
            <p>খতিয়ান নং:{khatian?.khatian_No || ""} </p>
          </div>
        </div>
        <table className="table table-xs">
          <thead>
            <tr>
              <th>#</th>
              <th>মালিকের নাম</th>
              <th>প্রাপ্ত মোট জমি</th>
              <th>বিস্তারিত</th>
            </tr>
          </thead>
          <tbody>
            {khatian?.owners?.map((owner, idx) => {
              const totalAcquired = owner.shareInfo.reduce((sum, shareEntry) => {
                const plot = khatian.plots.find(p => p.plot_no === shareEntry.plot_no);
                const land = (plot?.totalLandInPlot || 0) * (plot?.share || 0) * (shareEntry.share || 0);
                return sum + land;
              }, 0);

              return <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{owner.name} </td>
                <td>{Number(totalAcquired).toFixed(3)}</td>
                <td><Link href={`/viewkhatian/${owner._id}`} className="link">Click to see details</Link></td>
              </tr>
            })}
          </tbody>
        </table>
        {/* {khatian?.owners?.map((owner) => (
          <div
            key={owner.name}
            className="bg-base-100 border-base-300 collapse border"
          >
            <input type="checkbox" className="peer" />
            <div className="collapse-title bg-accent-content text-white flex justify-between">
              <div>
                <p>মালিকের নাম: {owner.name?.split(",")[0]}</p>
                <p>{owner.name?.split(",")[1]}</p>
              </div>

              <div className="text-right">
                <p>মালিকানার অংশ: {Number(owner.share).toFixed(3)}</p>
                <p>
                  প্রাপ্ত মোট জমি:{" "}
                  {Number(owner.share * khatian.totalLand).toFixed(3)}
                </p>
              </div>
            </div>
            <div className="collapse-content bg-accent-content text-white peer-checked:bg-gray-200 peer-checked:text-accent-content">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th className="text-wrap max-w-1/12">দাগ নং</th>
                    <th className="text-wrap max-w-1/12">
                      দাগে মোট জমি (শতাংশ)
                    </th>
                    <th className="text-wrap max-w-1/12">
                      দাগের মধ্যে অত্র খতিয়ানের অংশ
                    </th>
                    <th className="text-wrap max-w-1/12">
                      দাগের মধ্যে অত্র খতিয়ানের জমি (শতাংশ)
                    </th>
                    <th className="text-wrap max-w-1/12">
                      দাগে মালিকের জমি (শতাংশ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {khatian.plots?.map((plot) => (
                    <>
                      <tr key={plot.plot_no} className="border-b-2">
                        <td>{plot.plot_no}</td>
                        <td className="text-right">{plot.totalLandInPlot}</td>
                        <td className="text-right">
                          {Number(plot.share).toFixed(4)}
                        </td>
                        <td className="text-right">
                          {Number(plot.share * plot.totalLandInPlot).toFixed(4)}
                        </td>
                        <td className="text-right">
                          {Number(
                            plot.share * plot.totalLandInPlot * owner.share
                          ).toFixed(4)}
                        </td>
                      </tr>
                    </>
                  ))}
                  <tr>
                    <td className="text-right font-bold text-black" colSpan={5}>
                      সর্মমোট:{" "}
                      {Number(owner.share * khatian.totalLand).toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))} */}
      </div>
    );
  } else return <div></div>;
};

export default KhatianDetails;
