'use client';
import { The_Nautigal } from 'next/font/google';
import { useEffect, useState } from 'react';
import HissaCalculator from '../HissaCalculator';

export default function LandForm() {
    const data = {
        "district": "",
        "thana": "",
        "touji_No": "",
        "mouja": "",
        "j.l_no": "",
        "khatian_No": "",
        "khatian_type": "",
        "plots": [],
        "owners": [],
        "totalLand": 0
    }
    const [landInfo, setLandInfo] = useState(data)

    const [ownersTotalShare, setOwnersTotalShare] = useState(0)
    useEffect(() => {
        const totalShare = landInfo?.owners?.reduce((totalShare, owner) => totalShare + Number(owner.share) || 0, 0)
        setOwnersTotalShare(totalShare)
    }, [landInfo.owners]);
    const handleOwnerChange = (index, field, value) => {
        if (field === "share" && Number(value) + Number(ownersTotalShare) > 1) {
            alert('মালিকানার মোট হিস্যা 1  এর বেশি হতে পারবে না।')
            return
        }
        const owners = [...landInfo?.owners]; // create a shallow copy of the owners array
        owners[index] = {
            ...owners[index],
            [field]: value, // update the specific field (name or share)
        };
        setLandInfo(prev => ({
            ...prev,
            owners // update only the owners array
        }));

    };
    const handlePlotChange = (index, field, value) => {
        if (field === "share" && value > 1) {
            alert('দাগের হিস্যা 1  এর বেশি হতে পারবে না।')
            return
        }
        const plots = [...landInfo?.plots]; // create a shallow copy of the owners array
        plots[index] = {
            ...plots[index],
            [field]: value, // update the specific field (name or share)
        };

        const totalLand = plots.reduce((total, plot) => total + (plot.totalLandInPlot * plot.share), 0)

        setLandInfo(prev => ({
            ...prev,
            plots,
            totalLand
            // update only the owners array
        }));
    };

    const addOwner = () => {
        const updatedowners = [...landInfo?.owners || [], {
            "name": "",
            "share": 0,
        }]
        setLandInfo({ ...landInfo, owners: updatedowners })
    };
    const addPlot = () => {
        const updatedPlots = [...landInfo?.plots || [], {
            "plot_no": "",
            "totalLandInPlot": 0,
            "share": 0,
        }]
        setLandInfo({ ...landInfo, plots: updatedPlots })
    };

    const removePlot = (index) => {
        const updatedPlots = landInfo?.plots?.filter((_, i) => i !== index);
        const totalLand = updatedPlots.reduce((total, plot) => total + (plot.totalLandInPlot * plot.share), 0)

        setLandInfo(prev => ({
            ...prev,
            plots: updatedPlots,
            totalLand
            // update only the owners array
        }));

    }

    console.log(landInfo);
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {

        };
        console.log('Submitted:', data);
        // এখানে API call যাবে
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mx-auto mt-8 p-4 border rounded">
            <div className='space-y-4 grid grid-cols-6 gap-4 p-4'>
                <h2 className="text-xl font-bold mb-4 col-span-full">জমির তথ্য</h2>
                <input
                    type="text"
                    placeholder="জিলা"
                    defaultValue={landInfo?.district}

                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="থানা"
                    defaultValue={landInfo.thana}

                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="তৌজি"
                    defaultValue={landInfo.touji_No}
                    className="input"
                    required
                />

                <input
                    type="text"
                    placeholder="মৌজা"
                    defaultValue={landInfo?.mouja}

                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="খতিয়ান নং"
                    defaultValue={landInfo?.khatian_No}

                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="জমির পরিমাণ"
                    defaultValue={landInfo?.totalLand}
                    className="input"
                    required
                />

            </div>

            <div tabIndex={0} className='collapse collapse-arrow bg-base-100 border border-base-300'>
                <input type="checkbox" />

                <div className="collapse-title font-semibold flex justify-between">
                    <h2>
                        দাগের তথ্য
                    </h2>
                    <h2>
                        অন্তর্ভূক্ত দাগসমূহ:  {landInfo?.plots?.map(plot => plot.plot_no).join(',')}
                    </h2>
                    <h2>
                        মোট জমি:  {landInfo?.totalLand}
                    </h2>
                </div>
                <div className='collapse-content text-sm overflow-x-auto max-h-96'>
                    <table className='table table-pin-rows '>
                        <thead>
                            <tr className='text-wrap'>
                                <th>প্লট নং</th>
                                <th>দাগের মোট পরিমান</th>
                                <th>দাগের মধ্যে অত্র স্বত্বের অংশ</th>
                                <th className='flex flex-wrap text-wrap'>দাগের মধ্যে অত্র স্বত্বের অংশের জমির পরিমান</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {landInfo?.plots?.map((plot, index) => (
                                <tr key={index} className="">
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="প্লট নং"
                                            value={plot.plot_no}
                                            onChange={(e) => handlePlotChange(index, 'plot_no', e.target.value)}
                                            className="flex-1 border p-2 rounded"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="দাগে মোট জমি"
                                            value={plot.totalLandInPlot}
                                            onChange={(e) => handlePlotChange(index, 'totalLandInPlot', e.target.value)}
                                            className="flex-1 border p-2 rounded"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <HissaCalculator />
                                        <input
                                            type="text"
                                            placeholder="হিস্যা"
                                            value={plot.share}
                                            onChange={(e) => handlePlotChange(index, 'share', e.target.value)}
                                            className="flex-1 border p-2 rounded"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <output className="text-green-500 flex-1 input">
                                            {landInfo?.plots[index].share * landInfo?.plots[index].totalLandInPlot || 0}
                                        </output>

                                    </td>
                                    <td><span className='btn btn-error btn-soft' onClick={() => removePlot(index)}>-</span></td>




                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <span
                        type="button"
                        onClick={addPlot}
                        className="text-sm btn btn-link text-blue-600"
                    >
                        + নতুন দাগ
                    </span>
                </div>


            </div>
            <div tabIndex={0} className='collapse collapse-arrow bg-base-100 border border-base-300'>
                <input type="checkbox" />

                <div className="collapse-title font-semibold flex justify-between">
                    <h2>
                        মালিকগণের তথ্য
                    </h2>
                    <h2>
                        মোট মালিক:  {landInfo?.owners?.length}
                    </h2>
                    <h2>
                        অবশিষ্ট মালিকানা অংশ:  {1 - ownersTotalShare}
                    </h2>
                    <h2>
                        মোট জমি:  {ownersTotalShare * landInfo.totalLand}
                    </h2>
                </div>
                <div className='collapse-content text-sm'>
                    {landInfo?.owners?.map((owner, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="নাম"
                                value={owner.name}
                                onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
                                className="flex-1 border p-2 rounded"
                                required
                            />
                            <input
                                type="text"
                                placeholder="অত্র খতিয়ানে মালিকের অংশ"
                                value={owner.share}
                                onChange={(e) => handleOwnerChange(index, 'share', e.target.value)}
                                className="flex-1 border p-2 rounded"
                                required
                            />
                            <output className="text-green-500 flex-1 input">
                                {owner.share * landInfo?.totalLand || 0}
                            </output>


                        </div>
                    ))}
                    <span

                        disabled={ownersTotalShare >= 1}
                        onClick={addOwner}
                        className="text-sm btn btn-link text-blue-600"
                    >
                        + নতুন মালিক
                    </span>
                </div>


            </div>
            <button
                type="submit"
                className="mt-4 btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                সাবমিট করুন
            </button>
        </form>
    );
}
