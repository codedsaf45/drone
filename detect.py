from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import pytesseract
import re
import threading
import time
import os
import random
import sqlite3
import atexit

# ─── SQLite 연결 및 테이블 생성 ───────────────────────────────────────────────
DB_PATH = "/home/rlaalswns/drone/back/db.sqlite3"
db = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = db.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS myapp_potholedata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL,
    longitude REAL,
    severity INTEGER DEFAULT 3,
    description TEXT,
    region TEXT,
    image TEXT,
    status TEXT DEFAULT 'REPORTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
db.commit()

@atexit.register
def close_db():
    cursor.close()
    db.close()
    print("🛑 SQLite 연결 종료됨")

# ─── Flask + YOLO + OCR 설정 ───────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

model = YOLO("best.pt")
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
os.environ["QT_QPA_PLATFORM"] = "xcb"

latest_frame = None
latest_gps = {"latitude": None, "longitude": None}

def preprocess(gps_box):
    gray = cv2.cvtColor(gps_box, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    resized = cv2.resize(thresh, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    return resized

def extract_gps(text):
    match = re.search(r'(\d{2,3}\.\d+)[°]N\s*(\d{3}\.\d+)[°]E', text)
    if match:
        lat, lon = match.groups()
        return float(lat), float(lon)
    return None

def is_duplicate(latitude, longitude, threshold=0.0001):
    cursor.execute("""
        SELECT COUNT(*) FROM myapp_potholedata
        WHERE ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?
    """, (latitude, threshold, longitude, threshold))
    return cursor.fetchone()[0] > 0

def yolo_ocr_worker():
    global latest_frame, latest_gps
    cap = cv2.VideoCapture(1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # 1) YOLO 탐지 및 프레임 어노테이션
        results = model(frame, verbose=False)
        annotated = results[0].plot()
        latest_frame = annotated

        # 2) OCR: GPS 박스 영역 잘라서 전처리 → 문자열 추출
        gps_box = frame[255:290, 100:445]
        processed = preprocess(gps_box)
        config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789.NE°'
        text = pytesseract.image_to_string(processed, config=config).strip()

        # 3) 추출된 문자열에서 위도/경도 파싱
        gps = extract_gps(text)
        if gps:
            latest_gps["latitude"], latest_gps["longitude"] = gps

            # 4) 감지된 클래스명 추출
            cls_ids = results[0].boxes.cls.tolist() if hasattr(results[0], 'boxes') and results[0].boxes is not None else []
            if cls_ids:
                names = model.names
                description = ", ".join(names[int(i)] for i in cls_ids)
            else:
                description = ""

            severity = random.randint(1, 3)
            timestamp = int(time.time())
            image_path = f"/home/rlaalswns/Pictures/detectedimg/frame_{timestamp}.jpg"
            cv2.imwrite(image_path, annotated)

            # 중복 방지! (위치 비슷하면 패스)
            if not is_duplicate(latest_gps["latitude"], latest_gps["longitude"]):
                insert_query = """
                    INSERT INTO myapp_potholedata
                      (latitude, longitude, severity, description, region, image, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """
                values = (
                    latest_gps["latitude"],
                    latest_gps["longitude"],
                    severity,
                    description,
                    "경기도 안산시",
                    image_path,
                    'REPORTED'
                )
                try:
                    cursor.execute(insert_query, values)
                    db.commit()
                    print(f"DB 저장 성공: {latest_gps['latitude']}, {latest_gps['longitude']}")
                except Exception as err:
                    print(f"❌ DB 삽입 오류: {err}")
            else:
                print(f"🚫 중복 포트홀: {latest_gps['latitude']}, {latest_gps['longitude']} 저장 생략")

        time.sleep(0.05)

@app.route("/video_feed")
def video_feed():
    def generate():
        while True:
            if latest_frame is not None:
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
                _, buffer = cv2.imencode('.jpg', latest_frame, encode_param)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' +
                       buffer.tobytes() + b'\r\n')
            time.sleep(0.05)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/gps")
def gps():
    return jsonify(latest_gps)

@app.route("/")
def index():
    return '''
    <html><body>
    <h2>YOLO + OCR 실시간 스트리밍</h2>
    <img src="/video_feed" width="720"><br>
    <a href="/gps" target="_blank">현재 GPS 좌표 보기</a>
    </body></html>
    '''

if __name__ == "__main__":
    thread = threading.Thread(target=yolo_ocr_worker, daemon=True)
    thread.start()
    app.run(host="0.0.0.0", port=5000)
