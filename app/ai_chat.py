# ai_chat.py 
import json
import re
from flask import request, jsonify, session, current_app as app
from ollama import Client, ResponseError, RequestError
from app.aiconfig import menu_settings, default_settings
from app.models import db, AIChatTest
from datetime import datetime
import uuid

client = Client()
settings = default_settings.copy()

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

def save_ai_test_result(user_id, topic_id, fluency, grammar, vocabulary, content, simple_evaluation):
    print(f"Saving AI test result - User ID: {user_id}, Topic ID: {topic_id}, Fluency: {fluency}, Grammar: {grammar}, Vocabulary: {vocabulary}, Content: {content}, Evaluation: {simple_evaluation}")

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

def parse_ai_response(ai_response_content):
    try:
        print(f"Parsing AI response: {ai_response_content}")

        # 여러 줄에 걸친 JSON 형식 데이터를 추출하는 정규식
        match = re.search(r'\{[\s\S]*\}', ai_response_content)
        if match:
            json_content = match.group(0)
            print(f"Extracted JSON content: {json_content}")

            # JSON 문자열을 파싱
            ai_response = json.loads(json_content)
            print(f"Parsed AI response: {ai_response}")

            # 각 항목별 기본값 설정
            fluency = ai_response.get('fluency', 0)
            grammar = ai_response.get('grammar', 0)
            vocabulary = ai_response.get('vocabulary', 0)
            content = ai_response.get('content', 0)
            simple_evaluation = ai_response.get('simpleEvaluation', "You're doing great.")
            question = ai_response.get('question', 'If you want the next question, please say “Please next question”')

            return fluency, grammar, vocabulary, content, simple_evaluation, question
        else:
            raise ValueError("No valid JSON content found in AI response")

    except (json.JSONDecodeError, ValueError, KeyError, AttributeError) as e:
        app.logger.error(f"Failed to parse AI response: {str(e)}")
        raise ValueError("AI 응답을 파싱하는 중 문제가 발생했습니다.")

def handle_aitest_response(response, user_id, topic_id):
    ai_response_content = response["message"]["content"]
    print(f"Handling AI test response: {ai_response_content}")

    fluency, grammar, vocabulary, content, simple_evaluation, question = parse_ai_response(ai_response_content)

    print(f"Fluency: {fluency}")
    print(f"Grammar: {grammar}")
    print(f"Vocabulary: {vocabulary}")
    print(f"Content: {content}")
    print(f"Simple Evaluation: {simple_evaluation}")
    print(f"Question: {question}")

    save_ai_test_result(user_id, topic_id, fluency, grammar, vocabulary, content, simple_evaluation)

    combined_message = "{} {}".format(simple_evaluation, question)
    print(f"Combined message: {combined_message}")

    return combined_message

def get_response():
    data = request.json
    menu = data.get('menu', 'default')
    
    print(f"Received request data: {data}")
    
    apply_settings(menu)

    user_message = data["messages"][-1]["content"]

    try:
        stream = data.get("stream", False)

        if 'messages' in session and settings["context_size"] != 0:
            context_messages = session['messages'] + data["messages"]
        else:
            context_messages = data["messages"]

        print(f"Context messages: {context_messages}")

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

        print(f"AI response: {response}")

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
