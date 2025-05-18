from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import pytesseract
import re
import threading
import time
import os
import random                # ← 추가
import mysql.connector
import atexit

# ─── MySQL 연결 설정 ───────────────────────────────────────────────────────────
db = mysql.connector.connect(
    host="localhost",
    user="root",      # ← 수정하세요
    password="red79166",  # ← 수정하세요
    database="pothole_db"
)
cursor = db.cursor()

@atexit.register
def close_db():
    cursor.close()
    db.close()
    print("🛑 MySQL 연결 종료됨")

# ─── Flask + YOLO + OCR 설정 ───────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# YOLO 모델 로드
model = YOLO("/media/park/T7/mydatanew/runs/detect/train2/weights/best.pt")

# Tesseract 경로 설정
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
os.environ["QT_QPA_PLATFORM"] = "xcb"

# 공유 변수
latest_frame = None
latest_gps = {"latitude": None, "longitude": None}

# OCR 전처리 함수
def preprocess(gps_box):
    gray = cv2.cvtColor(gps_box, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    resized = cv2.resize(thresh, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    return resized

# 위도/경도 추출 함수
def extract_gps(text):
    match = re.search(r'(\d{2,3}\.\d+)[°]N\s*(\d{3}\.\d+)[°]E', text)
    if match:
        lat, lon = match.groups()
        return float(lat), float(lon)
    return None

# 백그라운드: YOLO 감지 + OCR 스레드
def yolo_ocr_worker():
    global latest_frame, latest_gps
    cap = cv2.VideoCapture(0)
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
            cls_ids = results[0].boxes.cls.tolist()  # [0,1,0,...] 같은 형태
            if cls_ids:
                names = results[0].names               # {0: 'pothole', 1: 'crack', ...}
                description = ", ".join(names[int(i)] for i in cls_ids)
            else:
                description = ""

            # 5) severity 랜덤 지정 (1~3)
            severity = random.randint(1, 3)

            # 6) DB에 INSERT (위도/경도 있을 때만)
            timestamp = int(time.time())
            image_path = f"/tmp/frame_{timestamp}.jpg"
            cv2.imwrite(image_path, annotated)

            insert_query = """
                INSERT INTO myapp_potholedata
                  (latitude, longitude, severity, description, region, image, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                latest_gps["latitude"],
                latest_gps["longitude"],
                severity,
                description,
                "경기도 안산시",  # 필요 시 reverse-geocoding으로 동적 설정
                image_path,
                'reported'
            )
            try:
                cursor.execute(insert_query, values)
                db.commit()
            except mysql.connector.Error as err:
                print(f"❌ DB 삽입 오류: {err}")

        # 프레임레이트 조절
        time.sleep(0.05)

# 스트리밍 엔드포인트
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

# 최신 GPS 반환
@app.route("/gps")
def gps():
    return jsonify(latest_gps)

# 기본 페이지
@app.route("/")
def index():
    return '''
    <html><body>
    <h2>YOLO + OCR 실시간 스트리밍</h2>
    <img src="/video_feed" width="720"><br>
    <a href="/gps" target="_blank">현재 GPS 좌표 보기</a>
    </body></html>
    '''

# 서버 시작
if __name__ == "__main__":
    # 백그라운드 스레드 시작
    thread = threading.Thread(target=yolo_ocr_worker, daemon=True)
    thread.start()
    # Flask 서버 실행
    app.run(host="0.0.0.0", port=5000)
