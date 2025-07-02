'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const InheritanceForm = () => {
    const [inheritances, setInheritances] = useState([]);
    const [sumOfRelative, setSumOfRelative] = useState([])

    // শরীয়ত অনুযায়ী সম্ভাব্য সব উত্তরাধিকারীগণের তালিকা
    const relatives = [
        // পুরুষ উত্তরাধিকারীগণ
        'স্বামী', 'স্ত্রী', 'পুত্র', 'কন্যা', 'পিতা', 'মাতা', 'দাদা', 'দাদী',
        'নানী', 'সহোদর ভাই', 'সহোদর বোন', 'সৎ ভাই (বৈমাত্রেয়)', 'সৎ বোন (বৈমাত্রেয়)',
        'সৎ ভাই (বৈপিত্রেয়)', 'সৎ বোন (বৈপিত্রেয়)', 'সহোদর ভাইয়ের পুত্র', 'সৎ ভাই (বৈমাত্রেয়)-এর পুত্র', 'সহোদর ভাইয়ের পুত্রের পুত্র', 'সৎ ভাই (বৈমাত্রেয়)-এর পুত্রের পুত্র', 'আপন চাচা', 'সৎ চাচা', 'আপন চাচার পুত্র', 'সৎ চাচার পুত্র', 'আপন চাচার পুত্রের পুত্র', 'সৎ চাচার পুত্রের পুত্র'
    ];
    const uniqueRelatives = ['স্বামী', 'পিতা', 'মাতা', 'দাদা', 'দাদী', 'নানী',];
    const usedUniqueRelatives = inheritances
        .map(item => item.relation)
        .filter(relation => uniqueRelatives.includes(relation));


    console.log(inheritances);
    const getDefaultShare = (relation, heirs) => {
        const hasChild = heirs.some(h => h.relation === 'পুত্র' || h.relation === 'কন্যা');
        switch (relation) {
            case 'স্বামী': return hasChild ? 0.25 : 0.5;
            case 'স্ত্রী': return hasChild ? 0.125 : 0.25;
            case 'মাতা': return hasChild ? 0.1667 : 0.3333;
            case 'পিতা': return hasChild ? 0.1667 : '';
            default: return '';
        }
    };

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

        const heirs = relatives.reduce((acc, relative) => {
            acc[relative.relation] = (acc[relative.relation] || 0) + 1;
            return acc;
        }, {});
        let total = 1; // মোট সম্পদ (1 মানে 100%)
        let shares = {};

        const hasChildren = heirs["পুত্র"] || heirs["কন্যা"];

        // === স্বামী ===
        if (heirs["স্বামী"]) {
            // সন্তান থাকলে 1/4, না থাকলে 1/2
            shares["স্বামী"] = hasChildren ? 1 / 4 : 1 / 2;
        }

        // === স্ত্রী ===
        if (heirs["স্ত্রী"]) {
            const wifeCount = heirs["স্ত্রী"];
            shares["স্ত্রী"] = hasChildren ? (1 / 8) * wifeCount : (1 / 4) * wifeCount;
        }

        // === মাতা ===
        if (heirs["মাতা"]) {
            // সন্তান বা একাধিক ভাই/বোন থাকলে 1/6, না হলে 1/3
            const hasSiblings = heirs["ভাই"] || heirs["বোন"];
            shares["মাতা"] = hasChildren || hasSiblings ? 1 / 6 : 1 / 3;
        }

        // === পিতা ===
        if (heirs["পিতা"]) {
            // সন্তান থাকলে পিতা পান 1/6, না থাকলে তিনি residuary হবেন
            shares["পিতা"] = hasChildren ? 1 / 6 : null; // null মানে এখনো হিসাব করা হয়নি
        }

        // === Fixed shares হিসাব করা ===
        let fixedShareTotal = 0;
        for (let key in shares) {
            if (shares[key] !== null) {
                fixedShareTotal += shares[key];
            }
        }

        const residue = total - fixedShareTotal;

        // === পুত্র ও কন্যা (residuary) ===
        const sonCount = heirs["পুত্র"] || 0;
        const daughterCount = heirs["কন্যা"] || 0;

        const totalUnits = (2 * sonCount) + daughterCount;

        if (totalUnits > 0) {
            const unitValue = residue / totalUnits;

            if (sonCount > 0) shares["পুত্র"] = unitValue * 2 * sonCount;
            if (daughterCount > 0) shares["কন্যা"] = unitValue * daughterCount;
        }

        // === পিতা যদি residuary হন (সন্তান না থাকলে) ===
        if (heirs["পিতা"] && shares["পিতা"] === null) {
            shares["পিতা"] = residue; // সম্পূর্ণ বাকি অংশ
        }

        // রেজাল্ট রাউন্ড করে ফরম্যাট করো
        for (let key in shares) {
            shares[key] = parseFloat(shares[key].toFixed(4));
        }

        return shares;

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
