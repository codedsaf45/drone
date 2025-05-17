import React from "react";

export default function StatCard({ title, value, textColor = "text-black" }) {
  return (
    <div className="p-4 text-center bg-white rounded shadow">
      <div className="mb-1 text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
    </div>
  );
}
