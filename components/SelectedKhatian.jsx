import React, { useMemo, useState } from "react";
import OwnerCollapse from "./OwnerCollapse";

const SelectedKhatian = ({
  khatian,
  idx,
  selectedKhatians,
  setSelectedKhatians,
  selectedBuyers,
  setSelectedBuyers,
}) => {
  const [landAmountType, setLandAmountType] = useState("portionBased");
  const updateKhatiansWithTransferableLand = (khatians) => {
    return khatians.map((khatian) => {
      // Owners আপডেট করা
      const updatedOwners = (khatian.owners || []).map((owner) => {
        const selectedTotalLand = (owner.transferable || [])
          .filter((plot) => plot.selectedLand)
          .reduce((sum, plot) => sum + Number(plot.selectedLand || 0), 0);

        return {
          ...owner,
          selectedTotalLand: Number(selectedTotalLand.toFixed(4)),
        };
      });

      // plots আপডেট করা — প্রতিটি plot এর জন্য তার totalSelectedLand বের করা
      const updatedPlots = (khatian.plots || []).map((plot) => {
        const totalSelectedLandForPlot = (updatedOwners || [])
          .flatMap((owner) => owner.transferable || [])
          .filter((p) => p.plot_no === plot.plot_no)
          .reduce((sum, p) => sum + Number(p.selectedLand || 0), 0);

        return {
          ...plot,
          totalSelectedLand: Number(totalSelectedLandForPlot.toFixed(4)),
        };
      });

      // khatian এর মোট land
      const totalSelectedLand = updatedOwners.reduce(
        (sum, owner) => sum + (owner.selectedTotalLand || 0),
        0
      );

      return {
        ...khatian,
        owners: updatedOwners,
        plots: updatedPlots,
        totalSelectedLand: Number(totalSelectedLand.toFixed(4)),
      };
    });
  };
  const potentialOwner = useMemo(() => {
    const selectedBuyerIds = new Set(selectedBuyers.map((b) => b._id));
    const filteredOwner = khatian.owners?.filter(
      (owner) =>
        !owner.isTransferor &&
        owner.transferable.length > 0 &&
        !selectedBuyerIds.has(owner._id)
    );

    return filteredOwner;
  }, [selectedKhatians, selectedBuyers]);

  const handleaddOwner = (selectedInfo) => {
    const { khatianId, ownerId, selectedLandInfo } = selectedInfo;
    const updatedKhatians = selectedKhatians.map((khatian) => {
      if (khatian._id !== khatianId) return khatian;

      return {
        ...khatian,
        owners: (khatian.owners || []).map((owner) => {
          if (owner._id !== ownerId) return owner;

          const updatedTransferable = (owner.transferable || []).map((plot) => {
            const matched = (selectedLandInfo || []).find(
              (item) => item.plot_no === plot.plot_no
            );
            if (matched) {
              return {
                ...plot,
                selectedLand: matched.selectedLand,
              };
            }
            return plot;
          });

          return {
            ...owner,
            isTransferor: true,
            transferable: updatedTransferable,
          };
        }),
      };
    });

    setSelectedKhatians(updateKhatiansWithTransferableLand(updatedKhatians));
  };

  const handleRemoveOwner = (selectedInfo) => {
    const { khatianId, ownerId } = selectedInfo;

    const updatedKhatians = selectedKhatians.map((khatian) => {
      if (khatian._id !== khatianId) return khatian;

      const updatedKhatian = { ...khatian };

      updatedKhatian.owners = (updatedKhatian.owners || []).map((owner) => {
        if (owner._id === ownerId) {
          // transferable এর মধ্যে থেকে selectedLand বাদ দিবো
          const cleanedTransferable = (owner.transferable || []).map(
            ({ selectedLand, ...rest }) => rest
          );

          const { isTransferor, selectedTotalLand, ...rest } = owner;

          return {
            ...rest, // isTransferor এবং selectedTotalLand বাদ
            transferable: cleanedTransferable,
          };
        }

        return owner;
      });

      return updatedKhatian;
    });
    setSelectedBuyers([]);
    setSelectedKhatians(updateKhatiansWithTransferableLand(updatedKhatians));
  };

  const handleTogglePlotSelection = ({ khatianId, plot_no }) => {
    let newIsSelected;

    const updatedKhatians = selectedKhatians.map((khatian) => {
      if (khatian._id !== khatianId) return khatian;

      const updatedKhatian = { ...khatian };

      // প্লটের isSelected টগল করা
      updatedKhatian.plots = (updatedKhatian.plots || []).map((plot) => {
        if (plot.plot_no === plot_no) {
          newIsSelected = !Boolean(plot.isSelected);
          return {
            ...plot,
            isSelected: newIsSelected,
          };
        }
        return plot;
      });

      // যদি সেই প্লট পাওয়া গিয়েছে, তাহলে khatian.owners এর ভিতরে transferable এও আপডেট কর
      if (newIsSelected !== undefined && Array.isArray(updatedKhatian.owners)) {
        updatedKhatian.owners = updatedKhatian.owners.map((owner) => {
          const updatedTransferable = (owner.transferable || []).map((tr) => {
            if (tr.plot_no === plot_no) {
              return {
                ...tr,
                isSelected: newIsSelected,
              };
            }
            return tr;
          });
          return {
            ...owner,
            transferable: updatedTransferable,
          };
        });
      }

      return updatedKhatian;
    });

    // যদি প্লট কখনো মেলেনি newIsSelected অবজেক্টে না থাকে, তাহলে আগের মতো রাখি
    if (newIsSelected === undefined) {
      // কিছু আপডেট হয়নি, শুধু সেই স্টেট আপডেট করতে চাইলে
      setSelectedKhatians(updateKhatiansWithTransferableLand(updatedKhatians));
      return;
    }

    setSelectedKhatians(updateKhatiansWithTransferableLand(updatedKhatians));
  };

  const handleAddAllPlots = (khatianId) => {
    const updatedKhatians = selectedKhatians.map((khatian) => {
      if (khatian._id !== khatianId) return khatian;

      const updatedKhatian = { ...khatian };

      // Ensure plots array exists and mark all selected
      updatedKhatian.plots = (updatedKhatian.plots || []).map((plot) => ({
        ...plot,
        isSelected: true,
      }));

      // Sync owners' transferable isSelected = true for all plot_nos
      const allPlotNos = new Set(
        (updatedKhatian.plots || []).map((p) => p.plot_no)
      );
      if (Array.isArray(updatedKhatian.owners)) {
        updatedKhatian.owners = updatedKhatian.owners.map((owner) => {
          const updatedTransferable = (owner.transferable || []).map((tr) => {
            if (allPlotNos.has(tr.plot_no)) {
              return {
                ...tr,
                isSelected: true,
              };
            }
            return tr;
          });
          return {
            ...owner,
            transferable: updatedTransferable,
          };
        });
      }

      return updatedKhatian;
    });

    setSelectedKhatians(updateKhatiansWithTransferableLand(updatedKhatians));
  };

  const handleRemoveAllPlots = (khatianId) => {
    const updatedKhatians = selectedKhatians.map((khatian) => {
      if (khatian._id !== khatianId) return khatian;

      const updatedKhatian = { ...khatian };

      // Ensure plots array exists and unselect all
      updatedKhatian.plots = (updatedKhatian.plots || []).map((plot) => ({
        ...plot,
        isSelected: false,
      }));

      // Sync owners' transferable isSelected = false for all plot_nos
      const allPlotNos = new Set(
        (updatedKhatian.plots || []).map((p) => p.plot_no)
      );
      if (Array.isArray(updatedKhatian.owners)) {
        updatedKhatian.owners = updatedKhatian.owners.map((owner) => {
          const updatedTransferable = (owner.transferable || []).map((tr) => {
            if (allPlotNos.has(tr.plot_no)) {
              return {
                ...tr,
                isSelected: false,
              };
            }
            return tr;
          });
          return {
            ...owner,
            transferable: updatedTransferable,
          };
        });
      }

      return updatedKhatian;
    });

    setSelectedKhatians(updateKhatiansWithTransferableLand(updatedKhatians));
  };

  return (
    <div
      key={khatian._id}
      className="bg-gray-200 overflow-hidden collapse collapse-arrow"
    >
      <input type="checkbox" className="peer" />
      <div className="bg-gray-300 p-4 font-extrabold text-gray-800 collapse-title ">
        <div className="flex items-center justify-between text-primary">
          <h2 className="text-xl md:text-2xl">{idx + 1} নং তফসিল:-</h2>
          <h2 className="text-xl md:text-2xl mr-10">
            অত্র খতিয়ানে রসদীয় মোট জমি {Number(khatian.totalSelectedLand) || 0}{" "}
            শতাংশ
          </h2>
        </div>
        <h2 className=" ">
          জেলা: {khatian?.district} | থানা: {khatian.thana} | মৌজা:{" "}
          {khatian.mouja} | {khatian.khatian_type} | খতিয়ান নং:{" "}
          {khatian?.khatian_No}
        </h2>
      </div>
      <div className="collapse-content">
        {/* দাগ যোগ ও নির্বাচিত দাগ */}
        <div className="flex gap-4 p-4 ">
          {/* দাগ যোগ */}
          <div className="flex-1/2">
            <h3 className="text-xs font-bold mb-2 border-b">
              দাগ সিলেক্ট/ডিসিলেক্ট করুন
            </h3>
            <ul className="flex flex-wrap gap-2">
              {khatian.plots.map((plot) => (
                <li key={plot.plot_no}>
                  <button
                    onClick={() =>
                      handleTogglePlotSelection({
                        khatianId: khatian._id,
                        plot_no: plot.plot_no,
                      })
                    }
                    className={`btn btn-xs ${
                      plot.isSelected
                        ? "btn-primary"
                        : "btn-outline btn-primary"
                    }`}
                  >
                    {plot.plot_no}
                  </button>
                </li>
              ))}
              {khatian.plots.length > 1 && (
                <>
                  <li>
                    <button
                      onClick={() => handleAddAllPlots(khatian._id)}
                      className="btn btn-xs btn-outline btn-success"
                    >
                      Select All
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleRemoveAllPlots(khatian._id)}
                      className="btn btn-xs btn-outline btn-success"
                    >
                      Deselect All
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="flex-1/2">
            <h3 className="text-xs font-bold mb-2 border-b">
              রসদীয় জমি নির্বাচনের ধরণ
            </h3>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="landAmountType"
                value="portionBased"
                defaultChecked
                className="radio radio-sm"
                onChange={(e) => setLandAmountType(e.target.value)}
              />
              <span>মালিকানার অংশ হারে</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="landAmountType"
                value="individualBased"
                className="radio radio-sm"
                onChange={(e) => setLandAmountType(e.target.value)}
              />
              <span>প্রত্যেক দাগ হতে আলাদা আলাদা ভাবে</span>
            </label>
          </div>
        </div>

        {/* মালিক তালিকা */}
        {khatian?.owners.filter((owner) =>
          owner.transferable?.some((plot) => plot.isSelected)
        ).length > 0 && (
          <div className="flex gap-4 p-4 bg-gray-200   ">
            {/* হস্তান্তরযোগ্য মালিক */}

            <div className="flex-1/2">
              <div className="flex justify-between font-semibold text-info mb-2 border-b">
                <h3 className="text-lg ">দাতা যোগ করুন</h3>
              </div>
              <div className="space-y-1">
                {potentialOwner.map((owner, idx) => (
                  <OwnerCollapse
                    key={idx}
                    khatian={khatian}
                    owner={owner}
                    idx={idx}
                    selectedKhatians={selectedKhatians}
                    handler={handleaddOwner}
                    landAmountType={landAmountType}
                    setLandAmountType={setLandAmountType}
                  />
                ))}
              </div>
            </div>

            <div className="w-px bg-gray-300 mx-2" />
            {/* নির্বাচিত মালিক */}
            <div className="flex-1/2">
              <h3 className="text-lg font-semibold text-blue-600 mb-2 border-b">
                নির্বাচিত দাতাগণ
              </h3>
              <div className="space-y-1">
                {khatian.owners
                  ?.filter((owner) => owner.isTransferor)
                  .map((owner, idx) => (
                    <OwnerCollapse
                      key={idx}
                      khatian={khatian}
                      owner={owner}
                      idx={idx}
                      selectedKhatians={selectedKhatians}
                      handler={handleRemoveOwner}
                      landAmountType={landAmountType}
                      isSelectedOwner={true}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedKhatian;
