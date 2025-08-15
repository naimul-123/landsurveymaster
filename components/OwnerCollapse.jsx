import React, { useEffect, useMemo, useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

const OwnerCollapse = ({
  owner,
  idx,
  handler,
  khatian,
  landAmountType,
  isSelectedOwner,
}) => {
  const [totalInputVal, setTotalInputVal] = useState("");
  // const [totalSelectedLand, setTotalSelectedLand] = useState(0);
  const [selectedLandInfo, setSelectedLandInfo] = useState(() => {
    if (!owner?.transferable || owner.transferable.length === 0) {
      return [];
    } else
      return owner.transferable.map((p) => ({
        plot_no: p.plot_no,
        selectedLand: p.selectedLand != null ? String(p.selectedLand) : "",
      }));
  });

  const totalSelectedLand = useMemo(() => {
    return selectedLandInfo.reduce((sum, item) => {
      const val = parseFloat(item.selectedLand);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [selectedLandInfo]);

  useEffect(() => {
    if (!owner?.transferable || owner.transferable.length === 0) {
      setSelectedLandInfo([]);
    } else {
      setSelectedLandInfo(
        owner.transferable
          .filter((plot) => plot.isSelected)
          .map((p) => ({
            plot_no: p.plot_no,
            selectedLand: p.selectedLand != null ? String(p.selectedLand) : "",
          }))
      );
    }
  }, [owner.transferable]);

  const filtered = owner.transferable?.filter((plot) => plot.isSelected) || [];

  const totalTransfarableLand = filtered.reduce(
    (sum, plot) => sum + Number(plot.transferableTotalLand || 0),
    0
  );

  const handleSelectLand = (landInfo) => {
    if (landAmountType === "portionBased") {
      const { selectedLand } = landInfo;

      const selectedShare = Number(selectedLand) / totalTransfarableLand;

      const updated =
        owner.transferable
          ?.filter((plot) => plot.isSelected)
          .map((plot) => {
            return {
              plot_no: plot.plot_no,
              selectedLand: Number(
                plot.transferableTotalLand * selectedShare
              ).toFixed(3),
            };
          }) || [];
      setSelectedLandInfo(updated);
      return;
    }

    if (landAmountType === "individualBased") {
      const { plot_no, transferableTotalLand, selectedLand } = landInfo;
      const val = Number(selectedLand);

      if (selectedLand === "" || isNaN(val)) {
        setSelectedLandInfo((prev) =>
          prev.filter((item) => item.plot_no !== plot_no)
        );
        return;
      }

      if (val > transferableTotalLand) {
        alert(
          "Transferable land must be less than or equal to transferable total land."
        );
        setSelectedLandInfo((prev) =>
          prev.filter((item) => item.plot_no !== plot_no)
        );
        return;
      }

      setSelectedLandInfo((prev) => {
        const exists = prev.find((item) => item.plot_no === plot_no);
        if (exists) {
          return prev.map((item) =>
            item.plot_no === plot_no ? { ...item, selectedLand: val } : item
          );
        } else {
          return [...prev, { plot_no, selectedLand: val }];
        }
      });
    }
  };

  return (
    totalTransfarableLand > 0 && (
      <div key={owner._id} className="collapse collapse-arrow">
        <input type="checkbox" className="peer" />
        <div className="collapse-title">
          <h2 className="text-xs font-bold">
            {idx + 1}. {owner.name}
          </h2>
          <p className="text-xs text-info font-black">
            {isSelectedOwner
              ? `রসদীয় মোট জমি: ${Number(totalSelectedLand).toFixed(4)}`
              : `হস্তান্তরযোগ্য জমি: ${Number(totalTransfarableLand).toFixed(
                  4
                )}`}
          </p>
        </div>
        <div className="collapse-content flex items-center justify-between gap-2">
          {landAmountType === "portionBased" && (
            <label className="label grow">
              <span className="text-sm">রসদীয় জমি</span>
              {!isSelectedOwner && (
                <span
                  className={`badge badge-soft font-bold badge-info
                  `}
                  onClick={() => {
                    setSelectedLandInfo([]);
                    handleSelectLand({
                      selectedLand: totalTransfarableLand,
                    });
                    setTotalInputVal(totalTransfarableLand);
                  }}
                >
                  Select All
                </span>
              )}
              <div className="group">
                {/* এই ইনপুটে একবার ভ্যালু দিলে পরে আর ইডিট করা যায় না। এটা ঠিক করে দাও */}
                <input
                  type="number"
                  readOnly={isSelectedOwner}
                  name="selectedTotalLand"
                  className="input input-sm w-full"
                  value={
                    isSelectedOwner ? totalSelectedLand : totalInputVal ?? ""
                  }
                  onChange={(e) => {
                    const inputVal = e.target.value;

                    // Reset previous selection
                    setSelectedLandInfo([]);

                    // Input validation
                    if (!inputVal || Number(inputVal) <= 0) {
                      setTotalInputVal(""); // Clear if invalid
                      return;
                    }

                    const val = Number(Number(inputVal).toFixed(4));
                    const max = Number(
                      Number(totalTransfarableLand).toFixed(4)
                    );

                    if (val > max) {
                      alert(
                        "Total selected land could not be greater than total transferable land."
                      );
                      setTotalInputVal("");
                      return;
                    }

                    // ✅ Save to state and send to handler
                    setTotalInputVal(inputVal);
                    handleSelectLand({
                      selectedLand: inputVal,
                    });
                  }}
                />
              </div>
            </label>
          )}
          {landAmountType === "individualBased" && (
            <table className="table table-xs grow">
              <thead>
                <tr>
                  <th>দাগ নং</th>
                  <th>হস্তান্তরযোগ্য জমি</th>
                  <th>রসদীয় জমি</th>
                </tr>
              </thead>
              <tbody>
                {owner.transferable
                  .filter((plot) => plot.isSelected)
                  .map((plot) => {
                    const entry = selectedLandInfo.find(
                      (e) => e.plot_no === plot.plot_no
                    );
                    return (
                      <tr className="" key={plot.plot_no}>
                        <td className="">{plot.plot_no}</td>
                        <td className="flex items-center justify-between">
                          {Number(plot.transferableTotalLand).toFixed(4)}

                          {!isSelectedOwner && (
                            <button
                              className="badge badge-soft badge-info"
                              onClick={() =>
                                handleSelectLand({
                                  plot_no: plot.plot_no,
                                  transferableTotalLand:
                                    plot.transferableTotalLand,
                                  selectedLand: plot.transferableTotalLand,
                                })
                              }
                            >
                              All
                            </button>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            inputMode="decimal"
                            name="selectedTotalLand"
                            className="input input-sm"
                            readOnly={isSelectedOwner}
                            onChange={(e) =>
                              handleSelectLand({
                                plot_no: plot.plot_no,
                                transferableTotalLand:
                                  plot.transferableTotalLand,
                                selectedLand: e.target.value,
                              })
                            }
                            value={entry ? entry.selectedLand : ""}
                            min="0"
                          />
                        </td>
                      </tr>
                    );
                  })}
                <tr>
                  <td>সর্বমোট:</td>
                  <td>{Number(totalTransfarableLand).toFixed(4)}</td>
                  <td>{Number(totalSelectedLand).toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          )}
          <button
            disabled={totalSelectedLand === 0 && !isSelectedOwner}
            onClick={() => {
              handler({
                khatianId: khatian._id,
                ownerId: owner._id,
                selectedLandInfo,
              });
              setSelectedLandInfo([]);
              setTotalInputVal("");
            }}
            className={`btn btn-sm btn-outline  ${
              isSelectedOwner ? "btn-error" : "btn-success"
            }`}
          >
            {isSelectedOwner ? <FaAnglesLeft /> : <FaAnglesRight />}
          </button>
        </div>
      </div>
    )
  );
};

export default OwnerCollapse;
