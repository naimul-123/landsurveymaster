"use client";
import SelectedKhatian from "@/components/SelectedKhatian";
import { deleteData, getData, postData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { MdPersonRemove } from "react-icons/md";
import Swal from "sweetalert2";
const TransferLand = () => {
  const [selectedKhatians, setSelectedKhatians] = useState([]);
  const [selectedBuyers, setSelectedBuyers] = useState([]);
  const { data: khatianinfo } = useQuery({
    queryKey: "khatianinfo",
    queryFn: () => getData("/api/khatianinfo"),
  });
  const potentialBuyers = useMemo(() => {
    const allOwners = selectedKhatians.flatMap((k) => k.owners);
    const selectedBuyerIds = new Set(selectedBuyers.map((b) => b._id));

    return allOwners.filter(
      (owner) =>
        // isTransferor falsey (null/undefined/false)
        !owner.isTransferor ||
        // transferable না আছে বা খালি অ্যারে
        ((!Array.isArray(owner.transferable) ||
          owner.transferable.length === 0) &&
          // আগে থেকে selected buyer না হয়
          !selectedBuyerIds.has(owner._id))
    );
  }, [selectedKhatians, selectedBuyers]);

  const handleAddKhatian = async (e) => {
    e.preventDefault();
    const form = e.target;
    const selectedKhatianId = form.khatianId.value;
    const prevIds = selectedKhatians.map((k) => String(k._id));

    if (!prevIds.includes(selectedKhatianId)) {
      const selectedKhatian = khatianinfo.find(
        (k) => String(k._id) === selectedKhatianId
      );
      if (!selectedKhatian) return alert("Invalid Khatian selected");

      try {
        const { owners } = await getData(
          `/api/getowners?khatianId=${selectedKhatianId}`
        );
        if (owners.length > 0) {
          const updatedKhatian = { ...selectedKhatian, owners };
          setSelectedKhatians((prev) => [...prev, updatedKhatian]);
        }
      } catch (err) {
        console.error("Error fetching owners:", err);
      }

      form.reset();
    }
  };
  console.log(selectedKhatians);

  console.log({ khatianinfo, selectedKhatians });

  const handleAddExistingBuyer = ({ buyer }) => {
    // যদি buyer আগেই না থাকে
    if (!selectedBuyers.find((b) => b._id === buyer._id)) {
      // Step 1: selectedBuyers এ যোগ করো
      setSelectedBuyers((prev) => [...prev, buyer]);

      // Step 2: buyer কে সব khatian এর owners থেকে সরিয়ে দাও
      setSelectedKhatians((prev) =>
        prev.map((k) => {
          // যদি buyer এর khatianIds-এ এই খতিয়ানের id থাকে
          if (buyer.khatianIds?.includes(k._id.toString())) {
            return {
              ...k,
              owners: k.owners.filter((o) => o._id !== buyer._id),
            };
          }
          return k;
        })
      );
    }
  };

  const handleRemoveBuyer = ({ buyer }) => {
    // Step 1: selectedBuyers থেকে বাদ দাও
    setSelectedBuyers((prev) => prev.filter((b) => b._id !== buyer._id));

    // Step 2: buyer এর khatianIds অ্যারের প্রতিটি খতিয়ানে owner হিসেবে ফেরত দাও
    setSelectedKhatians((prev) =>
      prev.map((k) => {
        if (buyer.khatianIds?.includes(k._id)) {
          const alreadyExists = k.owners.find((o) => o._id === buyer._id);
          if (!alreadyExists) {
            return {
              ...k,
              owners: [...k.owners, buyer],
            };
          }
        }
        return k;
      })
    );
  };

  const handleAddNewBuyer = async (e) => {
    e.preventDefault();
    const buyerName = e.target.buyerName.value;
    const khatianIds = selectedKhatians.map((k) => k._id);
    const { owner } = await postData("/api/addowner", {
      name: buyerName,
      khatianIds,
      alive: true,
    });
    console.log(owner);
    if (owner) {
      setSelectedKhatians((prev) =>
        prev.map((k) => {
          if (owner.khatianIds?.includes(k._id.toString())) {
            const alreadyExists = k.owners.find((o) => o._id === owner._id);
            if (!alreadyExists) {
              return {
                ...k,
                owners: [...k.owners, owner],
              };
            }
          }
          return k;
        })
      );
    }
  };
  const handleDeleteNewBuyer = async (owner) => {
    const { _id, khatianIds } = owner;

    try {
      if (_id) {
        // Swal.fire({
        //     title: "Do you want to save the changes?",
        //     showDenyButton: true,
        //     showCancelButton: true,
        //     confirmButtonText: "Save",
        //     denyButtonText: `Don't save`
        // }).then((result) => {
        //     /* Read more about isConfirmed, isDenied below */
        //     if (result.isConfirmed) {
        //         Swal.fire("Saved!", "", "success");
        //     } else if (result.isDenied) {
        //         Swal.fire("Changes are not saved", "", "info");
        //     }
        // });
        const confirm = await Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this buyer?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
          const res = await deleteData("/api/deleteowner", { id: _id });

          if (res.success) {
            // Step 1: selectedKhatians থেকে owner বাদ দাও
            setSelectedKhatians((prev) =>
              prev.map((k) => {
                if (khatianIds?.includes(k._id.toString())) {
                  return {
                    ...k,
                    owners: k.owners.filter((o) => o._id !== _id),
                  };
                }
                return k;
              })
            );

            // Step 3: Success Message
            Swal.fire("Deleted!", "The buyer has been deleted.", "success");
          } else {
            Swal.fire("Failed!", res.error || "Failed to delete.", "error");
          }
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };
  return (
    <div className="space-y-6">
      {/* খতিয়ান যুক্ত করার ফর্ম */}
      <form
        onSubmit={handleAddKhatian}
        className="flex flex-wrap items-center gap-4 bg-white shadow-md p-4"
      >
        <select
          defaultValue=""
          name="khatianId"
          className="select select-bordered w-full md:w-auto"
        >
          <option value="">একটি খতিয়ান সিলেক্ট করুন</option>
          {khatianinfo?.map((khatian) => (
            <option key={khatian._id} value={khatian._id}>
              জেলা: {khatian?.district} থানা: {khatian.thana} মৌজা:
              {khatian.mouja} {khatian.khatian_type} {khatian?.khatian_No} নং
              খতিয়ান
            </option>
          ))}
        </select>
        <button className="btn btn-primary">ADD</button>
      </form>

      {
        /* নির্বাচিত খতিয়ানসমূহ */
        selectedKhatians.length > 0 && (
          <>
            <div className="space-y-8">
              {selectedKhatians?.map((khatian, idx) => (
                <SelectedKhatian
                  key={idx}
                  khatian={khatian}
                  idx={idx}
                  selectedKhatians={selectedKhatians}
                  setSelectedKhatians={setSelectedKhatians}
                />
              ))}
            </div>
            {selectedKhatians.filter((khatian) =>
              khatian.owners.some((owner) => owner.isTransferor)
            ).length > 0 && (
              <div className="flex gap-4 p-4 bg-gray-200">
                <div className="flex-1/2">
                  <h3 className="text-lg font-semibold text-info mb-2 border-b">
                    গ্রহীতা যোগ করুন
                  </h3>
                  <form className="" onSubmit={handleAddNewBuyer}>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">নতুন গ্রহীতা:</legend>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="buyerName"
                          className="input input-sm input-info"
                          placeholder="মালিকের নাম, পিং/জং"
                        />
                        <button className="btn btn-info btn-soft btn-sm">
                          যোগ করুন
                        </button>
                      </div>
                    </fieldset>
                  </form>
                  {potentialBuyers.length > 0 && (
                    <ul className="space-y-1 my-2">
                      <h3 className="text-xs font-bold mb-2">
                        মালিকগণের মধ্য থেকে নির্বাচন করুন
                      </h3>
                      {potentialBuyers?.map((buyer, idx) => {
                        return (
                          <li
                            key={buyer._id}
                            className="bg-gray-100 p-2 rounded flex justify-between items-center"
                          >
                            <span>
                              {idx + 1}. {buyer.name}
                            </span>
                            {/* এখানে দুইটি কন্ডিশন হবে, যদি buyer.acquired?.length=== 0 অথবা buyer.acquired না থাকে */}
                            {(!buyer.acquired ||
                              buyer.acquired.length === 0) && (
                              <button
                                onClick={() => handleDeleteNewBuyer(buyer)}
                                className="tooltip badge hover:badge-error badge-info badge-soft"
                                data-tip="Click to delete"
                              >
                                New
                              </button>
                            )}

                            <button
                              onClick={() => handleAddExistingBuyer({ buyer })}
                              className="btn btn-sm btn-outline btn-success"
                            >
                              <FaAnglesRight />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="w-px bg-gray-300 mx-2" />
                {/* নির্বাচিত মালিক */}
                <div className="flex-1/2">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2 border-b">
                    নির্বাচিত গ্রহীতাগণ
                  </h3>
                  <ul className="space-y-1">
                    {selectedBuyers?.map((buyer, idx) => {
                      return (
                        <li
                          key={buyer._id}
                          className="bg-gray-100 p-2 rounded flex justify-between items-center"
                        >
                          <span>
                            {idx + 1}. {buyer.name}
                          </span>
                          <button
                            onClick={() => handleRemoveBuyer({ buyer })}
                            className="btn btn-sm btn-outline   btn-error"
                          >
                            <FaAnglesLeft />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </>
        )
      }
    </div>
  );
};

export default TransferLand;
