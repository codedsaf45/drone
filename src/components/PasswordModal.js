// components/PasswordModal.jsx
import React, { useState } from "react";

export default function PasswordModal({ isOpen, onClose, onConfirm }) {
  const [pw, setPw] = useState("");

  if (!isOpen) return null;

  return (
    // 백드롭
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* 모달 박스 */}
      <div className="p-6 bg-white rounded-lg shadow-lg w-80">
        <h2 className="mb-4 text-lg font-semibold">관리자 인증</h2>
        <input
          type="password"
          className="w-full px-3 py-2 mb-4 border rounded focus:outline-none focus:ring"
          placeholder="비밀번호를 입력하세요"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => {
              setPw("");
              onClose();
            }}
          >
            취소
          </button>
          <button
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => {
              onConfirm(pw);
              setPw("");
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
