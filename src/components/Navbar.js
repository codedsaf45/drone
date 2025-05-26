import React, { useEffect, useRef } from "react";
import StatCard from "./StatCard"; // 상대 경로로 조정 필요
const handleReport = () => {
  console.log("포트홀 신고 버튼 클릭");
};
const total = 10;
const done = 100;
// const today = 100;

const Navbar = ({today}) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm ">
      <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center flex-shrink-0">
              <img className="w-auto h-16" src="/logo.png" alt="로고" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="sticky flex justify-around w-full px-6 py-3 z-25 top-10">
              <div className="flex gap-6 text-sm font-medium text-gray-600">
                <div>
                  전체 포트홀{" "}
                  <span className="font-bold text-gray-900">{today}</span>
                </div>
                <div>
                  오늘 발견{" "}
                  <span className="font-bold text-blue-600">{today}</span>
                </div>
                <div>
                  처리 완료{" "}
                  <span className="font-bold text-gray-500">{done}</span>
                </div>
              </div>
            </div>

            {/* <button
              onClick={handleReport}
              className="px-4 py-2 m-6 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <i className="mr-2 fas fa-plus"></i>포트홀 신고
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
