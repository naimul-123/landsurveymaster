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
  const [selectedLandInfo, setSelectedLandInfo] = useState(() => {
    if (!owner?.transferable || owner.transferable.length === 0) {
      return [];
    } else
      return owner.transferable.map((p) => ({
        plot_no: p.plot_no,
        selectedLand: p.selectedLand != null ? String(p.selectedLand) : "",
      }));
  });
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

  const totalSelectedLand = useMemo(() => {
    return selectedLandInfo.reduce((sum, item) => {
      const val = parseFloat(item.selectedLand);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [selectedLandInfo, owner]);

  const handleSelectLand = (landInfo) => {
    // আগের মানগুলো থেকে দরকারি ভ্যারিয়েবলগুলো আন
    if (landAmountType === "portionBased") {
      const { selectedLand } = landInfo;

      // মোট transferable ল্যান্ড শূন্য হলে ভাঙবে না
      if (!selectedLand || selectedLand === 0) {
        alert("Total selected land is zero, can't compute portion.");
        return;
      }

      // সিলেক্ট করা ল্যান্ড যত বড় হতে পারবে না মোট transferable এর চেয়ে
      if (
        Number(Number(selectedLand).toFixed(4)) >
        Number(Number(totalTransfarableLand).toFixed(3))
      ) {
        setSelectedLandInfo([]);
        alert(
          "Total selected land could not be greater than total transferable land."
        );
        return;
      }

      // ভাগের অনুপাতে দিয়েই নতুন ইনফো বানানো
      const selectedShare = Number(selectedLand) / totalTransfarableLand;

      const updated =
        owner.transferable
          ?.filter((plot) => plot.isSelected)
          .map((plot) => {
            return {
              plot_no: plot.plot_no,
              selectedLand: plot.transferableTotalLand * selectedShare,
            };
          }) || [];

      setSelectedLandInfo(updated);

      return;
    }

    // individualBased লজিক
    if (landAmountType === "individualBased") {
      const { plot_no, transferableTotalLand, selectedLand } = landInfo;
      const val = Number(selectedLand);

      // খালি বা অপ্রচলিত ইনপুট হলে ওই এন্ট্রি রিমুভ করো
      if (selectedLand === "" || isNaN(val)) {
        setSelectedLandInfo((prev) =>
          prev.filter((item) => item.plot_no !== plot_no)
        );
        return;
      }

      // ভ্যালিডেশন: transferable এর চেয়ে বড় হলে না করে ডিলিট
      if (val > transferableTotalLand) {
        alert(
          "Transferable land must be less than or equal to transferable total land."
        );
        setSelectedLandInfo((prev) =>
          prev.filter((item) => item.plot_no !== plot_no)
        );
        return;
      }

      // upsert: থাকলে replace, না থাকলে add
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
      <div key={owner._id} className="collapse collapse-plus">
        <input type="checkbox" className="peer" />
        <div className="collapse-title shadow shadow-gray-300">
          <h2 className="text-xs font-bold">
            {idx + 1}. {owner.name}
          </h2>
          <p className="text-xs  text-info font-black">
            {isSelectedOwner
              ? `রসদীয় মোট জমি: ${Number(totalSelectedLand).toFixed(4)}`
              : `হস্তান্তরযোগ্য জমি: ${Number(totalTransfarableLand).toFixed(
                  4
                )}`}
          </p>
        </div>
        <div className="collapse-content">
          {landAmountType === "portionBased" && (
            <label className="label">
              <span className="text-sm">রসদীয় জমি</span>
              {!isSelectedOwner && (
                <span
                  className="badge badge-soft badge-info"
                  onClick={() =>
                    handleSelectLand({
                      selectedLand: totalTransfarableLand,
                    })
                  }
                >
                  All
                </span>
              )}

              <input
                type="text"
                name="selectedTotalLand"
                className="input input-sm"
                required
                disabled={isSelectedOwner}
                defaultValue={
                  Number(totalSelectedLand).toFixed(4) > 0
                    ? Number(totalSelectedLand).toFixed(4)
                    : ""
                }
                onChange={(e) =>
                  handleSelectLand({
                    selectedLand: e.target.value,
                  })
                }
              />
            </label>
          )}
          {landAmountType === "individualBased" && (
            <table className="table table-xs">
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
                            disabled={isSelectedOwner}
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
            disabled={!totalSelectedLand && !isSelectedOwner}
            onClick={() => {
              handler({
                khatianId: khatian._id,
                ownerId: owner._id,
                selectedLandInfo,
              });
              setSelectedLandInfo([]);
            }}
            className={`btn btn-sm btn-outline ${
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
