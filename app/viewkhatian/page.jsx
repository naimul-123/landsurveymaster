"use client";
import KhatianDetails from "@/components/KhatianDetails";
import { getData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const ViewKhatian = () => {
  const [khatian_id, setKhatianId] = useState(null);
  const [selectedKhatina, setSelectedKhatian] = useState({});
  useEffect(() => {
    const selectdKhatina = khatianinfo?.find(
      (khatian) => khatian._id === khatian_id
    );
    setSelectedKhatian(selectdKhatina);
  }, [khatian_id]);
  const { data: khatianinfo } = useQuery({
    queryKey: "khatianinfo",
    queryFn: () => getData("/api/khatianinfo"),
  });
  console.log(khatianinfo);
  return (
    <div className="flex gap-2 ">
      <ul className="shadow-sm">
        <h2 className="text-2xl font-bold text-primary p-4 border-b text-center">খতিয়ান তালিকা</h2>
        {khatianinfo?.map((khatian) => (
          <li type="button" onClick={() => setKhatianId(khatian._id)} className={`border-b hover:bg-accent-content p-4 hover:text-white ${khatian._id === khatian_id ? 'bg-accent-content text-white' : ''}`}>
            <div className="card w-60  card-xs rounded-none ">
              <div className="card-body">
                <h2 className="card-title">{khatian?.owners[0].name} গং</h2>
                <p>জেলা: {khatian?.district} থানা: {khatian.thana} মৌজা:{khatian.mouja} {khatian.khatian_type} {khatian?.khatian_No} নং খতিয়ান</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <KhatianDetails khatian={selectedKhatina} />

    </div>
  );
};

export default ViewKhatian;
