import React, { useEffect, useRef } from "react";

export default function MapComponent({ coords, onCoordsChange,potholes = [], showHeatmap }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);
  const heatmapTimer = useRef(null); // 🔁 타이머 저장

  const riskToColor = (risk) => {
    if (risk < 0.2) return "#8BC34A";
    if (risk < 0.4) return "#FF9100";
    return "#D32F2F";
  };

  const loadRoadGeoJson = () => {
    const map = mapRef.current;
    if (!map) return;

    map.data.forEach((f) => map.data.remove(f));
    map.data.loadGeoJson("http://127.0.0.1:8000/api/potholes/roads", null, (features) => {
      console.log("✅ 도로 피처 갱신:", features.length);
    });

    map.data.setStyle((feature) => {
      const risk = feature.getProperty("risk") ?? 0;
      return {
        strokeColor: riskToColor(risk),
        strokeWeight: 2,
        zIndex: Math.round(risk * 100),
      };
    });
  };

  useEffect(() => {
    if (!window.google || !mapDivRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: coords || { lat: 37.5665, lng: 126.978 },
        zoom: 11,
        mapTypeId: "roadmap",
      });
    }

    const map = mapRef.current;
    if (coords) {
      map.setCenter(coords);
      setTimeout(() => {
        onCoordsChange(null);
      }, 100); // 100ms 후 null로

    }

    // === 히트맵 모드 ===
    if (showHeatmap) {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      loadRoadGeoJson(); // 최초 호출
      if (heatmapTimer.current) clearInterval(heatmapTimer.current);
      heatmapTimer.current = setInterval(loadRoadGeoJson, 5000);
    }

    // === 마커 모드 ===
    else {
      if (heatmapTimer.current) {
        clearInterval(heatmapTimer.current);
        heatmapTimer.current = null;
      }

      map.data.forEach((f) => map.data.remove(f));
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

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

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><strong>${p.description}</strong><br/>위치: ${p.latitude}, ${p.longitude}<br/>심각도: ${p.severity}</div>
          <img src=${p.image} alt="icon" style="margin-top:8px; width: 100%; border-radius: 6px;" />`,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
        markersRef.current.push(marker);
      });
    }
  }, [coords, potholes, showHeatmap]);

  useEffect(() => {
    return () => {
      if (heatmapTimer.current) clearInterval(heatmapTimer.current);
    };
  }, []);

  return (
    <div
      ref={mapDivRef}
      style={{ width: "100%", height: "100%" }}
      className="absolute inset-0"
    />
  );
}
