import React, { useEffect, useRef } from "react";

const MapComponent = ({ coords }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // 초기 지도 옵션: coords가 없으면 기본 좌표를 사용합니다.
    const defaultCenter = { lat: 37.29803324573562, lng: 126.83879424585795 };
    const mapOptions = {
      center: coords ? { lat: coords.lat, lng: coords.lng } : defaultCenter,
      zoom: 11,
    };

    // Google Map 인스턴스 생성
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstance.current = map;
    
    // 기본 마커 예시
    const positions = [
      {
        title: "처리중",
        latlng: { lat: 37.498095, lng: 127.02761 },
      },
      {
        title: "미완료",
        latlng: { lat: 37.493923, lng: 127.014656 },
      },
    ];

    positions.forEach((position) => {
      new window.google.maps.Marker({
        map,
        position: position.latlng,
        title: position.title,
      });
    });

    // 백엔드에서 포트홀 데이터를 가져와 마커 생성
    fetch("http://localhost:3000/potholes")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((pothole) => {
          const marker = new window.google.maps.Marker({
            map,
            position: { lat: pothole.latitude, lng: pothole.longitude },
            title: pothole.location,
          });

          const infowindow = new window.google.maps.InfoWindow({
            content: `<div style="padding:5px;">위치: ${pothole.location}<br>상태: ${pothole.status}</div>`,
          });

          marker.addListener("click", () => {
            infowindow.open(map, marker);
          });
        });
      })
      .catch((error) => console.error("포트홀 정보 가져오기 실패:", error));
  }, []);

  // coords가 변경되면 지도 중심 업데이트
  useEffect(() => {
    if (coords && mapInstance.current) {
      mapInstance.current.setCenter({ lat: coords.lat, lng: coords.lng });
    }
  }, [coords]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      className="absolute inset-0"
    />
  );
};

export default MapComponent;
