'use client';

import { useEffect, useState } from 'react';
import HissaCalculator from '../HissaCalculator';
import { postData } from '@/lib/api';

export default function LandForm() {

    const [landInfo, setLandInfo] = useState({
        "plots": [],
        "owners": [],
        "totalLand": 0
    })
    const [isDecimal, setIsDecimal] = useState(false);
    const [ownersTotalShare, setOwnersTotalShare] = useState(0)


    const handleOwnerChange = (index, field, value) => {
        if (field === "share") {
            const otherSharesTotal = landInfo?.owners?.reduce((total, owner, i) => {
                if (i !== index) {
                    return total + Number(owner.share || 0);
                }
                return total;
            }, 0);

            const newTotalShare = Number((otherSharesTotal + Number(value || 0)).toFixed(10));

            if (newTotalShare > 1) {
                alert('মালিকানার মোট হিস্যা 1 এর বেশি হতে পারবে না।');
                return;
            }

            setOwnersTotalShare(newTotalShare);

        }

        else {
            // নাম পরিবর্তন হলে শেয়ারের টোটাল অপরিবর্তিত থাকবে
            const totalShare = landInfo?.owners?.reduce((total, owner) => total + Number(owner.share || 0), 0);
            setOwnersTotalShare(Number(totalShare.toFixed(10)));
        }

        const owners = [...landInfo?.owners];
        owners[index] = {
            ...owners[index],
            [field]: value,
        };
        setLandInfo(prev => ({
            ...prev,
            owners,
        }));
    };



    const handleToggleHissaMethod = () => {
        const newIsDecimal = !isDecimal;
        setIsDecimal(newIsDecimal);
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
    const removeOwner = (index) => {
        const updatedOwners = landInfo?.owners?.filter((_, i) => i !== index);
        const totalShare = updatedOwners.reduce((total, owner) => total + Number(owner.share || 0), 0);
        setOwnersTotalShare(Number(totalShare.toFixed(10)));
        setLandInfo(prev => ({
            ...prev,
            owners: updatedOwners,
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const district = form.district.value;
        const thana = form.thana.value;
        const touji = form.touji.value;
        const mouja = form.mouja.value;
        const jl_no = form.jl_no.value;
        const khatian_No = form.khatian_No.value;
        const khatian_type = form.khatian_type.value;

        const data = { ...landInfo, district, thana, touji, mouja, jl_no, khatian_No, khatian_type }
        const response = await postData('/api/addkhatian', data)
        console.log('Submitted:', response);
        // এখানে API call যাবে
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 w-full max-w-screen-xl mx-auto mt-8 p-6 bg-base-100 border border-base-300 rounded-xl shadow-md flex flex-col"
        >

            {/* খতিয়ানের তথ্য */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <h2 className="text-2xl font-bold col-span-full text-primary">খতিয়ানের তথ্য</h2>

                <input name="district" type="text" placeholder="জিলা" className="input input-bordered input-primary w-full" required />
                <input name="thana" type="text" placeholder="থানা" className="input input-bordered input-primary w-full" required />
                <input name="touji" type="text" placeholder="তৌজি" className="input input-bordered input-primary w-full" required />
                <input name="jl_no" type="text" placeholder="জে.এল নং" className="input input-bordered input-primary w-full" required />
                <input name="mouja" type="text" placeholder="মৌজা" className="input input-bordered input-primary w-full" required />

                <select name="khatian_type" className="select select-bordered select-primary w-full">
                    <option value="0" disabled>সিলেক্ট করুন</option>
                    <option value="C.S">সি.এস</option>
                    <option value="S.A">এস.এ</option>
                    <option value="R.S">আর.এস</option>
                    <option value="B.S">বি.এস</option>
                </select>

                <input name="khatian_No" type="text" placeholder="খতিয়ান নং" className="input input-bordered input-primary w-full" required />

                <output className="input input-bordered bg-base-200 text-center font-semibold text-gray-700 w-full">
                    {landInfo?.totalLand || "মোট জমির পরিমান"}
                </output>

                <div className="col-span-full mt-4">
                    <label className="block text-base font-semibold mb-2 text-gray-700">হিস্যা হিসাব পদ্ধতি:</label>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className={!isDecimal ? 'font-bold text-blue-600' : 'text-gray-400'}>প্রাচীন(আনা-গন্ডা)</span>
                        <input type="checkbox" className="toggle toggle-success" checked={isDecimal} onChange={handleToggleHissaMethod} />
                        <span className={isDecimal ? 'font-bold text-green-600' : 'text-gray-400'}>দশমিক ভিত্তিক</span>
                    </div>
                </div>
            </div>

            {/* দাগের তথ্য */}
            <div tabIndex={0} className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                    <h2 className="text-2xl font-bold text-primary">দাগের তথ্য</h2>
                    <div className="flex flex-col md:flex-row justify-between gap-2 mt-2 text-sm">
                        <h2>অন্তর্ভূক্ত দাগ: {landInfo?.plots?.map(plot => plot.plot_no).join(', ')}</h2>
                        <h2>মোট জমি: {landInfo?.totalLand} শতাংশ</h2>
                    </div>
                </div>

                <div className="collapse-content overflow-x-auto">
                    <table className="table text-sm">
                        <thead>
                            <tr>
                                <th>SL</th>
                                <th>প্লট নং</th>
                                <th>দাগে মোট জমি (শতাংশ)</th>
                                <th>অত্র স্বত্বের অংশ</th>
                                <th>অত্র খতিয়ানের রসদীয় পরিমান</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {landInfo?.plots?.map((plot, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={plot.plot_no}
                                            onChange={(e) => handlePlotChange(index, 'plot_no', e.target.value)}
                                            className="input input-bordered input-sm w-full"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={plot.totalLandInPlot}
                                            onChange={(e) => handlePlotChange(index, 'totalLandInPlot', e.target.value)}
                                            className="input input-bordered input-sm w-full"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <HissaCalculator
                                            handleHissa={handlePlotChange}
                                            index={index}
                                            shareType="plot"
                                            share={Number(plot.share) || 0}
                                            isDecimal={isDecimal}
                                        />
                                    </td>
                                    <td>
                                        <output className="input input-sm input-bordered text-green-600 w-full">
                                            {plot.share * plot.totalLandInPlot || 0}
                                        </output>
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-sm btn-error" onClick={() => removePlot(index)}>-</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        <button type="button" onClick={addPlot} className="btn btn-sm btn-outline btn-primary">+ নতুন দাগ</button>
                    </div>
                </div>
            </div>

            {/* মালিকগণের তথ্য */}
            <div tabIndex={0} className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                    <h2 className="text-2xl font-bold text-primary">মালিকগণের তথ্য</h2>
                    <div className="flex flex-col md:flex-row justify-between gap-2 mt-2 text-sm">
                        <h2>মোট মালিক: {landInfo?.owners?.length}</h2>
                        <h2>অবশিষ্ট অংশ: {(1 - ownersTotalShare).toFixed(10)}</h2>
                        <h2>বন্টনকৃত জমি: {(ownersTotalShare * landInfo.totalLand).toFixed(4)}</h2>
                    </div>
                </div>

                <div className="collapse-content overflow-x-auto">
                    <table className="table text-sm">
                        <thead>
                            <tr>
                                <th>SL</th>
                                <th>নাম</th>
                                <th>অংশ</th>
                                <th>মোট জমি (শতাংশ)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {landInfo?.owners?.map((owner, index) => (
                                <tr key={index}>
                                    <td>{index + 1}.</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={owner.name}
                                            onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
                                            className="input input-bordered input-sm w-full"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <HissaCalculator
                                            handleHissa={handleOwnerChange}
                                            shareType="owner"
                                            index={index}
                                            share={Number(owner.share) || 0}
                                            isDecimal={isDecimal}
                                        />
                                    </td>
                                    <td>
                                        <output className="input input-sm input-bordered text-green-600 w-full">
                                            {(owner.share * landInfo?.totalLand || 0).toFixed(4)}
                                        </output>
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-sm btn-error" onClick={() => removeOwner(index)}>-</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={addOwner}
                            disabled={Number(ownersTotalShare.toFixed(10)) >= 1}
                            className="btn btn-sm btn-outline btn-primary"
                        >
                            + নতুন মালিক
                        </button>
                    </div>
                </div>
            </div>

            {/* সাবমিট */}
            <div className="text-center">
                <button type="submit" className="btn btn-success text-white px-6 py-2 mt-6">
                    সাবমিট করুন
                </button>
            </div>
        </form>

    );
}
