import React from "react";
import { useSelector } from "react-redux";

const GlobalLoader = () => {
    const pending = useSelector((state) => state.ui.pendingRequests);
    if (!pending) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className="flex items-center gap-3 text-white">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Loading…</span>
            </div>
        </div>
    );
};

export default GlobalLoader;


