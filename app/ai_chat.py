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

# Initialize global variables (these will be set based on the menu)
output_style = ""
character_me = ""
character_ai = ""
situation = ""

def apply_settings(menu):
    global output_style, character_me, character_ai, situation
    
    if menu in menu_settings:
        settings.update(menu_settings[menu])
    else:
        settings.update(default_settings)
    print(f"Applied settings for {menu}: {settings}")

    # Set global variables based on the menu
    if menu == 'chat':
        output_style = "Respond within 100 characters."
        character_me = "I am the questioner."
        character_ai = "AI is the respondent."
        situation = "now"
    elif menu == 'aitest':
        output_style = 'Evaluate the speaking sample according to The Cambridge English Framework for Young Learners (YLE) and Primary. Provide the evaluation results in a JSON format with the following keys: fluency, grammar, vocabulary, content, simpleEvaluation (up to 100 characters), and question (up to 100 characters). The scores should range from 1 to 9. Only provide the JSON response without any additional text. Sample: Korean dramas are popular but have some issues. They often have love stories that are not real-life. Some characters act too silly or mean. The stories can be very sad and make people cry. Sometimes the same things happen in every drama. Rich people are usually the main characters, which is not like real life. The shows can be very long, with many episodes. This makes it hard to finish watching. Some scenes are repeated too much. The ending can be rushed or not make sense. If you do not know Korean culture, some parts might be confusing. Response format: { "fluency": 0, "grammar": 0, "vocabulary": 0, "content": 0, "simpleEvaluation":"", "question": "" }'
        character_me = 'I am the questioner.'
        character_ai = 'AI is the respondent.'
        situation = ''

def save_message(role, content):
    if 'messages' not in session:
        session['messages'] = []
    session['messages'].append({"role": role, "content": content})
    
    if settings.get("context_size") is not None and settings["context_size"] > 0:
        session['messages'] = session['messages'][-settings["context_size"]:]
    elif settings.get("context_size") == 0:
        session['messages'] = []

def save_ai_test_result(user_id, topic_id, fluency, grammar, vocabulary, content, simple_evaluation):
    try:
        print(f"Saving AI test result - User ID: {user_id}, Topic ID: {topic_id}, Fluency: {fluency}, Grammar: {grammar}, Vocabulary: {vocabulary}, Content: {content}, Evaluation: {simple_evaluation}")

        if not user_id:
            user_id = "test_user"
        
        if topic_id is None:
            topic_id = "1"

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
        app.logger.info("AIChatTest saved successfully")
        return True
    except Exception as e:
        app.logger.error(f"Failed to save AI test result: {str(e)}")
        return False

def parse_ai_response(ai_response_content):
    try:
        print(f"Parsing AI response: {ai_response_content}")

        # Extract the JSON content using a regular expression
        match = re.search(r'\{[\s\S]*\}', ai_response_content)
        if match:
            json_content = match.group(0)
            print(f"Extracted JSON content: {json_content}")

            # Replace single quotes with double quotes
            json_content = json_content.replace("'", "\"")
            print(f"Modified JSON content: {json_content}")

            # Parse the modified JSON content
            ai_response = json.loads(json_content)
            print(f"Parsed AI response: {ai_response}")

            # Extract values with default fallback
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
        raise ValueError("An error occurred while parsing the AI response.")


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

    save_success = save_ai_test_result(user_id, topic_id, fluency, grammar, vocabulary, content, simple_evaluation)
    
    if not save_success:
        app.logger.error("Failed to save the test result to the database, but proceeding to send the response.")

    combined_message = "{} {}".format(simple_evaluation, question)
    print(f"Combined message: {combined_message}")

    return combined_message

def get_response():
    data = request.json
    menu = data.get('menu', 'default')
    
    print(f"Received request data: {data}")
    
    apply_settings(menu)

    user_message = data["messages"][-1]["content"]

    # Combine global variables to form the prompt
    prompt = f"{output_style} | {character_me} | {character_ai} | {situation} | {user_message}"

    try:
        stream = data.get("stream", False)

        if 'messages' in session and settings["context_size"] != 0:
            context_messages = session['messages'] + [{"role": "user", "content": prompt}]
        else:
            context_messages = [{"role": "user", "content": prompt}]

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
            print(f"Returning to frontend: {combined_message}")
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
