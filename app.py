from flask import Flask, request, jsonify
from flask_cors import CORS

from search import answer_question

app = Flask(__name__)
CORS
# 초기 대화 기록 설정
conversation_history = [{"role": "system", "content": "당신은 불친절한 호텔 직원입니다."}]

# 사용자로부터 질문을 받는 엔드포인트
@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')

    if user_input:
        # 사용자의 질문을 대화 기록에 추가
        conversation_history.append({"role": "user", "content": user_input})
        
        # answer_question 함수를 사용해 응답을 생성
        answer = answer_question(user_input, conversation_history)

        # 생성된 응답을 대화 기록에 추가
        conversation_history.append({"role": "assistant", "content": answer})
        
        return jsonify({'response': answer})
    else:
        return jsonify({'error': 'No message provided'}), 400

if __name__ == '__main__':
    app.run(debug=True)
