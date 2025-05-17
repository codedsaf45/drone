import { useState } from "react";

export default function BottomSheet({ potholes = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg transition-all duration-300 rounded-t-xl z-40
        ${isOpen ? "h-[60%]" : "h-[80px]"}`}
    >
      {/* 📌 상단 드래그 바 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 font-medium text-center text-gray-600 border-b cursor-pointer"
      >
        {isOpen ? "▼ 목록 접기" : `▲ 포트홀 ${potholes.length}건 보기`}
      </div>

      {/* 📋 포트홀 리스트 */}
      <div className="h-full px-4 py-2 overflow-y-auto">
        {potholes.length === 0 ? (
          <p className="mt-6 text-center text-gray-400">
            포트홀 데이터가 없습니다.
          </p>
        ) : (
          potholes.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {p.description || "포트홀"}
                </p>
                <p className="text-xs text-gray-500">
                  위치: {p.latitude?.toFixed(5)}, {p.longitude?.toFixed(5)}
                </p>
              </div>
              <span
                className={`text-sm font-bold ${
                  p.severity >= 4
                    ? "text-red-500"
                    : p.severity === 3
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                심각도 {p.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
