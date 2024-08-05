# ai_chat.py
from flask import request, jsonify, session, current_app as app
import ollama
from ollama import Client, ResponseError, RequestError
from app.config import menu_settings, default_settings  # 설정 파일에서 AI 설정값 호출

client = Client()
settings = default_settings.copy()

def apply_settings(menu):
    if menu in menu_settings:
        settings.update(menu_settings[menu])
    else:
        settings.update(default_settings)

def save_message(role, content):
    """사용자의 대화 메시지를 세션에 저장"""
    if 'messages' not in session:
        session['messages'] = []
    session['messages'].append({"role": role, "content": content})
    app.logger.info(f"Updated session messages: {session['messages']}")
    if settings["context_size"] is not None and settings["context_size"] > 0:
        session['messages'] = session['messages'][-settings["context_size"]:]
    elif settings["context_size"] == 0:
        session['messages'] = []

def get_response():
    data = request.json
    menu = data.get('menu', 'default')  # 요청에서 메뉴 정보를 가져옴
    apply_settings(menu)

    app.logger.info('Received messages: %s', data.get("messages", []))
    user_message = data["messages"][-1]["content"]
    app.logger.info('User input message: %s', user_message)

    try:
        stream = data.get("stream", False)

        # 이전 대화의 맥락을 설정된 개수만큼 포함
        if 'messages' in session and settings["context_size"] != 0:
            context_messages = session['messages'] + data["messages"]
        else:
            context_messages = data["messages"]

        app.logger.info(f"Using settings: {settings}")
        app.logger.info("Accumulated conversation messages:")
        for msg in context_messages:
            app.logger.info(f"{msg['role']}: {msg['content']}")

        response = client.chat(
            model="llama3",
            messages=context_messages,
            stream=stream,
            options={
                "temperature": settings["temperature"],
                "max_length": settings["max_length"],
                "top_k": settings["top_k"],
                "top_p": settings["top_p"]
            }
        )

        if stream:
            is_first_message = True
            for res in response:
                if 'message' in res and 'content' in res['message']:
                    if is_first_message:
                        save_message("assistant", res["message"]["content"])
                        data["messages"].append({"role": "assistant", "content": res["message"]["content"]})
                        is_first_message = False
                    else:
                        data["messages"][-1]["content"] += ' ' + res["message"]["content"]
                        session['messages'][-1]["content"] += ' ' + res["message"]["content"]
        else:
            if 'message' in response and 'content' in response['message']:
                save_message("assistant", response["message"]["content"])
                data["messages"].append({"role": "assistant", "content": response["message"]["content"]})
            else:
                raise ValueError("Unexpected response format")

        save_message("user", user_message)

        for message in data["messages"]:
            if message["role"] == "assistant":
                message["content"] = '.\n'.join(message["content"].split('.'))

        app.logger.info('API response: %s', response)
        return jsonify(data)
    except (RequestError, ResponseError, ValueError) as e:
        app.logger.error('Error: %s', str(e))
        return jsonify({"error": str(e)}), 500

# 설정 함수들

def set_temperature(temperature: float):
    settings["temperature"] = temperature

def set_max_length(max_length: int):
    settings["max_length"] = max_length

def set_top_k(top_k: int):
    settings["top_k"] = top_k

def set_top_p(top_p: float):
    settings["top_p"] = top_p

def set_context_size(context_size: int):
    settings["context_size"] = context_size

# 초기 설정
set_temperature(0.5)
set_max_length(100)
set_top_k(40)
set_top_p(0.85)
set_context_size(5)
