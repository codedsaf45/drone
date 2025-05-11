import random
import json

# 기존 포트홀 리스트 (EXAMPLE_POTHOLES)의 일부만 예시로 포함하고, 실제 파일 작업 시 전체를 불러오세요.
# 여기서는 26~125번까지 100개 항목을 생성합니다.
new_entries = []
for i in range(1,200):
    entry = {
        "id": i,
        "latitude": round(random.uniform(37.32, 37.36), 6),
        "longitude": round(random.uniform(126.82, 126.85), 6),
        "severity": random.randint(1, 5),
        "description": f"랜덤 포트홀 {i}",
        "reported_by": random.choice([None, 1, 2, 3, 4, 5]),
        "region": random.choice([
            "경기도 안산시 단원구", 
            "경기도 안산시 상록구"
        ]),
        "reported_at": "2025-05-02T12:00:00",
        "updated_at":  "2025-05-02T12:00:00"
    }
    new_entries.append(entry)

# JSON 파일로 저장
output_path = "potholes_100.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(new_entries, f, ensure_ascii=False, indent=2)

print(f"생성된 {i}개의 포트홀 데이터가 {output_path} 에 저장되었습니다.")
