import cv2
import math
from ultralytics import YOLO

# 1) 심각도 계산 함수
def classify_severity(confidence: float, box_area: float, frame_area: float) -> int:
    """
    confidence   : 0.0 ~ 1.0
    box_area     : (width * height) in pixels
    frame_area   : 전체 프레임 면적
    return       : 1 ~ 5 정수 severity
    """
    # ── 1) confidence → 1~5 스코어
    conf_score = min(max(math.ceil(confidence * 5), 1), 5)

    # ── 2) 박스 크기 비율 → 1~5 스코어
    ratio = box_area / frame_area
    if ratio > 0.05:          size_score = 5
    elif ratio > 0.02:        size_score = 4
    elif ratio > 0.01:        size_score = 3
    elif ratio > 0.005:       size_score = 2
    else:                     size_score = 1

    # ── 3) 가중치 조합 (예: 동등 가중치)
    combined = 0.5 * conf_score + 0.5 * size_score
    # round 후 1~5로 클램프
    severity = int(min(max(round(combined), 1), 5))
    return severity

# 2) 모델 로드 & 카메라/비디오 열기
model = YOLO("best.pt")        # 혹은 your_model_path
cap   = cv2.VideoCapture(0)    # 0 대신 비디오 파일 경로 가능

# 3) 메인 루프
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_h, frame_w = frame.shape[:2]
    frame_area = frame_w * frame_h

    # 4) YOLO 추론
    results = model(frame)

    # 5) 박스별로 severity 계산 & 화면에 표시
    for result in results:
        for box in result.boxes:
            # 좌표 꺼내기
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            width  = x2 - x1
            height = y2 - y1
            area   = width * height

            # 신뢰도
            conf = float(box.conf[0])

            # 심각도 계산
            sev = classify_severity(conf, area, frame_area)

            # 화면에 박스 & severity 표시
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0,255,0), 2)
            cv2.putText(frame, f"S:{sev}", (int(x1), int(y1)-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)

    cv2.imshow("YOLO + Severity", frame)
    if cv2.waitKey(1) == 27:  # ESC 키로 종료
        break

cap.release()
cv2.destroyAllWindows()
