'use client';

import { useEffect, useState } from 'react';
import HissaCalculator from '../HissaCalculator';

export default function LandForm() {
    const data = {
        "district": "",
        "thana": "",
        "touji": "",
        "mouja": "",
        "j.l_no": "",
        "khatian_No": "",
        "khatian_type": "",
        "plots": [],
        "owners": [],
        "totalLand": 0
    }
    const [landInfo, setLandInfo] = useState(data)
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
                    name='district'
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
                    defaultValue={landInfo.touji}
                    name='touji'
                    className="input"
                    required
                />

                <input
                    type="text"
                    placeholder="মৌজা"
                    defaultValue={landInfo?.mouja}
                    name='mouja'
                    className="input"
                    required
                />
                <select name='khatian_type'>
                    <option value="0">সিলেক্ট করুন</option>
                    <option value="C.S">সি.এস</option>
                    <option value="S.A">এস.এ</option>
                    <option value="R.S">আর.এস</option>
                    <option value="B.S">বি.এস</option>
                </select>
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
                <div>
                    <label className="block text-base font-semibold mb-2">হিস্যা হিসাব পদ্ধতি:</label>
                    <div className="flex items-center gap-3">
                        <span className={!isDecimal ? 'font-bold text-blue-600' : 'text-gray-500'}>
                            প্রাচীন(আনা-গন্ডা) পদ্ধতি
                        </span>

                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isDecimal}
                                onChange={handleToggleHissaMethod}
                            />
                            <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>

                        <span className={isDecimal ? 'font-bold text-green-600' : 'text-gray-500'}>
                            দশমিক ভিত্তিক
                        </span>
                    </div>
                </div>
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
                                <th className='flex flex-wrap text-wrap'>দাগের মধ্যে অত্র খতিয়ানের রসদীয় পরিমান</th>
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
                                        <HissaCalculator handleHissa={handlePlotChange} index={index} shareType="plot" share={Number(plot.share) || 0} isDecimal={isDecimal} />
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
                        অবশিষ্ট মালিকানা অংশ:  {(1 - ownersTotalShare).toFixed(10)}
                    </h2>
                    <h2>
                        বন্টনকৃত  মোট জমি:  {(ownersTotalShare * landInfo.totalLand).toFixed(4)}
                    </h2>
                </div>
                <div className='collapse-content text-sm'>
                    <table className='table table-pins-row'>
                        <thead>
                            <tr className='text-wrap'>
                                <td>SL</td>
                                <td>মালিকের নাম</td>
                                <td>অংশ</td>
                                <td>খতিয়ানে মালিকের মোট জমি</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {landInfo?.owners?.map((owner, index) => (
                                <tr key={index} className="">
                                    <td>{index + 1}.</td>
                                    <td><input
                                        type="text"
                                        placeholder="নাম"
                                        value={owner.name}
                                        onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
                                        className="flex-1 border p-2 rounded"
                                        required
                                    /></td>
                                    <td>  <HissaCalculator handleHissa={handleOwnerChange} shareType="owner" index={index} share={Number(owner.share) || 0} isDecimal={isDecimal} />
                                    </td>
                                    <td><output className="text-green-500 flex-1 input">
                                        {owner.share * landInfo?.totalLand || 0}
                                    </output></td>
                                    <td><span className='btn btn-error btn-soft' onClick={() => removeOwner(index)}>-</span></td>





                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <span

                        disabled={Number(ownersTotalShare.toFixed(10)) >= 1}
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
