import random
import json

new_entries = []
current_id = 26
# 100개를 생성하기 위한 목표 개수
target_count = 100

while len(new_entries) < target_count:
    # 한 클러스터당 들어갈 항목 수를 3~4개로 랜덤 선택
    cluster_size = random.randint(3, 4)
    # 클러스터의 중심 위경도 한 번만 생성
    lat = round(random.uniform(37.32, 37.36), 6)
    lon = round(random.uniform(126.82, 126.85), 6)
    for _ in range(cluster_size):
        if len(new_entries) >= target_count:
            break
        entry = {
            "id": current_id,
            "latitude": lat,
            "longitude": lon,
            "severity": random.randint(1, 5),
            "description": f"랜덤 포트홀 {current_id}",
            "reported_by": random.choice([None, 1, 2, 3, 4, 5]),
            "region": random.choice([
                "경기도 안산시 단원구",
                "경기도 안산시 상록구"
            ]),
            "reported_at": "2025-05-02T12:00:00",
            "updated_at":  "2025-05-02T12:00:00"
        }
        new_entries.append(entry)
        current_id += 1

# JSON 파일로 저장
output_path = "potholes_100.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(new_entries, f, ensure_ascii=False, indent=2)

print(f"생성된 {len(new_entries)}개의 포트홀 데이터가 {output_path} 에 저장되었습니다.")
