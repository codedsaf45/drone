// src/components/MainPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordModal from "/home/park/map_2/map/src/components/PasswordModal.js";

const MainPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleAdminConfirm = (inputPw) => {
    setShowModal(false);
    if (inputPw === "pass") {
      navigate("/admin");
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 알림 바 */}
      {/* <div className="fixed top-0 left-0 right-0 z-10 border-b border-yellow-200 bg-yellow-50">
        <div className="px-4 py-3 mx-auto max-w-8xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="mr-2 text-yellow-600 fas fa-bell"></i>
              <p className="text-sm text-yellow-800">
                시스템 점검 안내: 2024년 3월 15일 02:00 ~ 06:00 (4시간)
              </p>
            </div>
            <button className="text-yellow-600 hover:text-yellow-800">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div> */}

      {/* 헤더 */}
      <header className="pt-16">
        <div className="px-4 py-6 mx-auto max-w-8xl">
          <div className="flex justify-center">
            <img src="logo.png" alt="로고" className="h-24" />
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex items-center justify-center flex-grow px-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              접근 권한 선택
            </h1>
            <p className="text-gray-600">원하시는 접근 권한을 선택해주세요</p>
          </div>

          {/* 관리자 모달 호출 버튼 */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-between w-full p-6 text-white transition-colors bg-black rounded-button hover:bg-gray-800 group"
          >
            <div className="flex items-center">
              <i className="mr-4 text-2xl fas fa-user-shield"></i>
              <div className="text-left">
                <div className="text-lg font-medium">관리자 페이지</div>
                <div className="text-sm opacity-90">
                  시스템 관리 및 운영을 위한 관리자 전용 페이지
                </div>
              </div>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* 사용자 페이지 버튼 */}
          <button
            onClick={() => navigate("/user")}
            className="flex items-center justify-between w-full p-6 transition-colors bg-white border-2 border-custom text-custom rounded-button hover:bg-gray-50 group"
          >
            <div className="flex items-center">
              <i className="mr-4 text-2xl fas fa-user"></i>
              <div className="text-left">
                <div className="text-lg font-medium">사용자 페이지</div>
                <div className="text-sm opacity-90">
                  일반 사용자를 위한 서비스 페이지
                </div>
              </div>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </main>

      {/* 비밀번호 모달 */}
      <PasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleAdminConfirm}
      />

      {/* 푸터 */}
      <footer className="mt-auto border-t border-gray-200">
        <div className="px-4 py-6 mx-auto max-w-8xl">
          <div className="text-sm text-center text-gray-500">
            <p>© 2025 detection All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-gray-700">
                이용약관
              </a>
              <a href="#" className="hover:text-gray-700">
                개인정보처리방침
              </a>
              <a href="#" className="hover:text-gray-700">
                고객센터
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
