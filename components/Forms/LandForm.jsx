'use client';
import { useState } from 'react';

export default function LandForm() {
    const [landName, setLandName] = useState('');
    const [landArea, setLandArea] = useState('');
    const [owner, setOwner] = useState('');
    const [heirs, setHeirs] = useState([{ name: '', relation: '' }]);

    const handleHeirChange = (index, field, value) => {
        const newHeirs = [...heirs];
        newHeirs[index][field] = value;
        setHeirs(newHeirs);
    };

    const addHeir = () => {
        setHeirs([...heirs, { name: '', relation: '' }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            landName,
            landArea: parseFloat(landArea),
            owner,
            heirs
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
                    value={landName}
                    onChange={(e) => setLandName(e.target.value)}
                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="থানা"
                    value={landName}
                    onChange={(e) => setLandName(e.target.value)}
                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="তৌজি"
                    value={landName}
                    onChange={(e) => setLandName(e.target.value)}
                    className="input"
                    required
                />

                <input
                    type="text"
                    placeholder="মৌজা"
                    value={landName}
                    onChange={(e) => setLandName(e.target.value)}
                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="খতিয়ান নং"
                    value={landName}
                    onChange={(e) => setLandName(e.target.value)}
                    className="input"
                    required
                />
                <input
                    type="text"
                    placeholder="জমির পরিমাণ"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    className="input"
                    required
                />

            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">মালিকগণের তথ্য</h2>
                {heirs.map((heir, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="নাম"
                            value={heir.name}
                            onChange={(e) => handleHeirChange(index, 'name', e.target.value)}
                            className="flex-1 border p-2 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="অত্র খতিয়ানে মালিকের অংশ"
                            value={heir.relation}
                            onChange={(e) => handleHeirChange(index, 'relation', e.target.value)}
                            className="flex-1 border p-2 rounded"
                            required
                        />
                        <div className='w-full flex-1 input'>
                            <output className="text-green-500">
                                {heir.name}
                            </output>

                        </div>

                    </div>
                ))}
                <button
                    type="button"
                    onClick={addHeir}
                    className="text-sm btn btn-link text-blue-600"
                >
                    + নতুন মালিক যোগ করুন
                </button>
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
