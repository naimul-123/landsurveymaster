'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const InheritanceForm = () => {
    const [inheritances, setInheritances] = useState([]);
    const [sumOfRelative, setSumOfRelative] = useState([])
    // const [residue, setResidue] = useState(0)
    // শরীয়ত অনুযায়ী সম্ভাব্য সব উত্তরাধিকারীগণের তালিকা
    const relatives = [
        // প্রথম স্তরের ওয়ারিশগণ
        'পুত্র', 'কন্যা', 'পিতা', 'মাতা', 'স্বামী', 'স্ত্রী',
        // দ্বিতীয় স্তরের ওয়ারিশগণ
        'পুত্রের পুত্র', 'পুত্রের কন্যা', 'দাদা', 'দাদী', 'নানী', 'বৈপিত্রেয় ভাই/বোন',
        // যাবিল ফুরুজ নারী

        // আসাবাগণ
        'সহোদর ভাই', 'সহোদর বোন', 'বৈমাত্রেয় ভাই', 'বৈমাত্রেয় বোন',
        'সহোদর ভাইয়ের পুত্র', 'সৎ ভাই (বৈমাত্রেয়)-এর পুত্র', 'সহোদর ভাইয়ের পুত্রের পুত্র', 'সৎ ভাই (বৈমাত্রেয়)-এর পুত্রের পুত্র', 'আপন চাচা', 'সৎ চাচা', 'আপন চাচার পুত্র', 'সৎ চাচার পুত্র', 'আপন চাচার পুত্রের পুত্র', 'সৎ চাচার পুত্রের পুত্র'
    ];
    const uniqueRelatives = ['স্বামী', 'পিতা', 'মাতা', 'দাদা', 'দাদী', 'নানী',];
    const usedUniqueRelatives = inheritances
        .map(item => item.relation)
        .filter(relation => uniqueRelatives.includes(relation));


    console.log(inheritances);

    const addInheritance = () => {
        setInheritances(prev => [...prev, { name: '', relation: '' }]);
    };

    const removeInheritance = (index) => {
        setInheritances(prev => prev.filter((_, i) => i !== index));
    };

    const handleInheritanceChange = (index, field, value) => {
        const updated = [...inheritances];
        updated[index][field] = value;
        const uniqueRelations = ['স্বামী', 'পিতা', 'মাতা', 'দাদা', 'দাদী', 'নানী'];
        const multipleLimitRelations = { 'স্ত্রী': 4 };
        const relativeCount = updated.reduce((acc, relative) => {
            if (relative.relation) {
                acc[relative.relation] = (acc[relative.relation] || 0) + 1;
            }
            return acc;
        }, {});
        if (uniqueRelations.includes(value) && relativeCount[value] > 1) {
            updated[index][field] = "";
            toast.error(`"${value}" সম্পর্কটি একাধিকবার দেওয়া যাবে না!`);
            setInheritances(updated);
            return;
        }

        if (value === 'স্ত্রী' && relativeCount['স্ত্রী'] > multipleLimitRelations['স্ত্রী']) {
            updated[index][field] = "";
            toast.error(`একজনের সর্বোচ্চ ৪ জন স্ত্রী থাকতে পারে!`);
            setInheritances(updated);
            return;
        }

        if (value === 'স্ত্রী' && relativeCount['স্বামী'] > 0) {
            updated[index][field] = "";
            toast.error(`যেহেতু স্বামী সম্পর্ক দেওয়া হয়েছে, স্ত্রী সম্পর্ক আর দেওয়া যাবে না!`);
            setInheritances(updated);
            return;
        }

        if (value === 'স্বামী' && relativeCount['স্ত্রী'] > 0) {
            updated[index][field] = "";
            toast.error(`যেহেতু স্ত্রী সম্পর্ক দেওয়া হয়েছে, স্বামী সম্পর্ক আর দেওয়া যাবে না!`);
            setInheritances(updated);
            return;
        }

        setInheritances(updated);
    };

    const calculateRelative = (relatives) => {

        // heirs will be an array of objects like: { relationName: "পুত্র", totalRelative: 2 }
        const heirMap = relatives.reduce((acc, relative) => {
            acc[relative.relation] = (acc[relative.relation] || 0) + 1;
            return acc;
        }, {});

        const heirs = Object.entries(heirMap).map(([relationName, totalRelative]) => ({
            relationName,
            totalRelative
        }));
        console.log(heirs);
        let total = 1;
        let shares = {};

        // helper function to get totalRelative by relation name
        const getCount = (relation) => {
            return heirs.find(h => h.relationName === relation)?.totalRelative || 0;
        }

        const hasSon = getCount("পুত্র");
        const hasdoughter = getCount("কন্যা");
        const hasChildren = hasSon || hasdoughter;
        const hasBrother = getCount("সহোদর ভাই")
        const hasSister = getCount("সহোদর বোন");

        const hasSiblings = hasBrother || hasSister;
        const hasFather = getCount("পিতা");
        const hasGrandFather = getCount("দাদা");
        const hasHusbend = getCount("স্বামী");
        const hasWife = getCount("স্ত্রী")
        const hasMother = getCount("মাতা");
        const hasGrandSon = getCount("পুত্রের পুত্র")
        const hasGrandDoughter = getCount("পুত্রের কন্যা");
        const hasGrandChildren = hasGrandSon || hasGrandDoughter
        const hasMaternalSiblings = getCount("বৈপিত্রেয় ভাই/বোন")
        const hasPaternalHalfSister = getCount('বৈমাত্রেয় বোন');
        const hasPaternalHalfBrother = getCount('বৈমাত্রেয় ভাই');


        // === পিতা ===
        if (hasFather) {
            shares["পিতা"] = hasChildren ? 1 / 6 : 0;
        }
        // === দাদা ===
        if (hasGrandFather && !hasFather) {
            shares["দাদা"] = hasChildren ? 1 / 6 : 0;
        }
        // === বৈপিত্রেয় ভাই বোন ===

        if (hasMaternalSiblings && !hasChildren && !hasGrandChildren && !hasFather && !hasGrandFather) {
            shares["বৈপিত্রেয় ভাই/বোন"] = hasMaternalSiblings > 1 ? (1 / 3) / hasMaternalSiblings : (1 / 6);
        }
        // === স্বামী ===
        if (hasHusbend) {
            shares["স্বামী"] = hasChildren ? 1 / 4 : 1 / 2;
        }

        // === স্ত্রী ===

        if (hasWife) {
            shares["স্ত্রী"] = hasChildren ? (1 / 8) / hasWife : (1 / 4) / hasWife;
        }
        // === কন্যা ===
        if (hasdoughter && !hasSon) {
            shares["কন্যা"] = hasdoughter == 1 ? (1 / 2) : (2 / 3) / hasdoughter;
        }
        // ===পুত্রের কন্যা ===
        if (hasGrandDoughter && !hasSon && !hasGrandSon) {
            shares["পুত্রের কন্যা"] = hasdoughter > 1 ? 0 : hasdoughter == 1 ? (1 / 6) / hasGrandDoughter : !hasdoughter && hasGrandDoughter > 1 ? (2 / 3) / hasGrandDoughter : 1 / 2;
        }
        // ===সহোদর বোন ===
        if (hasSister && !hasFather && !hasGrandFather && !hasSon && !hasGrandSon && !hasBrother) {
            shares["সহোদর বোন"] = hasSister > 1 ? (2 / 3) / hasSister : 1 / 2;
        }
        // ===বৈমাত্রেয় বোন ===
        if (hasPaternalHalfSister && !hasFather && !hasGrandFather && !hasSon && !hasGrandSon && !hasSiblings) {
            shares["বৈমাত্রেয় বোন"] = hasPaternalHalfSister > 1 ? (2 / 3) / hasPaternalHalfSister : 1 / 2;
        }
        if (hasPaternalHalfSister && hasdoughter && !hasFather && !hasGrandFather && !hasChildren && !hasGrandDoughter && !hasBrother) {
            shares["বৈমাত্রেয় বোন"] = hasdoughter == 1 ? (1 / 6) / hasPaternalHalfSister : 0;
        }
        // === মাতা ===
        if (hasMother) {
            shares["মাতা"] = hasChildren || hasSiblings ? 1 / 6 : hasHusbend && hasFather ? (1 - shares["স্বামী"]) * (1 / 3) : hasWife && hasFather ? (1 - shares["স্ত্রী"]) * (1 / 3) : hasHusbend && !hasFather && hasGrandFather ? (1 / 3) : hasWife && !hasFather && hasGrandFather ? 1 / 3 : 0;
        }
        // === দাদী ===
        if (getCount("দাদী")) {
            shares["দাদী"] = hasFather ? 0 : 1 / 6;
        }

        // === নানী ===
        if (getCount("নানী")) {
            shares["নানী"] = hasFather || hasMother ? 0 : 1 / 6;
        }




        // আসাবাগণের  হিসাব
        // === Fixed shares হিসাব করা ===

        let fixedShareTotal = 0;
        for (let key in shares) {
            const count = getCount(key); // একজন না একাধিক?
            if (shares[key] !== null && shares[key] !== undefined) {
                fixedShareTotal += shares[key] * count;
            }
        }

        const residue = (total - fixedShareTotal)

        // === পিতা যদি residuary হন (সন্তান না থাকলে) ===
        if (hasFather && (!hasSon || !hasGrandSon)) {
            shares["পিতা"] = hasdoughter || hasGrandDoughter ? shares["পিতা"] + residue : residue;
        }

        // === দাদা যদি residuary হন (সন্তান/পিতা না থাকলে) ===
        if (hasGrandFather && !hasFather && (!hasSon || !hasGrandSon)) {
            shares["দাদা"] = hasdoughter || hasGrandDoughter ? shares["দাদা"] + residue : residue;
        }

        // === পুত্র ও কন্যা (residuary) ===
        if (hasSon) {
            const totalUnit = Number(hasSon) * 2 + Number(hasdoughter);
            shares["পুত্র"] = (residue / totalUnit) * 2;
            if (hasdoughter) {
                shares["কন্যা"] = (residue / totalUnit);
            }

        }

        // === পুত্রের ছেলে ও কন্যা/পুত্রের কন্যা (residuary) ===
        if (hasGrandSon && !hasSon) {


            if (hasdoughter && !hasGrandDoughter) {
                shares["পুত্রের পুত্র"] = (residue / hasGrandSon);
            }
            if (hasGrandDoughter) {
                const totalUnit = Number(hasGrandSon) * 2 + Number(hasGrandDoughter);
                shares["পুত্রের পুত্র"] = (residue / totalUnit) * 2;
                shares["পুত্রের কন্যা"] = (residue / totalUnit);
            }


        }



        // ===সহোদর ভাই ও বোন===
        // ===সহোদর বোন ===
        if (hasSister && !hasFather && !hasGrandFather && !hasSon && !hasGrandSon && !hasBrother) {
            shares["সহোদর বোন"] = hasSister > 1 ? (2 / 3) / hasSister : 1 / 2;
        }

        // ===সহোদর বোন ===
        if (hasSister && !hasFather && !hasGrandFather && !hasSon && !hasGrandSon && !hasBrother) {

            shares["সহোদর বোন"] = hasdoughter || hasGrandDoughter ? residue : 0;
        }
        if (hasSister && hasBrother && !hasFather && !hasGrandFather && !hasSon && !hasGrandSon) {
            const totalUnit = hasBrother * 2 + hasSister
            shares["সহোদর বোন"] = residue / totalUnit;
            shares["সহোদর ভাই"] = (residue / totalUnit) * 2;
        }
        // ===বৈমাত্রেয় বোন ===
        if (hasPaternalHalfSister && (hasdoughter || hasGrandDoughter) && !hasSister && !hasFather && !hasGrandFather && !hasSon && !hasBrother) {
            shares["বৈমাত্রেয় বোন"] = residue;
        }
        if (hasSister && hasBrother && !hasFather && !hasGrandFather && !hasSon) {
            const totalUnit = hasBrother * 2 + hasSister
            shares["সহোদর বোন"] = residue / totalUnit;
            shares["সহোদর ভাই"] = (residue / totalUnit) * 2;
        }
        // রেজাল্ট রাউন্ড করে ফরম্যাট করো
        for (let key in shares) {
            shares[key] = parseFloat(shares[key].toFixed(4));
        }

        return { shares, residue };
    }






    useEffect(() => {
        const totalRelative = calculateRelative(inheritances)
        setSumOfRelative(totalRelative)
    }, [inheritances])

    console.log(sumOfRelative);
    // console.log(inheritances);
    return (
        <form>
            <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box">
                <input type="checkbox" />
                <div className="collapse-title font-semibold">
                    <h2 className="text-2xl font-bold text-primary">উত্তরাধীকারীর তথ্য</h2>
                    <div className="flex flex-col md:flex-row justify-between gap-2 mt-2 text-sm">
                        <h2>মোট উত্তরাধিকারী: {inheritances.length}</h2>
                        {/* <h2>মোট শেয়ার: {totalShare.toFixed(4)}</h2>
                        {totalShare > 1 && <h2 className="text-red-500 font-bold">⚠️ মোট শেয়ার ১ এর বেশি!</h2>} */}
                    </div>
                </div>

                <div className="collapse-content overflow-x-auto">
                    <table className="table text-sm">
                        <thead>
                            <tr>
                                <th>SL</th>
                                <th>নাম</th>
                                <th>সম্পর্ক</th>
                                <th>মুছুন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inheritances.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}.</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleInheritanceChange(index, 'name', e.target.value)}
                                            className="input input-bordered input-sm w-full"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="select select-bordered select-sm w-full"
                                            value={item.relation}
                                            onChange={(e) => handleInheritanceChange(index, 'relation', e.target.value)}
                                            required
                                        >
                                            <option value="">নির্বাচন করুন</option>
                                            {relatives.map((relative, i) => (
                                                <option key={i} value={relative}>
                                                    {relative}
                                                </option>
                                            )
                                            )}
                                        </select>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => removeInheritance(index)}
                                            className="btn btn-sm btn-error"
                                        >-
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={addInheritance}
                            className="btn btn-sm btn-outline btn-primary"
                        >
                            + নতুন উত্তরাধিকারী
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default InheritanceForm;
