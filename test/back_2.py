



# back.py
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import geopandas as gpd
from shapely.geometry import Point
import json

app = Flask(__name__)
CORS(app)

# ---------------------- 1) 데이터 준비 -----------------------
# (1) 포트홀 – 하드코딩 그대로 사용
with open("potholes_100.json", "r", encoding="utf-8") as f:
    extra_potholes = json.load(f)
EXAMPLE_POTHOLES = extra_potholes
# [
#     {"id":  1, "latitude": 37.325120, "longitude": 126.823450, "severity": 5,
#      "description": "안산역 앞 대형 포트홀",       "reported_by": 1,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-02T09:15:00", "updated_at": "2025-05-02T09:15:00"},
#     {"id":  2, "latitude": 37.328540, "longitude": 126.829150, "severity": 4,
#      "description": "고잔동 교차로 균열",         "reported_by": 2,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T14:30:00", "updated_at": "2025-05-01T14:30:00"},
#     {"id":  3, "latitude": 37.343210, "longitude": 126.821900, "severity": 2,
#      "description": "중앙동 인도 가장자리 균열",   "reported_by": None,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T09:05:00", "updated_at": "2025-05-01T09:05:00"},
#     {"id":  4, "latitude": 37.333800, "longitude": 126.830200, "severity": 3,
#      "description": "선부동 버스정류장 앞 함몰",   "reported_by": 3,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T11:20:00", "updated_at": "2025-05-01T11:20:00"},
#     {"id":  5, "latitude": 37.350000, "longitude": 126.822000, "severity": 1,
#      "description": "와동 이면도로 미세 균열",     "reported_by": 4,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-02T08:45:00", "updated_at": "2025-05-02T08:45:00"},
#     {"id":  6, "latitude": 37.336700, "longitude": 126.826500, "severity": 5,
#      "description": "본오동 교차로 심각한 함몰",   "reported_by": 5,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T17:10:00", "updated_at": "2025-05-01T17:10:00"},
#     {"id":  7, "latitude": 37.322500, "longitude": 126.820300, "severity": 2,
#      "description": "초지동 주차장 진입로 균열",   "reported_by": None,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T12:00:00", "updated_at": "2025-05-01T12:00:00"},
#     {"id":  8, "latitude": 37.331200, "longitude": 126.835700, "severity": 4,
#      "description": "사동 차선 중앙 함몰",        "reported_by": 2,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-02T15:30:00", "updated_at": "2025-05-02T15:30:00"},
#     {"id":  9, "latitude": 37.338900, "longitude": 126.828400, "severity": 3,
#      "description": "신길동 해안도로 균열",        "reported_by": 1,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T09:15:00", "updated_at": "2025-05-01T09:15:00"},
#     {"id": 10, "latitude": 37.329457, "longitude": 126.839249, "severity": 1,
#      "description": "사이동 한적한 길 균열",       "reported_by": 3,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T13:50:00", "updated_at": "2025-05-01T13:50:00"},
#     {"id": 11, "latitude": 37.345000, "longitude": 126.842333, "severity": 5,
#      "description": "초지동 광교교차로 함몰",       "reported_by": 4,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T18:00:00", "updated_at": "2025-05-01T18:00:00"},
#     {"id": 12, "latitude": 37.339412, "longitude": 126.823548, "severity": 2,
#      "description": "사동 시청 앞 작은 균열",       "reported_by": None,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T10:25:00", "updated_at": "2025-05-01T10:25:00"},
#     {"id": 13, "latitude": 37.342277, "longitude": 126.845278, "severity": 4,
#      "description": "원시동 대형 함몰",           "reported_by": 2,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T16:40:00", "updated_at": "2025-05-01T16:40:00"},
#     {"id": 14, "latitude": 37.341944, "longitude": 126.829722, "severity": 3,
#      "description": "호수동 버스터미널 앞 균열",    "reported_by": 1,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T11:05:00", "updated_at": "2025-05-01T11:05:00"},
#     {"id": 15, "latitude": 37.357691, "longitude": 126.839383, "severity": 2,
#      "description": "팔곡동 이면도로 균열",        "reported_by": 3,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T09:55:00", "updated_at": "2025-05-01T09:55:00"},
#     {"id": 16, "latitude": 37.326011, "longitude": 126.828302, "severity": 5,
#      "description": "초지동 진입로 심각한 함몰",    "reported_by": 4,
#      "region": "경기도 안산시 상록구", "reported_at": "2025-05-01T14:20:00", "updated_at": "2025-05-01T14:20:00"},
#     {"id": 17, "latitude": 37.337377, "longitude": 126.836398, "severity": 3,
#      "description": "해안동 길가 균열",          "reported_by": None,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T12:30:00", "updated_at": "2025-05-01T12:30:00"},
#     {"id": 18, "latitude": 37.331000, "longitude": 126.847000, "severity": 4,
#      "description": "원곡동 도로 함몰",          "reported_by": 2,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T08:10:00", "updated_at": "2025-05-01T08:10:00"},
#     {"id": 19, "latitude": 37.332483, "longitude": 126.832500, "severity": 1,
#      "description": "반월동 작은 균열",          "reported_by": 1,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-02T17:45:00", "updated_at": "2025-05-02T17:45:00"},
#     {"id": 20, "latitude": 37.330000, "longitude": 126.823000, "severity": 2,
#      "description": "호수동 이면도로 균열",        "reported_by": 3,
#      "region": "경기도 안산시 단원구", "reported_at": "2025-05-01T13:15:00", "updated_at": "2025-05-01T13:15:00"},
#     {
#         "id": 21,
#         "latitude": 37.329000,
#         "longitude": 126.825000,
#         "severity": 2,
#         "description": "선부동 대로변 작은 균열",
#         "reported_by": 2,
#         "region": "경기도 안산시 상록구",
#         "reported_at": "2025-05-02T16:10:00",
#         "updated_at":  "2025-05-02T16:10:00"
#     },
#     {
#         "id": 22,
#         "latitude": 37.335500,
#         "longitude": 126.829800,
#         "severity": 4,
#         "description": "와동 삼거리 함몰",
#         "reported_by": 5,
#         "region": "경기도 안산시 상록구",
#         "reported_at": "2025-05-02T17:45:00",
#         "updated_at":  "2025-05-02T17:45:00"
#     },
#     {
#         "id": 23,
#         "latitude": 37.331800,
#         "longitude": 126.822300,
#         "severity": 3,
#         "description": "고잔동 인도 경계 균열",
#         "reported_by": None,
#         "region": "경기도 안산시 단원구",
#         "reported_at": "2025-05-02T14:05:00",
#         "updated_at":  "2025-05-02T14:05:00"
#     },
#     {
#         "id": 24,
#         "latitude": 37.342000,
#         "longitude": 126.835000,
#         "severity": 5,
#         "description": "초지동 버스 정류장 심각 함몰",
#         "reported_by": 3,
#         "region": "경기도 안산시 상록구",
#         "reported_at": "2025-05-02T18:30:00",
#         "updated_at":  "2025-05-02T18:30:00"
#     },
#     {
#         "id": 25,
#         "latitude": 37.328200,
#         "longitude": 126.832100,
#         "severity": 1,
#         "description": "원곡동 이면도로 미세 균열",
#         "reported_by": 1,
#         "region": "경기도 안산시 단원구",
#         "reported_at": "2025-05-02T15:20:00",
#         "updated_at":  "2025-05-02T15:20:00"
#     },
# ]

# (2) 도로 중심선 GeoJSON (경로는 편집하세요)
ROADS_GEOJSON_PATH = "ansan_roads_centerline.geojson"

# GeoPandas 로드(경위도 → 한국 TM 좌표 EPSG:5186 로 변환: 단위=미터)
roads_gdf = gpd.read_file(ROADS_GEOJSON_PATH).to_crs(5186)

# -------------------- 2) 위험도 계산 함수 --------------------
def compute_road_risk():
    # 2‑1) 포트홀 GeoDataFrame
    pothole_points = [
        Point(p["longitude"], p["latitude"]) for p in EXAMPLE_POTHOLES
    ]
    potholes_gdf = gpd.GeoDataFrame(EXAMPLE_POTHOLES,
                                    geometry=pothole_points,
                                    crs=4326).to_crs(5186)

    # 2‑2) 포트홀 ↔ 도로 최근접 조인 (20 m 이내)
    joined = gpd.sjoin_nearest(
        potholes_gdf, roads_gdf,
        how="inner",
        distance_col="dist",
        max_distance=40         # ← 임계거리(m) 조정 가능
    )

    # 2‑3) 도로별 포트홀 개수 집계 → 위험도 0~1 정규화
    counts = joined.groupby("index_right").size()
    max_cnt = 4
    # counts.max() if not counts.empty else 1
    print(max_cnt)
    roads_gdf["risk"] = counts.reindex(roads_gdf.index, fill_value=0) / max_cnt

    return roads_gdf.to_crs(4326)   # 다시 WGS84 로 돌려 프런트 전달

# 최초 서버 기동 시 한 번 수행
roads_with_risk = compute_road_risk()

# ---------------------- 3) API 엔드포인트 --------------------
@app.route("/potholes", methods=["GET"])
def list_potholes():
    return jsonify(EXAMPLE_POTHOLES), 200

@app.route("/potholes/today", methods=["GET"])
def list_today_potholes():
    today = datetime.now().strftime("%Y-%m-%d")
    today_pots = [p for p in EXAMPLE_POTHOLES if p["reported_at"].startswith(today)]
    return jsonify({"count": len(today_pots)}), 200

@app.route("/roads", methods=["GET"])
def list_roads():
    # GeoDataFrame ➜ 파이썬 dict ➜ JSON
    geojson_dict = json.loads(roads_with_risk.to_json())
    return jsonify(geojson_dict), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
    # print(compute_road_risk())
