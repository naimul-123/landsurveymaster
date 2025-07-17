"use client";
import { useState } from "react";

const TreeNode = ({ node }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="pl-4 border-l border-gray-300 relative group">
            <div
                className="flex items-center justify-between gap-2 p-1 rounded hover:bg-gray-100"
                onClick={() => hasChildren && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 w-full">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <input
                        readOnly
                        className="bg-transparent border-none text-sm text-gray-800 w-full focus:outline-none"
                        value={node.title}
                    />
                </div>

                {node.value !== undefined && (
                    <input
                        readOnly
                        className="bg-transparent border-none text-sm text-right text-gray-500 w-24 focus:outline-none"
                        value={Number(node.value).toFixed(4)}
                    />
                )}
            </div>

            {/* Optional: actions like edit/delete */}
            <div className="absolute right-1 top-1 hidden group-hover:flex gap-1">
                <button className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                    Edit
                </button>
                <button className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                    Delete
                </button>
            </div>

            {hasChildren && isOpen && (
                <div className="ml-4 mt-1">
                    {node.children.map((child, i) => (
                        <TreeNode key={i} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
