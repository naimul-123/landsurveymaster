
'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getData } from '@/lib/api'

const OwnerDetails = () => {
    const { id } = useParams()
    const [openRow, setOpenRow] = useState(null);

    const toggleRow = (id) => {
        setOpenRow(openRow === id ? null : id);
    };
    const { data: ownerData } = useQuery({
        queryKey: ['ownerData'],
        queryFn: () => getData(`/api/owners?id=${id}`),
        enabled: !!id
    })
    console.log(ownerData);


    return (
        <div className=''>

            <table className="table table-zebra w-full border border-base-300">
                <thead className="bg-accent-content text-white">
                    <tr>
                        <th>মালিকানা প্রাপ্তির ধরণ</th>
                        <th>মালিকানার অংশ</th>
                        <th>প্রাপ্ত মোট জমি</th>
                    </tr>
                </thead>
                <tbody>
                    {ownerData?.acquired.map((acq) => {
                        const totalLand = acq.plots?.reduce((sum, plot) => sum + plot.acquiredLand, 0) || 0;

                        return (
                            <React.Fragment key={acq.acquiredId}>
                                {/* Collapse Title Row */}
                                <tr
                                    onClick={() => toggleRow(acq.acquiredId)}
                                    className="cursor-pointer hover:bg-base-200 transition"
                                >
                                    <td>{acq.acquiredType}</td>
                                    <td>{Number(acq.acquiredShare).toFixed(3)}</td>
                                    <td>{Number(totalLand).toFixed(3)}</td>
                                </tr>

                                {/* Collapse Content Row */}
                                {openRow === acq.acquiredId && (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="bg-base-200 p-2 rounded h-96 overflow-y-auto">
                                                <table className="table table-sm w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>দাগ নং</th>
                                                            <th className="text-right">প্রাপ্ত জমি (শতাংশ)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {acq.plots?.map((plot) => (
                                                            <tr key={plot.plot_no}>
                                                                <td>{plot.plot_no}</td>
                                                                <td className="text-right">
                                                                    {Number(plot.acquiredLand).toFixed(4)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td className="text-right font-bold text-black" colSpan={2}>
                                                                সর্মমোট: {Number(totalLand).toFixed(4)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )


}

export default OwnerDetails