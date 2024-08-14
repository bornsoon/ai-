# aiconfig.py
menu_settings = {
    'chat': {"temperature": 0.8, "max_length": 100, "top_k": 50, "top_p": 0.95, "context_size": 2},
    'aitest': {"temperature": 0.5, "max_length": 150, "top_k": 40, "top_p": 0.85, "context_size": 0}
}

default_settings = {
    "temperature": 0.7,
    "max_length": 300,
    "top_k": 50,
    "top_p": 0.95,
    "context_size": 5
}


# 설정 사용 예시
# set_temperature(0.9)  # 자유도를 0.9로 설정
# set_max_length(256)   # 최대 길이를 256으로 설정
# set_top_k(40)         # top_k를 40으로 설정
# set_top_p(0.85)       # top_p를 0.85로 설정
# set_context_size(5)   # 이전 대화 중 마지막 5개의 메시지만 반영