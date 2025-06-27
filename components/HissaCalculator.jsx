'use client';
import React, { useEffect, useState } from 'react';

const HissaCalculator = ({ handleHissa, index, isDecimal, shareType, share = 0 }) => {
    const [ana, setAna] = useState(0);
    const [ganda, setGanda] = useState(0);
    const [kara, setKara] = useState(0);
    const [kranti, setKranti] = useState(0);
    const [til, setTil] = useState(0);
    const [inputSahre, setInputShare] = useState(0)

    function convertDecimalToAnaUnits(share) {
        let remaining = share;
        const ana = Math.floor(remaining * 16);
        setAna(ana)
        remaining -= ana / 16;
        const ganda = Math.floor(remaining * 320);
        setGanda(ganda)
        remaining -= ganda / 320;

        const kara = Math.floor(remaining * 1280);
        setKara(kara)
        remaining -= kara / 1280;

        const kranti = Math.floor(remaining * 3840);
        setKranti(kranti)
        remaining -= kranti / 3840;

        const til = Math.round(remaining * 76800);
        setTil(til)// round last part
    }




    const handleHissaValue = () => {
        let share = 0
        if (isDecimal) {
            share = inputSahre || 0
        } else {
            const total =
                ana +
                ganda / 20 +
                kara / 80 +
                kranti / 240 +
                til / 4800;
            share = (total / 16).toFixed(10);
        }
        if (shareType === 'plot' && share > 1) {
            alert('হিস্যা ১ এর বেশি হতে পারবে না।');
            setGanda(0);
            setKara(0);
            setKranti(0);
            setTil(0)

            return
        }
        if (shareType === 'owner' && share > 1) {
            alert('হিস্যা ১ এর বেশি হতে পারবে না।');
            setGanda(0);
            setKara(0);
            setKranti(0);
            setTil(0)

            return
        }
        else {
            handleHissa(index, 'share', share);
            setInputShare(share)
        }
    }

    useEffect(() => {
        handleHissaValue();
    }, [ana, ganda, kara, kranti, til, inputSahre])

    useEffect(() => {
        convertDecimalToAnaUnits(share)
    }, [isDecimal])

    return (


        <fieldset className='fieldset  border-base-300 rounded-box w-xs border p-2'>
            <legend className="fieldset-legend text-green-600 font-bold">
                {share.toFixed(10)}
            </legend>
            {isDecimal ?
                <input
                    type="text"
                    placeholder="হিস্যা"
                    defaultValue={inputSahre}
                    onChange={(e) => setInputShare(Number(e.target.value))}
                    className="flex-1 border p-2 rounded"
                    required
                /> :
                <div className="grid grid-cols-5 gap-2">
                    {/* Ana */}
                    <div className="flex flex-col justify-center">
                        <label className="font-medium text-gray-700">আনা</label>
                        <select className="select select-xs" value={ana} onChange={(e) => setAna(Number(e.target.value))}>
                            <option value="0">আনা সিলেক্ট করুন</option>
                            <option value="1">&#x002F; =১ আনা</option>
                            <option value="2">&#x09F5; =২ আনা</option>
                            <option value="3">&#x09F6; =৩ আনা</option>
                            <option value="4">&#x09F7; =৪ আনা</option>
                            <option value="5">&#x09F7;&#x002F; =৫ আনা</option>
                            <option value="6">&#x09F7;&#x09F5; =৬ আনা</option>
                            <option value="7">&#x09F7;&#x09F6; =৭ আনা</option>
                            <option value="8">&#x09F7;&#x09F7; =৮ আনা</option>
                            <option value="9">&#x09F7;&#x09F7;&#x002F; =৯ আনা</option>
                            <option value="10">&#x09F7;&#x09F7;&#x09F5; =১০ আনা</option>
                            <option value="11">&#x09F7;&#x09F7;&#x09F6; =১১ আনা</option>
                            <option value="12">&#x09F8; =১২ আনা</option>
                            <option value="13">&#x09F8;&#x002F; =১৩ আনা</option>
                            <option value="14">&#x09F8;&#x09F5; =১৪ আনা</option>
                            <option value="15">&#x09F8;&#x09F6; =১৫ আনা</option>
                            <option value="16">&#x09E7; =১৬ আনা</option>
                        </select>
                    </div>

                    {/* Ganda */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">গন্ডা</label>
                        <select className="select select-xs" value={ganda} onChange={(e) => setGanda(Number(e.target.value))}>
                            <option value="0">গন্ডা সিলেক্ট করুন</option>
                            {[...Array(20).keys()].slice(1).map((i) => (
                                <option key={i} value={i}>{i} গন্ডা</option>
                            ))}
                        </select>
                    </div>

                    {/* Kara */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">কড়া</label>
                        <select className="select select-xs" value={kara} onChange={(e) => setKara(Number(e.target.value))}>
                            <option value="0">কড়া সিলেক্ট করুন</option>
                            <option value="1">&#x09F7; =১ কড়া</option>
                            <option value="2">&#x09F7;&#x09F7; =২ কড়া</option>
                            <option value="3">&#x09F8; =৩ কড়া</option>
                        </select>
                    </div>

                    {/* Kranti */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">ক্রান্তি</label>
                        <select className="select select-xs" value={kranti} onChange={(e) => setKranti(Number(e.target.value))}>
                            <option value="0">ক্রান্তি সিলেক্ট করুন</option>
                            <option value="1">&#x09F4; =১ ক্রান্তি</option>
                            <option value="2">&#x09F4;&#x09F4; =২ ক্রান্তি</option>
                        </select>
                    </div>

                    {/* Til */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">তিল</label>
                        <select className="select select-xs" value={til} onChange={(e) => setTil(Number(e.target.value))}>
                            <option value="0">তিল সিলেক্ট করুন</option>
                            {[...Array(19).keys()].map((i) => (
                                <option key={i} value={i + 1}>{i + 1} তিল</option>
                            ))}
                        </select>
                    </div>
                </div>}
        </fieldset>


    );
};

export default HissaCalculator;
