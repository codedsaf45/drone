# pothole/utils.py
import geopandas as gpd
from shapely.geometry import Point
from .models import PotholeData
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ROADS_PATH = os.path.join(BASE_DIR, "data", "ansan_roads_centerline.geojson")
# print(ROADS_PATH)

def compute_road_risk():
    # 1. 도로 GeoJSON 로드
    roads_gdf = gpd.read_file(ROADS_PATH).to_crs(5186)

    # 2. DB에서 포트홀 정보 가져오기
    pothole_qs = PotholeData.objects.all().values("latitude", "longitude", "severity", "description")
    pothole_list = list(pothole_qs)

    if not pothole_list:
        roads_gdf["risk"] = 0
        return roads_gdf.to_crs(4326).to_json()

    # 3. GeoDataFrame 생성
    points = [Point(p["longitude"], p["latitude"]) for p in pothole_list]
    potholes_gdf = gpd.GeoDataFrame(pothole_list, geometry=points, crs=4326).to_crs(5186)

    # 4. 최근접 조인
    joined = gpd.sjoin_nearest(
        potholes_gdf, roads_gdf,
        how="inner",
        distance_col="dist",
        max_distance=40  # 조정 가능
    )

    # 5. 위험도 계산
    counts = joined.groupby("index_right").size()
    max_cnt = 4  # or counts.max()
    roads_gdf["risk"] = counts.reindex(roads_gdf.index, fill_value=0) / max_cnt

    # 6. GeoJSON으로 변환
    return roads_gdf.to_crs(4326).to_json()
