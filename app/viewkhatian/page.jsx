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
    <div className="flex gap-2">
      <ul>
        <h2>খতিয়ান তালিকা</h2>
        {khatianinfo?.map((khatian) => (
          <li type="button" onClick={() => setKhatianId(khatian._id)}>
            <span>খতিয়ান নং {khatian.khatian_No}</span>
          </li>
        ))}
      </ul>
      <div>
        <KhatianDetails khatian={selectedKhatina} />
      </div>
    </div>
  );
};

export default ViewKhatian;
