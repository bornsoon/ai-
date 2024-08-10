from flask import request, jsonify, session, current_app as app
from ollama import Client, ResponseError, RequestError
from app.aiconfig import menu_settings, default_settings
from app.models import db, AIChatTest
from datetime import datetime
import uuid
import json

client = Client()
settings = default_settings.copy()

def save_ai_test_result(user_id, topic_id, fluency, grammar, vocabulary, content, simple_evaluation):
    if not user_id:
        user_id = "test_user"
        
    chat_test = AIChatTest(
        chatTest_id=str(uuid.uuid4()),
        user_id=user_id,
        chatDate=datetime.utcnow(),
        topic_id=topic_id,
        fluency=fluency,
        grammar=grammar,
        vocabulary=vocabulary,
        content=content,
        simpleEvaluation=simple_evaluation
    )
    db.session.add(chat_test)
    db.session.commit()
    app.logger.info("AIChatTest 저장됨")

def extract_json_from_response(ai_response_content):
    """
    AI 응답에서 JSON 형식의 텍스트만 추출합니다.
    :param ai_response_content: AI 응답의 본문 (문자열)
    :return: JSON 문자열
    """
    try:
        start_index = ai_response_content.find("{")
        end_index = ai_response_content.rfind("}") + 1
        json_content = ai_response_content[start_index:end_index]
        return json_content
    except ValueError as e:
        app.logger.error(f"Failed to extract JSON from AI response: {str(e)}")
        raise ValueError("AI 응답에서 JSON을 추출하는 중 문제가 발생했습니다.")

def parse_ai_response(ai_response_content):
    try:
        json_content = extract_json_from_response(ai_response_content)
        ai_response = json.loads(json_content)
        
        fluency = ai_response.get('Fluency', 0)
        grammar = ai_response.get('Grammar', 0)
        vocabulary = ai_response.get('Vocabulary', 0)
        content = ai_response.get('Content', 0)
        simple_evaluation = ai_response.get('simpleEvaluation', "You're doing great.")
        question = ai_response.get('question', 'If you want the next question, please say “Please next question”')

        return fluency, grammar, vocabulary, content, simple_evaluation, question

    except (json.JSONDecodeError, ValueError) as e:
        app.logger.error(f"Failed to parse AI response: {str(e)}")
        raise ValueError("AI 응답을 파싱하는 중 문제가 발생했습니다.")

def handle_aitest_response(response, user_id, topic_id):
    ai_response_content = response["message"]["content"]
    app.logger.info(f"AI response content: {ai_response_content}")

    fluency, grammar, vocabulary, content, simple_evaluation, question = parse_ai_response(ai_response_content)

    save_ai_test_result(user_id, topic_id, fluency, grammar, vocabulary, content, simple_evaluation)

    combined_message = "{} {}".format(simple_evaluation, question)

    return combined_message

def apply_settings(menu):
    if menu in menu_settings:
        settings.update(menu_settings[menu])
    else:
        settings.update(default_settings)

def save_message(role, content):
    if 'messages' not in session:
        session['messages'] = []
    session['messages'].append({"role": role, "content": content})
    
    if settings.get("context_size") is not None and settings["context_size"] > 0:
        session['messages'] = session['messages'][-settings["context_size"]:]
    elif settings.get("context_size") == 0:
        session['messages'] = []

def get_response():
    data = request.json
    menu = data.get('menu', 'default')
    apply_settings(menu)

    user_message = data["messages"][-1]["content"]

    try:
        stream = data.get("stream", False)

        if 'messages' in session and settings["context_size"] != 0:
            context_messages = session['messages'] + data["messages"]
        else:
            context_messages = data["messages"]

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

        if menu == 'aitest':
            user_id = session.get('user')
            topic_id = data.get('topic_id')

            combined_message = handle_aitest_response(response, user_id, topic_id)
            return jsonify({"content": combined_message})

        elif menu == 'chat':
            if 'message' in response and 'content' in response['message']:
                save_message("assistant", response["message"]["content"])
                return jsonify({"content": response["message"]["content"]})

        return jsonify(response)
    except (RequestError, ResponseError, ValueError) as e:
        app.logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
