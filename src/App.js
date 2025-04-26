// App.js
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MapComponent from "./components/MapComponent";
import Admin from "./pages/Admin";
function App() {
  const [coords, setCoords] = useState(null);

  return (
    <Routes>
      {/* 메인 페이지 */}
      <Route path="/" element={<MainPage />} />

      {/* 관리자 페이지 */}
      <Route
        path="/user"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar onCoordsChange={setCoords} />
              <div className="relative flex-1">
                <MapComponent coords={coords} />
                {/* 확대/축소/현재위치 버튼 */}
                <div className="absolute bg-white rounded-lg shadow left-4 top-14">
                  <button className="!rounded-button p-2 hover:bg-gray-100">
                    <i className="text-gray-600 fas fa-plus"></i>
                  </button>
                  <button className="!rounded-button p-2 hover:bg-gray-100 border-t border-gray-200">
                    <i className="text-gray-600 fas fa-minus"></i>
                  </button>
                  <button className="!rounded-button p-2 hover:bg-gray-100 border-t border-gray-200">
                    <i className="text-gray-600 fas fa-location-crosshairs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* 사용자 페이지 */}
      <Route
        path="/admin"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Admin />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
