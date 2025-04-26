// src/components/VideoMapLayout.jsx
import React, { useState, useEffect } from "react";
import MapComponent from "/home/park/map/src/components/MapComponent.js";

const VideoMapLayout = ({ videoSrc }) => {
  const [coords, setCoords] = useState(null);

  // 예시: 초기 좌표 설정
  useEffect(() => {
    setCoords({ lat: 37.29803324573562, lng: 126.83879424585795 });
  }, []);

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 비디오 영역 */}
      <div className="w-1/2 bg-black">
        <video
          src={videoSrc}
          controls
          autoPlay
          muted
          className="object-cover w-full h-full"
        />
      </div>

      {/* 오른쪽: 지도 영역 */}
      <div className="relative w-1/2">
        <MapComponent coords={coords} />
      </div>
    </div>
  );
};

export default VideoMapLayout;
