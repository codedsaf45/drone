// src/components/VideoMapLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import MapComponent from '../components/MapComponent';

const VideoMapLayout = ({ potholes = [], showHeatmap = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null); // 📌 마커 추적용 ref
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const res = await fetch("http://localhost:5000/gps");
        const data = await res.json();
        const { latitude, longitude } = data;
        if (latitude && longitude) {
          setCoords({ lat: latitude, lng: longitude });
        }
      } catch (err) {
        console.error("❌ GPS fetch 실패:", err);
      }
    };
    markerRef.current = new window.google.maps.Marker({
      position: coords,
      map: mapInstance.current,
      label: "📍",
    });

    // 최초 한 번 실행 후 주기적 fetch
    fetchCoords();
    const interval = setInterval(fetchCoords, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-auto h-full">
      {/* 왼쪽: YOLO 실시간 영상 */}
      <div className="flex items-center justify-center w-1/2 h-full bg-black">
        <img
          src="http://localhost:5000/video_feed"
          alt="YOLO 실시간 스트림"
          className="object-contain w-full h-full"
        />
      </div>

      {/* 오른쪽: 지도 */}
      <div className="relative w-1/2">
        <MapComponent
          coords={coords}
          potholes={potholes}
          showHeatmap={showHeatmap}
        />
      </div>
    </div>
  );
};

export default VideoMapLayout;
