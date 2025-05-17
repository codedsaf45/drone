import React, { useEffect, useRef } from "react";

export default function MapComponent({ coords, potholes = [], showHeatmap }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);

  // 0~1 값(risk)을 HSL 색상으로 변환하는 헬퍼
  const riskToColor = (risk) => {
    if (risk < 0.2) {
      return "#8BC34A";
    } else if (risk < 0.4) {
      return "#FF9100";
    } else {
      return "#D32F2F";
    }
  };

  useEffect(() => {
    if (!window.google || !mapDivRef.current) return;

    // 1) 지도 초기화 (한 번만)
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: coords || { lat: 37.5665, lng: 126.978 },
        zoom: 11,
        mapTypeId: "roadmap",
      });
    }
    const map = mapRef.current;

    // ✅ coords 변경 시 중심 이동
    if (coords) {
      map.setCenter(coords);
    }

    // 2) Data Layer 초기화 후 GeoJSON 로드
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (showHeatmap) {
      map.data.forEach((f) => map.data.remove(f));
      map.data.loadGeoJson(
        "http://127.0.0.1:8000/api/potholes/roads",
        null,
        (features) => {
          console.log("로드된 도로 피처 수:", features.length);
        }
      );

      // 3) 심각도(risk)에 따라 동적 스타일링
      map.data.setStyle((feature) => {
        const risk = feature.getProperty("risk") ?? 0;
        return {
          strokeColor: riskToColor(risk),
          strokeWeight: 2,
          zIndex: Math.round(risk * 100),
        };
      });
    } else {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 5) 포트홀 마커 추가
      potholes.forEach((p) => {
        const marker = new window.google.maps.Marker({
          position: { lat: p.latitude, lng: p.longitude },
          map,
          title: `${p.description} (Severity: ${p.severity})`,
          icon: {
            url: "/icon.png",
            scaledSize: new window.google.maps.Size(32, 32),
          },
        });
        map.data.forEach((f) => map.data.remove(f)); // ✅ GeoJSON 도로 제거

        // 클릭 시 InfoWindow 표시
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><strong>${p.description}</strong><br/>위치: ${p.latitude}, ${p.longitude}<br/>심각도: ${p.severity}</div>
        <img src=${p.image} alt="/icon.png" style="margin-top:8px; width: 100%; border-radius: 6px;" />`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));
        markersRef.current.push(marker);
      });
    }

    // 6) 포트홀 히트맵 (원하면 주석 해제)
    // if (potholes.length) {
    //   const heatData = potholes.map((p) => ({
    //     location: new window.google.maps.LatLng(p.latitude, p.longitude),
    //     weight:   p.severity,
    //   }));
    //   heatmapRef.current?.setMap(null);
    //   heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
    //     data:    heatData,
    //     map,
    //     radius:  28,
    //     opacity: 0.5,
    //   });
    // }
  }, [coords, potholes, showHeatmap]);

  return (
    <div
      ref={mapDivRef}
      style={{ width: "100%", height: "100%" }}
      className="absolute inset-0"
    />
  );
}
