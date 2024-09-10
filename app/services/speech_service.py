import requests
import base64
import os

class SpeechService:
    def __init__(self, access_key):
        self.access_key = access_key
        self.url = 'http://aiopen.etri.re.kr:8000/WiseASR/Pronunciation'

    def evaluate_pronunciation(self, audio_file_path, language_code, script):
        print("1단계: 음성 파일을 Base64로 인코딩 중...")
        try:
            with open(audio_file_path, 'rb') as audio_file:
                audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
            print("음성 파일 인코딩 완료.")
        except Exception as e:
            print(f"오류: 음성 파일을 읽거나 인코딩하는데 실패했습니다 - {str(e)}")
            return {"error": f"Failed to read or encode audio file: {str(e)}"}

        print("2단계: API 요청 본문 작성 중...")
        payload = {
            "request_id": "reserved field",
            "argument": {
                "language_code": language_code,
                "script": script,
                "audio": audio_base64
            }
        }
        print("API 요청 본문 작성 완료.")

        print("3단계: HTTP 헤더 설정 중...")
        headers = {
            "Authorization": self.access_key,
            "Content-Type": "application/json"
        }
        print("HTTP 헤더 설정 완료.")

        try:
            print("4단계: API 호출 중...")
            # 타임아웃을 10초로 설정하여 서버 응답을 기다림
            response = requests.post(self.url, json=payload, headers=headers, timeout=600)
            print(f"API 호출 완료. 응답 상태 코드: {response.status_code}")

            print("5단계: API 응답 처리 중...")
            if response.status_code == 504:
                print("서버 타임아웃 발생. 다시 시도해 주세요.")
                return {"error": "504 Gateway Time-out"}

            try:
                response_data = response.json()
                print("응답 본문 (JSON):", response_data)
                return response_data
            except requests.exceptions.JSONDecodeError:
                print("응답이 JSON 형식이 아닙니다. 응답 본문 (텍스트):", response.text)
                return {"error": "Failed to parse JSON response", "response_text": response.text}

        except Exception as e:
            print(f"예외 발생: {str(e)}")
            return {"error": str(e)}
