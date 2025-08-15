"use client";

import BuyerCollapse from "@/components/BuyerCollapse";
import SelectedBuyer from "@/components/selectedBuyer";
import SelectedKhatian from "@/components/SelectedKhatian";
import { deleteData, getData, postData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
const TransferLand = () => {
  const [selectedKhatians, setSelectedKhatians] = useState([]);
  const [landTransferType, setLandTransferType] = useState("portionBased");
  const [selectedBuyers, setSelectedBuyers] = useState([]);
  const [date, setDate] = useState(null);
  // Fetch khatian info
  const { data: khatianinfo } = useQuery({
    queryKey: ["khatianinfo"],
    queryFn: () => getData("/api/khatianinfo"),
  });

  // Prepare potential buyers excluding already selected and those with transferable land
  const potentialBuyers = useMemo(() => {
    const allOwners = selectedKhatians.flatMap((k) => k.owners);
    const selectedBuyerIds = new Set(selectedBuyers.map((b) => b._id));

    return allOwners.filter((owner) => {
      if (selectedBuyerIds.has(owner._id)) return false;
      if (!owner.isTransferor) return true;
      if (!Array.isArray(owner.transferable) || owner.transferable.length === 0)
        return true;
      return false;
    });
  }, [selectedKhatians, selectedBuyers]);

  // Total selected land from selectedKhatians
  const totalSelectedLand = useMemo(() => {
    if (!Array.isArray(selectedKhatians) || selectedKhatians.length === 0)
      return 0;

    return selectedKhatians.reduce(
      (sum, k) => sum + Number(k.totalSelectedLand || 0),
      0
    );
  }, [selectedKhatians]);

  // Total land assigned to buyers
  const buyersTotalLand = useMemo(() => {
    return selectedBuyers.reduce((buyerSum, buyer) => {
      const buyerTotal = (buyer.selectedLandInfo || []).reduce(
        (infoSum, info) => {
          const plotTotal = (info.plots || []).reduce(
            (plotSum, plot) => plotSum + Number(plot.selectedLand || 0),
            0
          );
          return infoSum + plotTotal;
        },
        0
      );
      return buyerSum + buyerTotal;
    }, 0);
  }, [selectedBuyers]);

  // Map of khatianId => total selected land from all buyers
  const khatianTotalSelectedMap = useMemo(() => {
    const map = {};
    selectedBuyers.forEach((buyer) => {
      (buyer.selectedLandInfo || []).forEach((info) => {
        const plotTotal = (info.plots || []).reduce(
          (sum, plot) => sum + Number(plot.selectedLand || 0),
          0
        );
        map[info.khatianId] = (map[info.khatianId] || 0) + plotTotal;
      });
    });
    return map;
  }, [selectedBuyers]);

  const remainingLand = totalSelectedLand - buyersTotalLand;

  // Add a khatian from select form
  const handleAddKhatian = async (e) => {
    e.preventDefault();
    const selectedKhatianId = e.target.khatianId.value;
    if (!selectedKhatianId) return;

    if (selectedKhatians.some((k) => String(k._id) === selectedKhatianId)) {
      return alert("এই খতিয়ান ইতিমধ্যে নির্বাচিত হয়েছে।");
    }

    const selectedKhatian = khatianinfo.find(
      (k) => String(k._id) === selectedKhatianId
    );
    if (!selectedKhatian) return alert("অবৈধ খতিয়ান সিলেক্ট করা হয়েছে");

    try {
      const { owners } = await getData(
        `/api/getowners?khatianId=${selectedKhatianId}`
      );
      if (owners.length > 0) {
        setSelectedKhatians((prev) => [
          ...prev,
          { ...selectedKhatian, owners },
        ]);
      }
      e.target.reset();
    } catch (error) {
      console.error("Error fetching owners:", error);
      alert("মালিকদের তথ্য আনার সময় সমস্যা হয়েছে।");
    }
  };

  // Add existing buyer to selectedBuyers
  const handleAddExistingBuyer = (buyer) => {
    setSelectedBuyers((prev) => [...prev, buyer]);
  };

  // Remove buyer from selectedBuyers and add back to owners of khatians
  const handleRemoveBuyer = ({ buyer }) => {
    setSelectedBuyers((prev) => prev.filter((b) => b._id !== buyer._id));
    setSelectedKhatians((prev) =>
      prev.map((k) => {
        if (buyer.khatianIds?.includes(k._id)) {
          const exists = k.owners.some((o) => o._id === buyer._id);
          if (!exists) {
            return { ...k, owners: [...k.owners, buyer] };
          }
        }
        return k;
      })
    );
  };

  // Add new buyer via API
  const handleAddNewBuyer = async (e) => {
    e.preventDefault();
    const buyerName = e.target.buyerName.value.trim();
    if (!buyerName) return alert("মালিকের নাম লিখুন");

    const khatianIds = selectedKhatians.map((k) => k._id);
    try {
      const { owner } = await postData("/api/addowner", {
        name: buyerName,
        khatianIds,
        alive: true,
      });

      if (owner) {
        setSelectedKhatians((prev) =>
          prev.map((k) => {
            if (owner.khatianIds?.includes(k._id.toString())) {
              const exists = k.owners.some((o) => o._id === owner._id);
              if (!exists) {
                return { ...k, owners: [...k.owners, owner] };
              }
            }
            return k;
          })
        );
        e.target.reset();
      }
    } catch (error) {
      console.error("Error adding owner:", error);
      alert("নতুন মালিক যোগ করার সময় সমস্যা হয়েছে।");
    }
  };

  // Delete buyer with confirmation
  const handleDeleteNewBuyer = async (owner) => {
    if (!owner._id) return;
    const confirm = await Swal.fire({
      title: "নিশ্চিত?",
      text: "আপনি কি সত্যিই এই গ্রহীতা মোছা চান?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মোছুন",
      cancelButtonText: "বাতিল",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteData("/api/deleteowner", { id: owner._id });
      if (res.success) {
        setSelectedKhatians((prev) =>
          prev.map((k) => {
            if (owner.khatianIds?.includes(k._id.toString())) {
              return {
                ...k,
                owners: k.owners.filter((o) => o._id !== owner._id),
              };
            }
            return k;
          })
        );
        Swal.fire("মোছা হয়েছে!", "গ্রহীতাকে সফলভাবে মোছা হয়েছে।", "success");
      } else {
        Swal.fire("বিফল!", res.error || "মোছা যায়নি।", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("ত্রুটি!", "কিছু ভুল হয়েছে।", "error");
    }
  };
  const handleTransferLand = async (e) => {
    e.preventDefault();

    const form = e.target;
    const deedNo = form.deedNo.value;
    const deedDate = form.deedDate.value; // dd-mm-yyyy
    const subRegistry = form.subRegistry.value;

    const [day, month, year] = deedDate.split("-");
    const isoDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    const result = [];

    selectedKhatians.forEach((khatian) => {
      const transferors = khatian.owners?.filter((o) => o.isTransferor) || [];

      // Step 1: প্লট অনুযায়ী buyers-এর মোট নির্বাচিত জমি বের করা
      const totalBuyerLandByPlot = {};
      selectedBuyers.forEach((buyer) => {
        const buyerKhatianInfo = buyer.selectedLandInfo.find(
          (info) => info.khatianId === khatian._id
        );
        if (!buyerKhatianInfo) return;

        buyerKhatianInfo.plots.forEach((p) => {
          if (!totalBuyerLandByPlot[p.plot_no]) {
            totalBuyerLandByPlot[p.plot_no] = 0;
          }
          totalBuyerLandByPlot[p.plot_no] += Number(p.selectedLand);
        });
      });

      // Step 2: প্রতিটি দাতা ও ক্রেতার জন্য প্লটভিত্তিক হিসাব
      transferors.forEach((transferor) => {
        selectedBuyers.forEach((buyer) => {
          const buyerKhatianInfo = buyer.selectedLandInfo.find(
            (info) => info.khatianId === khatian._id
          );
          if (!buyerKhatianInfo) return;

          const plots = [];

          buyerKhatianInfo.plots.forEach((p) => {
            const totalLandInPlot =
              Number(
                khatian.plots.find((pl) => pl.plot_no === p.plot_no)
                  ?.totalLandInPlot
              ) || 0;
            const plotShare =
              Number(
                khatian.plots.find((pl) => pl.plot_no === p.plot_no)?.share
              ) || 0;

            const sellerPlotInfo = transferor.transferable.find(
              (tp) => tp.plot_no === p.plot_no
            );
            if (!sellerPlotInfo) return;

            const sellerLandInPlot = Number(sellerPlotInfo.selectedLand) || 0;

            const buyerSelectedLandInPlot = Number(p.selectedLand) || 0;
            const totalBuyerLandInPlot = totalBuyerLandByPlot[p.plot_no] || 0;

            if (totalBuyerLandInPlot === 0 || totalLandInPlot === 0) return;

            // Formula: (sellerLand * buyerSelectedLand) / totalBuyerLand
            const landFromSeller =
              (sellerLandInPlot * buyerSelectedLandInPlot) /
              totalBuyerLandInPlot;

            const share = landFromSeller / (totalLandInPlot * plotShare);
            plots.push({
              plot_no: p.plot_no,
              share,
            });
          });

          if (plots.length > 0) {
            result.push({
              khatianId: { $oid: khatian._id },
              source: {
                acquiredType: "ক্রয়",
                from: { $oid: transferor._id },
                deedNo: Number(deedNo),
                deedDate: { $date: isoDate },
                subRegistryOffice: subRegistry,
              },
              to: { $oid: buyer._id },
              plots,
            });
          }
        });
      });
    });

    if (result) {
      const res = await postData("/api/transfer", result);
      console.log(res);
    }
  };

  return (
    <div className="space-y-6 max-w-8/12 w-full">
      {/* খতিয়ান যুক্ত করার ফর্ম */}
      <form
        onSubmit={handleAddKhatian}
        className="bg-gray-200 flex gap-2 justify-between  border border-base-300 rounded-box p-4"
      >
        <select
          name="khatianId"
          defaultValue=""
          className="select select-bordered w-full grow md:w-auto"
          required
        >
          <option value="" disabled>
            একটি খতিয়ান সিলেক্ট করুন
          </option>
          {khatianinfo?.map((khatian) => (
            <option key={khatian._id} value={khatian._id}>
              জেলা: {khatian.district} থানা: {khatian.thana} মৌজা:{" "}
              {khatian.mouja} {khatian.khatian_type} {khatian.khatian_No} নং
              খতিয়ান
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          যোগ করুন
        </button>
      </form>

      {/* নির্বাচিত খতিয়ানসমূহ */}
      {selectedKhatians.length > 0 && (
        <>
          <div className="">
            {selectedKhatians.map((khatian, idx) => (
              <SelectedKhatian
                key={khatian._id ?? idx}
                khatian={khatian}
                idx={idx}
                selectedKhatians={selectedKhatians}
                setSelectedKhatians={setSelectedKhatians}
                khatianTotalSelectedMap={khatianTotalSelectedMap}
                selectedBuyers={selectedBuyers}
                setSelectedBuyers={setSelectedBuyers}
              />
            ))}
          </div>

          {/* গ্রহীতার তথ্য */}
          {totalSelectedLand > 0 && (
            <div className="collapse collapse-arrow">
              <input type="checkbox" className="peer" />
              <div className=" collapse-title font-bold text-primary text-2xl  flex justify-between items-baseline bg-gray-300   p-4">
                <h2 className="">গ্রহীতার তথ্য:</h2>
                <h2 className="mr-10">
                  রসদীয় মোট জমি: {totalSelectedLand} শতাংশ
                </h2>
              </div>

              <div className=" collapse-content bg-gray-200 space-y-4">
                <div className="flex gap-4 p-4 rounded shadow  ">
                  <div className="flex-1/2">
                    <h3 className="text-lg font-semibold text-info mb-2 border-b">
                      গ্রহীতা যোগ করুন
                    </h3>
                    <form onSubmit={handleAddNewBuyer}>
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          নতুন গ্রহীতা:
                        </legend>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="buyerName"
                            className="input input-sm input-info grow"
                            placeholder="মালিকের নাম, পিং/জং"
                            required
                          />
                          <button
                            type="submit"
                            className="btn btn-info btn-soft btn-sm w-40 "
                          >
                            যোগ করুন
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  </div>
                  <div className="border"></div>
                  <div className="flex-1/2">
                    <h3 className="text-base text-info mb-2 font-bold">
                      গ্রহীতার জমি নির্বাচনের ধরণ
                    </h3>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="landTransferType"
                        value="portionBased"
                        checked={landTransferType === "portionBased"}
                        className="radio radio-sm"
                        onChange={(e) => setLandTransferType(e.target.value)}
                      />
                      <span>মোট রসদীয় জমির অংশ হারে</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="landTransferType"
                        value="individualBased"
                        checked={landTransferType === "individualBased"}
                        className="radio radio-sm"
                        onChange={(e) => setLandTransferType(e.target.value)}
                      />
                      <span>প্রত্যেক খতিয়ান হতে আলাদা আলাদা ভাবে</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded shadow">
                  <div className="flex-1/2">
                    {potentialBuyers.length > 0 && remainingLand > 0 ? (
                      <div className="space-y-1">
                        <div className="font-semibold flex items-baseline justify-between border-b text-info">
                          <h3 className="text-lg ">গ্রহীতা নির্বাচন করুন</h3>
                          <p className="text-base">
                            অবশিষ্ট জমি: {remainingLand.toFixed(4)} শতাংশ
                          </p>
                        </div>
                        {potentialBuyers.map((buyer, idx) => (
                          <BuyerCollapse
                            key={buyer._id}
                            buyer={buyer}
                            idx={idx}
                            selectedKhatians={selectedKhatians}
                            landTransferType={landTransferType}
                            totalSelectedLand={totalSelectedLand}
                            buyersTotalLand={buyersTotalLand}
                            selectedBuyers={selectedBuyers}
                            handler={handleAddExistingBuyer}
                            remainingLand={remainingLand}
                            khatianTotalSelectedMap={khatianTotalSelectedMap}
                          />
                        ))}
                      </div>
                    ) : (
                      <h2 className="text-error">অবশিষ্ট কোনো জমি নেই</h2>
                    )}
                  </div>
                  <div className="border"></div>
                  <div className="flex-1/2">
                    <h3 className="text-lg font-semibold text-info mb-2 border-b">
                      নির্বাচিত গ্রহীতাগণ
                    </h3>
                    <table className="table table-xs w-full">
                      <thead>
                        <tr>
                          <th>ক্রঃ</th>
                          <th>নাম</th>
                          <th>রসদীয় জমি</th>
                          <th>বাদ দিন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBuyers.map((buyer, idx) => (
                          <SelectedBuyer
                            key={buyer._id ?? idx}
                            buyer={buyer}
                            idx={idx}
                            handler={handleRemoveBuyer}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedBuyers.length > 0 && !remainingLand > 0 && (
        <form
          className="bg-gray-200 border border-base-300 rounded-box p-4 grid grid-cols-4 items-baseline gap-4"
          onSubmit={handleTransferLand}
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">দলিল নং</legend>
            <input
              type="text"
              className="input input-info"
              placeholder="দলিল নং"
              name="deedNo"
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">দলিলের তারিখ</legend>
            <Flatpickr
              value={date}
              onChange={([selectedDate]) => setDate(selectedDate)}
              options={{ dateFormat: "d-m-Y" }}
              className="input input-info"
              placeholder="দলিলের তারিখ"
              name="deedDate"
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">সাব রেজিস্ট্রি অফিস</legend>
            <input
              type="text"
              className="input input-info"
              placeholder="সাব রেজিস্ট্রি অফিসের নাম"
              name="subRegistry"
            />
          </fieldset>
          <fieldset className="fieldset">
            <button className="btn btn-info btn-soft hover:text-white">
              Save
            </button>
          </fieldset>
        </form>
      )}
    </div>
  );
};

export default TransferLand;
