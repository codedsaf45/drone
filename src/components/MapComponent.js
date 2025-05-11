import React, { useEffect, useRef } from "react";

export default function RoadRiskMap({ coords, potholes = [] }) {
  const mapDivRef    = useRef(null);
  const mapRef       = useRef(null);
  const heatmapRef   = useRef(null);
  const markersRef   = useRef([]);

  // 0~1 값(risk)을 HSL 색상으로 변환하는 헬퍼
  const riskToColor = (risk) => {
    if (risk < 0.2) {
      return 'green';
    } else if (risk < 0.4) {
      return 'yellow';
    } else {
      return 'red';
    }
  };

  useEffect(() => {
    if (!window.google || !mapDivRef.current) return;

    // 1) 지도 초기화 (한 번만)
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: coords || { lat: 37.5665, lng: 126.9780 },
        zoom: 11,
        mapTypeId: "roadmap",
      });
    }
    const map = mapRef.current;

    // 2) Data Layer 초기화 후 GeoJSON 로드
    map.data.forEach((f) => map.data.remove(f));
    map.data.loadGeoJson("http://localhost:3000/roads", null, (features) => {
      console.log("로드된 도로 피처 수:", features.length);
    });

    // 3) 심각도(risk)에 따라 동적 스타일링
    map.data.setStyle((feature) => {
      const risk = feature.getProperty("risk") ?? 0;
      return {
        strokeColor: riskToColor(risk),
        strokeWeight: 2,
        zIndex: Math.round(risk * 100),
      };
    });

    // 4) 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 5) 포트홀 마커 추가
    potholes.forEach((p) => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.latitude, lng: p.longitude },
        map,
        title: `${p.description} (Severity: ${p.severity})`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: riskToColor(p.severity / 5),
          fillOpacity: 0.8,
          strokeColor: '#000',
          strokeWeight: 1,
        },
      });
      // 클릭 시 InfoWindow 표시
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${p.description}</strong><br/>위치: ${p.latitude}, ${p.longitude}<br/>심각도: ${p.severity}</div>`,
      });
      marker.addListener('click', () => infoWindow.open(map, marker));
      markersRef.current.push(marker);
    });

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
  }, [coords, potholes]);

  return (
    <div
      ref={mapDivRef}
      style={{ width: "100%", height: "100%" }}
      className="absolute inset-0"
    />
  );
}
