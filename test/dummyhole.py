from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # 모든 도메인에 대해 CORS 허용

def generate_random_potholes(n):
    potholes = []
    for i in range(1, n + 1):
        pothole = {
            "id": i,
            # 서울 지역 대략적 범위: 위도 37.0 ~ 38.0, 경도 126.0 ~ 127.5
            "latitude": round(random.uniform(37.0, 38.0), 6),
            "longitude": round(random.uniform(126.0, 127.5), 6),
            "location": random.choice(["처리중", "미완료"]),
            "status": random.choice(["처리중", "미완료"])
        }
        potholes.append(pothole)
    return potholes

# 100개의 랜덤 포트홀 데이터 생성
potholes = generate_random_potholes(100)

@app.route("/potholes", methods=["GET"])
def get_potholes():
    return jsonify(potholes)

if __name__ == "__main__":
    app.run(port=3000, debug=True)
