import React, { useState } from 'react'
import { FaAnglesRight } from 'react-icons/fa6';

const OwnerCollapse = ({ owner, selectedKhatians, idx, handler, khatian, landAmountType }) => {
    const [selectedLandInfo, setSelectedLandInfo] = useState(() => {
        if (!owner?.transferable?.plot) return [];
        return owner.transferable.plot.map(p => ({
            plot_no: p.plot_no,
            // স্ট্রিং হিসেবে রাখলে টাইপিং এর মধ্যে “1.” ইত্যাদি ধরে থাকে
            selectedLand: p.selectedLand != null ? String(p.selectedLand) : "",
        }));
    })

    const filtered = owner.transferable?.filter(plot => plot.isSelected) || [];
    const totalTransfarableLand = filtered.reduce(
        (sum, plot) => sum + Number(plot.transferableTotalLand || 0),
        0
    );
    const totalSelectedLand = (selectedLandInfo ?? []).reduce((sum, plot) => sum + parseFloat(plot.selectedLand) || 0, 0)

    const handleSelectindividualBased = ({ plot_no, transferableTotalLand, selectedLand }) => {
        const val = parseFloat(selectedLand);

        // খালি বা অপ্রচলিত ইনপুট হলে ওই plot_no এর এন্ট্রি রিমুভ বা খালি রাখো
        if (selectedLand === "" || isNaN(val)) {
            setSelectedLandInfo(prev =>
                prev.filter(item => item.plot_no !== plot_no)
            );
            return;
        }

        // ভ্যালিডেশন
        if (val > transferableTotalLand) {
            alert("Transferable land must be less or equal of transferable total land");
            // ইমপুট রিসেট: আগের এন্ট্রি রাখবে না
            setSelectedLandInfo(prev =>
                prev.filter(item => item.plot_no !== plot_no)
            );
            return;
        }

        // বৈধ হলে upsert: একই plot_no থাকলে replace, নাহলে push
        setSelectedLandInfo(prev => {
            const exists = prev.find(item => item.plot_no === plot_no);
            if (exists) {
                return prev.map(item =>
                    item.plot_no === plot_no ? { plot_no, selectedLand: val } : item
                );
            } else {
                return [...prev, { plot_no, selectedLand: val }];
            }
        });
    };


    return totalTransfarableLand > 0 && (
        <div key={owner._id} className="collapse collapse-plus">
            <input type="checkbox" className="peer" />
            <div
                className="collapse-title bg-gray-300"
            >
                <h2 className='text-xs font-bold'>{idx + 1}. {owner.name}</h2>

            </div>
            <div
                className="collapse-content"
            >
                <div className="space-y-2 ml-2  gap-4">

                    {landAmountType === "portionBased" &&
                        <table className='table table-xs'>
                            <thead>
                                <tr className=''>
                                    <th className='text-[1px]'> হস্তান্তরযোগ্য জমি </th>
                                    <th className='text-[1px]'> রসদীয় জমি</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className=''>
                                    <td className='label-text'>{Number(totalTransfarableLand).toFixed(4)}</td>
                                    <td><input
                                        type="text"
                                        name="selectedTotalLand"
                                        className="input input-sm"
                                        required

                                    /></td>

                                </tr>
                            </tbody>
                        </table>
                    }
                    {landAmountType === "individualBased" &&
                        <table className='table table-xs'>
                            <thead>
                                <tr>
                                    <th>দাগ নং</th>
                                    <th>হস্তান্তরযোগ্য জমি</th>
                                    <th>রসদীয় জমি</th>

                                </tr>
                            </thead>
                            <tbody>

                                {filtered.map(plot => {
                                    const entry = selectedLandInfo.find(e => e.plot_no === plot.plot_no);
                                    return (
                                        <tr className="" key={plot.plot_no}>
                                            <td className="">{plot.plot_no}</td>
                                            <td>{Number(plot.transferableTotalLand).toFixed(4)}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    name="selectedTotalLand"
                                                    className="input input-sm"
                                                    onChange={(e) => handleSelectindividualBased({ plot_no: plot.plot_no, transferableTotalLand: plot.transferableTotalLand, selectedLand: e.target.value })}
                                                    value={entry ? entry.selectedLand : ""}

                                                    min="0"
                                                />
                                            </td>
                                        </tr>
                                    )
                                }
                                )}
                                <tr>
                                    <td>সর্বমোট:</td>
                                    <td>{Number(totalTransfarableLand).toFixed(4)}</td>
                                    <td>{Number(totalSelectedLand).toFixed(4)}</td>
                                </tr>

                            </tbody>
                        </table>


                    }
                    <button onClick={() => handler({ khatianId: khatian._id, ownerId: owner._id })} className="btn btn-sm btn-outline btn-success">
                        <FaAnglesRight />
                    </button>
                </div>



            </div>

        </div>



    )
}

export default OwnerCollapse