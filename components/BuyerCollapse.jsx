import React, { useEffect, useMemo, useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

const BuyerCollapse = ({
  buyer,
  idx,
  handler,
  selectedKhatians,
  totalSelectedLand,
  landTransferType,
  isSelectedOwner,
  khatianTotalSelectedMap,
  remainingLand,
}) => {
  const [totalInputVal, setTotalInputVal] = useState("");
  const [totalSelectedland, setTotalSelectedLand] = useState(0);
  const [selectedLandInfo, setSelectedLandInfo] = useState([]);

  // Calculate total selected land for this buyer across all khatians
  const totalSelectedInKhatians = useMemo(() => {
    return selectedLandInfo.reduce((total, khatian) => {
      const sum = khatian.plots.reduce(
        (plotSum, plot) => plotSum + Number(plot.selectedLand || 0),
        0
      );
      return total + sum;
    }, 0);
  }, [selectedLandInfo]);

  useEffect(() => {
    setTotalSelectedLand(
      selectedLandInfo.reduce((total, khatian) => {
        const sum = khatian.plots.reduce(
          (plotSum, plot) => plotSum + Number(plot.selectedLand || 0),
          0
        );
        return total + sum;
      }, 0)
    );
  }, [selectedLandInfo]);

  // Handle land selection updates based on transfer type
  const handleSelectLand = (landInfo) => {
    if (landTransferType === "portionBased") {
      const { selectedLand } = landInfo;
      const totalTransferable = selectedKhatians.reduce(
        (sum, k) => sum + Number(k.totalSelectedLand || 0),
        0
      );

      const updatedSelectedLandInfo = selectedKhatians.map((khatian) => {
        const khatianShare = khatian.totalSelectedLand / totalTransferable;
        const totalSelectedForKhatian = khatianShare * selectedLand;

        const plots = khatian.plots
          .filter((plot) => plot.isSelected)
          .map((plot) => ({
            plot_no: plot.plot_no,
            selectedLand:
              (plot.totalSelectedLand * totalSelectedForKhatian) /
              khatian.totalSelectedLand,
          }));

        return { khatianId: khatian._id, plots };
      });

      setSelectedLandInfo(updatedSelectedLandInfo);
    } else if (landTransferType === "individualBased") {
      const { khatianId, selectedLand } = landInfo;
      const val = Number(selectedLand);
      const khatian = selectedKhatians.find((k) => k._id === khatianId);
      if (!khatian) return;

      const khatianShare = val / khatian.totalSelectedLand;

      setSelectedLandInfo((prev) => {
        const exists = prev.find((k) => k.khatianId === khatianId);

        const updatedPlots = khatian.plots.map((plot) => ({
          plot_no: plot.plot_no,
          selectedLand: plot.totalSelectedLand * khatianShare,
        }));

        if (exists) {
          return prev.map((k) =>
            k.khatianId === khatianId ? { ...k, plots: updatedPlots } : k
          );
        } else {
          return [...prev, { khatianId, plots: updatedPlots }];
        }
      });
    }
  };

  return (
    <div
      key={buyer._id}
      className={`collapse collapse-plus ${
        remainingLand <= 0 ? "text-error" : ""
      }`}
    >
      {remainingLand > 0 && <input type="checkbox" className="peer" />}
      <div className="collapse-title shadow shadow-gray-300 flex justify-between items-center">
        <h2 className="text-xs font-bold">
          {idx + 1}. {buyer.name}
        </h2>
        {isSelectedOwner && (
          <p className="text-xs text-info font-black">
            রসদীয় মোট জমি: {Number(totalSelectedLand).toFixed(4)}
          </p>
        )}
      </div>

      <div className="collapse-content">
        <div className="flex justify-between items-center">
          {landTransferType === "portionBased" && (
            <label className="label">
              <span className="text-sm">রসদীয় জমি</span>
              <input
                type="number"
                name="selectedTotalLand"
                defaultValue={totalSelectedland || ""}
                className="input input-sm grow"
                onChange={(e) => {
                  const valStr = e.target.value;
                  if (!valStr || Number(valStr) <= 0) {
                    setTotalInputVal("");
                    setSelectedLandInfo([]);
                    return;
                  }

                  const valNum = Number(Number(valStr).toFixed(4));
                  const maxVal = Number(Number(remainingLand).toFixed(4));

                  if (valNum > maxVal) {
                    alert(
                      "Total selected land cannot be greater than total transferable land."
                    );
                    setTotalInputVal("");
                    setSelectedLandInfo([]);
                    return;
                  }

                  setTotalInputVal(valStr);
                  handleSelectLand({ selectedLand: valNum });
                }}
              />
            </label>
          )}

          {landTransferType === "individualBased" && (
            <table className="table table-xs w-full">
              <thead>
                <tr>
                  <th>তফসিল</th>
                  <th>হস্তান্তরযোগ্য জমি</th>
                  <th>গ্রহীতার জমি</th>
                </tr>
              </thead>
              <tbody>
                {selectedKhatians.map((khatian, idx) => {
                  const buyerLandInfo = selectedLandInfo.find(
                    (k) => k.khatianId === khatian._id
                  );
                  const totalSelected =
                    buyerLandInfo?.plots.reduce(
                      (sum, plot) => sum + plot.selectedLand || 0,
                      0
                    ) || 0;

                  const totalSelectable = (khatian.plots || []).reduce(
                    (sum, plot) => sum + Number(plot.totalSelectedLand || 0),
                    0
                  );

                  const khatianSelectedTotal =
                    khatianTotalSelectedMap[String(khatian._id)] || 0;

                  const remainingForKhatian =
                    totalSelectable - khatianSelectedTotal;

                  return (
                    <tr key={khatian._id}>
                      <td>{idx + 1} নং তফসিল</td>
                      <td>{remainingForKhatian.toFixed(4)}</td>
                      <td>
                        <input
                          type="text"
                          name="selectedTotalLand"
                          className="input input-sm"
                          defaultValue={totalSelected || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            if (val > remainingForKhatian) {
                              alert(
                                "Selected land can not exceed khatian's total transferable land."
                              );
                              setSelectedLandInfo((prev) =>
                                prev.filter((k) => k.khatianId !== khatian._id)
                              );
                              e.target.value = "";
                              return;
                            }
                            handleSelectLand({
                              khatianId: khatian._id,
                              selectedLand: val,
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td>সর্বমোট:</td>
                  <td>{remainingLand.toFixed(4)}</td>
                  <td>{totalSelectedInKhatians.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          )}

          <button
            className="btn btn-sm btn-soft btn-success w-40 hover:text-white mt-2"
            disabled={!totalSelectedInKhatians}
            onClick={() => {
              handler({
                _id: buyer._id,
                name: buyer.name,
                selectedLandInfo,
              });
            }}
          >
            {isSelectedOwner ? <FaAnglesLeft /> : <FaAnglesRight />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerCollapse;
