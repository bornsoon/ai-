import requests

def test_evaluate_pronunciation():
    url = 'http://localhost:5000/ai/evaluate_pronunciation'  # Flask 서버의 경로
    audio_file_path = 'tests/sample_fm.mp3'  # 테스트용 음성 파일 경로

    # 스크립트와 언어 코드를 정의
    # script = "when shall i pay for it now or at check out time."  # 발음 평가를 할 문장
    script = "welcome to the new york city bus tour center."  # 발음 평가를 할 문장
    language_code = "english"  # 언어 코드 (영어)

    # 파일을 전송할 데이터 준비
    with open(audio_file_path, 'rb') as audio_file:
        files = {
            'audio_file': audio_file
        }
        data = {
            'script': script,
            'language_code': language_code
        }

        # POST 요청 전송
        response = requests.post(url, files=files, data=data)

    # 결과 확인
    print("응답 상태 코드:", response.status_code)
    print("응답 본문:", response.json())

if __name__ == "__main__":
    test_evaluate_pronunciation()
