// App.js
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MapComponent from "./components/MapComponent";
import Admin from "./pages/Admin";
function App() {
  const [potholes, setPotholes] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  console.log("potholes:", potholes);
  console.log(showHeatmap);
  const [regionFilter, setRegionFilter] = useState("경기도 안산시");

  const handleRegionChange = (region) => {
    setRegionFilter(region);
  };

  console.log("📌 regionFilter:", regionFilter);

  useEffect(() => {
    const url = `http://localhost:8000/api/potholes/region?name=${encodeURIComponent(
      regionFilter
    )}`;
    console.log("📡 Fetch URL:", url);

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        console.log("✅ 응답 내용:", data);
        console.log("📦 받아온 데이터:", data);
        setPotholes(data);
      })
      .catch(console.error);
  }, [regionFilter]);

  const [potholesToday, setPotholesToday] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/today")
      .then((r) => r.json())
      .then((data) => setPotholesToday(data.count))
      .catch(console.error);
  }, []);
  const [coords, setCoords] = useState(null);

  return (
    <Routes>
      {/* 메인 페이지 */}
      <Route path="/" element={<MainPage />} />
      {/* 관리자 페이지 */}
      <Route
        path="/user"
        element={
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              {" "}
              {/* 중요! */}
              <Sidebar
                potholesToday={potholesToday}
                onCoordsChange={setCoords}
                onRegionChange={handleRegionChange}
                potholes={potholes}
              />
              <div className="relative flex-1">
                <MapComponent
                  coords={coords}
                  potholes={potholes}
                  showHeatmap={showHeatmap}
                />
                {/* 확대/축소 버튼 */}
                <button
                  className="absolute z-10 px-2 py-2 bg-white border rounded shadow top-16 left-4 hover:bg-gray-100"
                  onClick={() => setShowHeatmap((prev) => !prev)}
                >
                  {showHeatmap ? "마커 보기" : "히트맵 보기"}
                </button>
                {/* <div className="absolute bg-white rounded-lg shadow left-4 top-14">
                  <button className="!rounded-button p-2 hover:bg-gray-100">
                    <i className="text-gray-600 fas fa-plus"></i>
                  </button>
                  <button className="!rounded-button p-2 hover:bg-gray-100 border-t border-gray-200">
                    <i className="text-gray-600 fas fa-minus"></i>
                  </button>
                  <button className="!rounded-button p-2 hover:bg-gray-100 border-t border-gray-200">
                    <i className="text-gray-600 fas fa-location-crosshairs"></i>
                  </button>
                </div> */}
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
            <Admin
              coords={coords}
              potholes={potholes}
              showHeatmap={showHeatmap}
            />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
