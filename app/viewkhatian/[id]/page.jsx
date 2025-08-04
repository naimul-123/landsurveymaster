
'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getData } from '@/lib/api'
import InheritanceForm from '@/components/Forms/InheritanceForm'

const OwnerDetails = () => {
    const { id } = useParams()
    const [openRow, setOpenRow] = useState(null);
    const [transferType, setTransfarType] = useState(null)

    const toggleRow = (id) => {
        setOpenRow(openRow === id ? null : id);
    };
    const { data: ownerData, isLoading } = useQuery({
        queryKey: ['ownerData'],
        queryFn: () => getData(`/api/owners?id=${id}`),

    })
    const handleSelectAcquisition = (acquiredId) => {
        console.log("Selected acquiredId:", acquiredId);

        // বা এখানে তুমি যেটা করতে চাও — সেটা করো
    };

    console.log(ownerData);


    if (isLoading) return <div className="w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>

    return (
        <div className=''>
            <div>
                <h2>{ownerData.name}</h2>
            </div>
            {/* You can open the modal using document.getElementById('ID').showModal() method */}

            <dialog id="my_modal_4" className="modal">
                <div className="modal-box w-full max-w-11/12 max-h-svh h-full flex flex-col">
                    <div className='grow'>
                        <form>
                            <label className='label'>  <span>‍মালিকানা হস্তান্তরের ধরণ:</span>
                                <input type="radio" name="transferType" value="সাফকবলা" className="radio radio-info" checked={transferType === "সাফকবলা"} onChange={(e) => setTransfarType(e.target.value)} /> সাফকবলা
                                <input type="radio" name="transferType" value="দান" checked={transferType === "দান"} className="radio radio-info" onChange={(e) => setTransfarType(e.target.value)} />দান
                            </label>

                            <label>
                                <span>হস্তান্তরিত সম্পত্তি সিলেক্ট করুন</span>
                            </label>
                            {ownerData?.acquired?.map((acq, index) => {
                                const totalLand = acq.plots?.reduce((sum, plot) => sum + plot.totalLandInPlot, 0) || 0;
                                const ownertotalLand = acq.plots?.reduce((sum, plot) => sum + plot.totalLandInPlot * plot.share, 0) || 0;

                                return (
                                    <div
                                        key={index}
                                        className="flex  items-center gap-3 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition"
                                    >

                                        <input
                                            type="checkbox"
                                            className="checkbox mt-1 peer"
                                            id={`acq-${index}`}
                                            onChange={() => handleSelectAcquisition(acq)} // ← তোমার নিজের ফাংশন
                                        />

                                        <div

                                            className="flex text-sm peer-checked:bg-blue-100 peer-checked:border-blue-400 peer-checked:rounded-lg p-2 w-full cursor-pointer"
                                        >
                                            {acq?.source.acquiredType === "খতিয়ান" ? <h2 className="font-medium text-base mb-1 text-gray-800">
                                                মালিকানা প্রাপ্তির ধরণ: <span className="font-semibold">{acq?.source.acquiredType}</span>, জেলা: {ownerData?.district}, থানা: {ownerData.thana}, মৌজা: {ownerData.mouja}, {ownerData.khatian_type} {ownerData?.khatian_No} নং খতিয়ানে মোট জমি <span className="font-semibold">{Number(totalLand).toFixed(3)}</span> শতাংশ
                                            </h2>
                                                : null}

                                            <p className="text-sm text-gray-700">
                                                মালিকের প্রাপ্ত জমি: <span className="font-semibold">{Number(ownertotalLand).toFixed(3)}</span> শতাংশ
                                            </p>

                                            <div className="mt-4">
                                                <h2 className="font-semibold text-gray-800 mb-2">দাগসমূহ</h2>

                                                <div className="flex flex-wrap gap-2">
                                                    {acq?.plots.map((plot, i) => {
                                                        const ownerLand = (plot.totalLandInPlot * plot.share).toFixed(3);
                                                        return (
                                                            <div
                                                                key={i}
                                                                className="relative group"
                                                            >
                                                                <span className="btn btn-xs cursor-default">
                                                                    {plot.plot_no}
                                                                </span>

                                                                <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                                    প্রাপ্ত জমি: {ownerLand} শতাংশ
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                            {ownerData?.transfered?.map((trans, index) => {
                                const totalLand = trans.plots?.reduce((sum, plot) => sum + plot.totalLandInPlot, 0) || 0;
                                const ownertotalLand = trans.plots?.reduce((sum, plot) => sum + plot.totalLandInPlot * plot.share, 0) || 0;

                                return (
                                    <div
                                        key={index}
                                        className="flex  items-center gap-3 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition"
                                    >

                                        <input
                                            type="checkbox"
                                            className="checkbox mt-1 peer"
                                            id={`acq-${index}`}
                                            onChange={() => handleSelectAcquisition(acq)} // ← তোমার নিজের ফাংশন
                                        />

                                        <div

                                            className="flex text-sm peer-checked:bg-blue-100 peer-checked:border-blue-400 peer-checked:rounded-lg p-2 w-full cursor-pointer"
                                        >
                                            {trans?.source.acquiredType === "ক্রয়" ? <h2 className="font-medium text-base mb-1 text-gray-800">
                                                মালিকানা হস্তান্তরের ধরণ: <span className="font-semibold">বিক্রয়</span>, জেলা: {ownerData?.district}, থানা: {ownerData.thana}, মৌজা: {ownerData.mouja}, {ownerData.khatian_type} {ownerData?.khatian_No} নং খতিয়ানে মোট জমি <span className="font-semibold">{Number(totalLand).toFixed(3)}</span> শতাংশ
                                            </h2>
                                                : null}

                                            <p className="text-sm text-gray-700">
                                                মালিকের প্রাপ্ত জমি: <span className="font-semibold">{Number(ownertotalLand).toFixed(3)}</span> শতাংশ
                                            </p>

                                            <div className="mt-4">
                                                <h2 className="font-semibold text-gray-800 mb-2">দাগসমূহ</h2>

                                                <div className="flex flex-wrap gap-2">
                                                    {trans?.plots.map((plot, i) => {
                                                        const ownerLand = (plot.totalLandInPlot * plot.share).toFixed(3);
                                                        return (
                                                            <div
                                                                key={i}
                                                                className="relative group"
                                                            >
                                                                <span className="btn btn-xs cursor-default">
                                                                    {plot.plot_no}
                                                                </span>

                                                                <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                                    প্রাপ্ত জমি: {ownerLand} শতাংশ
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                        </form>

                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <table className="table table-zebra w-full border border-base-300">
                <thead className="bg-accent-content text-white">
                    <tr>
                        <th >মালিকানা প্রাপ্তির বিবরণ:</th>
                        <th ><button className="btn btn-info btn-soft" onClick={() => document.getElementById('my_modal_4').showModal()}>মালিকানা হস্তান্তর</button></th>

                    </tr>
                </thead>
                <tbody>
                    {ownerData?.transfered?.map((trans) => {
                        const totalLand = trans.plots?.reduce((sum, plot) => sum + plot.totalLandInPlot, 0) || 0;
                        const ownertotalLand = trans.plots?.reduce((sum, plot) => sum + plot.totalLandInPlot * plot.share, 0) || 0;

                        return (
                            <React.Fragment key={trans.acquiredId}>
                                {/* Collapse Title Row */}
                                <tr
                                    onClick={() => toggleRow(trans.acquiredId)}
                                    className="cursor-pointer hover:bg-base-200 transition"
                                >
                                    <td>
                                        {trans?.source.acquiredType === "ক্রয়" ? <h2 className="font-medium text-base mb-1 text-gray-800">
                                            মালিকানা প্রাপ্তির ধরণ: <span className="font-semibold">{trans?.source.acquiredType}</span>, জেলা: {ownerData?.district}, থানা: {ownerData.thana}, মৌজা: {ownerData.mouja}, {ownerData.khatian_type} {ownerData?.khatian_No} নং খতিয়ানে মোট জমি <span className="font-semibold">{Number(totalLand).toFixed(3)}</span> শতাংশ
                                        </h2>
                                            : null}
                                    </td>
                                    <td className=''>মালিকের প্রাপ্ত জমি {Number(ownertotalLand).toFixed(3)} শতাংশ</td>
                                </tr>

                                {/* Collapse Content Row */}
                                {openRow === trans.acquiredId && (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="bg-base-200 p-2 rounded h-96 overflow-y-auto">
                                                <table className="table table-sm w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>দাগ নং</th>
                                                            <th>দাগে মোট জমি(শতাংশ)</th>
                                                            <th>দাগে মালিকানার অংশ</th>
                                                            <th className="text-right">প্রাপ্ত জমি (শতাংশ)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {trans.plots?.map((plot) => (
                                                            <tr key={plot.plot_no}>
                                                                <td>{plot.plot_no}</td>
                                                                <td className="text-right">{Number(plot.totalLandInPlot).toFixed(3)}</td>
                                                                <td className="text-right">{Number(plot.share).toFixed(3)}</td>
                                                                <td className="text-right">
                                                                    {(Number(plot.totalLandInPlot) * Number(plot.share)).toFixed(3)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td className="text-right font-bold text-black" >
                                                                সর্মমোট:
                                                            </td>
                                                            <td className="text-right font-bold text-black">
                                                                {Number(totalLand).toFixed(3)}
                                                            </td>
                                                            <td className="text-right font-bold text-black" colSpan={2}>
                                                                {Number(ownertotalLand).toFixed(3)}
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
                    {ownerData?.transfered?.map((trans) => {
                        const totalLand = trans.plots?.reduce((sum, plot) => sum + plot.transferedLand, 0) || 0;

                        return (
                            <React.Fragment key={trans.transferedId}>
                                {/* Collapse Title Row */}
                                <tr
                                    onClick={() => toggleRow(trans.acquiredId)}
                                    className="cursor-pointer hover:bg-base-200 transition"
                                >
                                    <td>
                                        মালিকানা প্রাপ্তির ধরণ: {trans?.source.acquiredType}, জেলা: {trans?.district}, থানা: {trans.thana}, মৌজা:{trans.mouja}, {trans.khatian_type} {trans?.khatian_No} নং খতিয়ান
                                    </td>
                                    <td className='text-right'>{Number(totalLand).toFixed(3)}</td>
                                </tr>

                                {/* Collapse Content Row */}
                                {openRow === trans.acquiredId && (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="bg-base-200 p-2 rounded h-96 overflow-y-auto">
                                                <table className="table table-sm w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>দাগ নং</th>
                                                            <th>দাগে মোট জমি</th>
                                                            <th>দাগে মালিকানার অংশ</th>
                                                            <th className="text-right">প্রাপ্ত জমি (শতাংশ)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {trans.plots?.map((plot) => (
                                                            <tr key={plot.plot_no}>
                                                                <td>{plot.plot_no}</td>
                                                                <td className="text-right">{Number(plot.totalLandinPlot).toFixed(3)}</td>
                                                                <td className="text-right">{Number(plot.share).toFixed(3)}</td>
                                                                <td className="text-right">
                                                                    {Number(plot.acquiredLand).toFixed(3)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td className="text-right font-bold text-black" colSpan={3}>
                                                                সর্মমোট: {Number(totalLand).toFixed(3)}
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