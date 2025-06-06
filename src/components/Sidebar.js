import React, { useRef, useState, useEffect } from "react";

const regions = {
  서울특별시: [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ],
  부산광역시: [
    "강서구",
    "금정구",
    "기장군",
    "남구",
    "동구",
    "동래구",
    "부산진구",
    "북구",
    "사상구",
    "사하구",
    "서구",
    "수영구",
    "연제구",
    "영도구",
    "중구",
    "해운대구",
  ],
  대구광역시: [
    "남구",
    "달서구",
    "달성군",
    "동구",
    "북구",
    "서구",
    "수성구",
    "중구",
  ],
  인천광역시: [
    "강화군",
    "계양구",
    "미추홀구",
    "남동구",
    "동구",
    "부평구",
    "서구",
    "연수구",
    "중구",
  ],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산광역시: ["남구", "동구", "북구", "울주군", "중구"],
  세종특별자치시: ["세종특별자치시"],
  경기도: [
    "가평군",
    "고양시",
    "과천시",
    "광명시",
    "광주시",
    "구리시",
    "군포시",
    "김포시",
    "남양주시",
    "동두천시",
    "부천시",
    "성남시",
    "수원시",
    "시흥시",
    "안산시",
    "안성시",
    "안양시",
    "양주시",
    "양평군",
    "여주시",
    "연천군",
    "오산시",
    "용인시",
    "의왕시",
    "의정부시",
    "이천시",
    "파주시",
    "평택시",
    "포천시",
    "하남시",
    "화성시",
  ],
  강원도: [
    "강릉시",
    "고성군",
    "동해시",
    "삼척시",
    "속초시",
    "양구군",
    "양양군",
    "영월군",
    "원주시",
    "인제군",
    "정선군",
    "철원군",
    "춘천시",
    "태백시",
    "평창군",
    "홍천군",
    "화천군",
    "횡성군",
  ],
  충청북도: [
    "괴산군",
    "단양군",
    "보은군",
    "영동군",
    "옥천군",
    "음성군",
    "제천시",
    "증평군",
    "진천군",
    "청주시",
    "충주시",
  ],
  충청남도: [
    "계룡시",
    "공주시",
    "금산군",
    "논산시",
    "당진시",
    "보령시",
    "부여군",
    "서산시",
    "서천군",
    "아산시",
    "연기군",
    "예산군",
    "천안시",
    "청양군",
    "태안군",
    "홍성군",
  ],
  전라북도: [
    "고창군",
    "군산시",
    "김제시",
    "남원시",
    "무주군",
    "부안군",
    "순창군",
    "완주군",
    "익산시",
    "임실군",
    "장수군",
    "전주시",
    "정읍시",
    "진안군",
  ],
  전라남도: [
    "강진군",
    "고흥군",
    "곡성군",
    "광양시",
    "구례군",
    "나주시",
    "담양군",
    "목포시",
    "무안군",
    "보성군",
    "순천시",
    "신안군",
    "여수시",
    "영광군",
    "영암군",
    "완도군",
    "장성군",
    "장흥군",
    "진도군",
    "함평군",
    "해남군",
    "화순군",
  ],
  경상북도: [
    "경산시",
    "경주시",
    "고령군",
    "구미시",
    "군위군",
    "김천시",
    "문경시",
    "봉화군",
    "상주시",
    "성주군",
    "안동시",
    "영덕군",
    "영양군",
    "영주시",
    "영천시",
    "예천군",
    "울릉군",
    "울진군",
    "의성군",
    "청도군",
    "청송군",
    "칠곡군",
    "포항시",
  ],
  경상남도: [
    "거제시",
    "거창군",
    "고성군",
    "김해시",
    "남해군",
    "밀양시",
    "사천시",
    "산청군",
    "양산시",
    "의령군",
    "진주시",
    "창녕군",
    "창원시",
    "통영시",
    "하동군",
    "함안군",
    "함양군",
    "합천군",
  ],
  제주특별자치도: ["서귀포시", "제주시"],
};
const Sidebar = ({ onCoordsChange, onRegionChange, potholes }) => {
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedGungu, setSelectedGungu] = useState("");
  const [gunguOptions, setGunguOptions] = useState([]);
  const [error, setError] = useState("");

  // 시/도 선택 시 해당 군/구 옵션 업데이트
  useEffect(() => {
    if (selectedSido) {
      const options = regions[selectedSido];
      setGunguOptions(options);
      // 기본으로 첫 번째 값 선택
      setSelectedGungu(options[0] || "");
    } else {
      setGunguOptions([]);
      setSelectedGungu("");
    }
  }, [selectedSido]);

  const handleSidoChange = (e) => {
    setSelectedSido(e.target.value);
    console.log(`선택된 시/도: ${e.target.value}`);
  };

  const handleGunguChange = (e) => {
    setSelectedGungu(e.target.value);
    console.log(`선택된 군/구: ${e.target.value}`);
  };

  const handleSearch = () => {
    console.log("검색 버튼 클릭", selectedSido, selectedGungu);
    const address = `${selectedSido} ${selectedGungu}`;
    if (!address.trim()) {
      setError("주소가 올바르지 않습니다.");
      return;
    }
    setError("");
    onRegionChange(address);
    console.log("전달되는 주소:", address);

    if (!window.google) {
      setError("Google Maps API가 로드되지 않았습니다.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        onCoordsChange({ lat, lng });
        console.log("위도:", lat, "경도:", lng);
      } else {
        setError("주소 변환에 실패했습니다.");
        console.error("주소 변환 실패", status);
      }
    });
  };
  const sortedPotholes = Array.isArray(potholes)
    ? [...potholes].sort((a, b) => b.severity - a.severity)
    : [];

  return (
    <aside className="h-screen p-6 overflow-y-auto bg-white rounded-lg shadow-lg w-72">
      <h2 className="mb-5 text-2xl font-semibold text-gray-800">지역 선택</h2>
      <div className="space-y-4">
        {/* 시/도 select */}
        <div>
          <label
            htmlFor="sido"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            시/도 선택
          </label>
          <select
            id="sido"
            value={selectedSido}
            onChange={(e) => setSelectedSido(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              -- 지역 선택 --
            </option>
            {Object.keys(regions).map((sido) => (
              <option key={sido} value={sido}>
                {sido}
              </option>
            ))}
          </select>
        </div>

        {/* 군/구 select */}
        <div>
          <label
            htmlFor="gungu"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            군/구 선택
          </label>
          <select
            id="gungu"
            value={selectedGungu}
            onChange={(e) => setSelectedGungu(e.target.value)}
            disabled={!gunguOptions.length}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              -- 세부 지역 --
            </option>
            {gunguOptions.map((gungu) => (
              <option key={gungu} value={gungu}>
                {gungu}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="w-full py-2 mt-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        검색하기
      </button>

      <div className="pt-4 mt-6 overflow-y-auto border-t">
        <h3 className="mb-2 text-base font-medium tracking-tight text-gray-700">
          포트홀 목록
        </h3>
        {sortedPotholes.length > 0 ? (
          <ul className="space-y-3">
            {sortedPotholes.map((hole, index) => (
              <li
                key={index}
                className="p-4 transition border rounded-lg shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{hole.description}</h4>
                    <p className="text-sm text-gray-500">
                      {hole.latitude}, {hole.longitude}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded 
                        ${
                          hole.severity >= 4
                            ? "bg-red-100 text-red-600"
                            : hole.severity === 3
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                  >
                    심각도 {hole.severity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-gray-500">
            포트홀 데이터가 없습니다.
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
