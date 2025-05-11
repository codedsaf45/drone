import mysql.connector
import readsrv as srv                   # GPS 데이터가 담긴 DataFrame (컬럼: [timestamp, lat, lng])
import geopandas as gpd
from shapely.geometry import Point

# ── 1) MySQL 연결 설정 ───────────────────────────────
conn = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="red79166",
    database="demo"
)
cursor = conn.cursor()

# ── 2) 행정구역 GeoJSON 로드 ──────────────────────────
geojson_path = "/media/park/33DF49D6718AD56F/skorea-provinces-2018-geo.json"
gdf = gpd.read_file(geojson_path)

# ── 3) GPS 데이터 순회 & DB 저장 ───────────────────────
#    srv.df 의 칼럼 순서가 [time, latitude, longitude]라면 .iloc[:,1], .iloc[:,2] 사용
for _, gps_row in srv.df.iterrows():
    latitude  = float(gps_row.iloc[1])
    longitude = float(gps_row.iloc[2])

    # 3-1) 지역구(geojson) 매칭
    pt = Point(longitude, latitude)
    match = gdf[gdf.geometry.contains(pt)]
    region = match.iloc[0]["name_eng"] if not match.empty else None

    # 3-2) MySQL INSERT
    insert_sql = """
      INSERT INTO location_data (latitude, longitude, region, )
      VALUES (%s, %s, %s)
    """
    cursor.execute(insert_sql, (latitude, longitude, region))

# ── 4) 커밋 및 종료 ────────────────────────────────────
conn.commit()
cursor.close()
conn.close()
