# ai_chat.py

from flask import Flask, request, jsonify
import ollama
from ollama import Client, ResponseError, RequestError

# Initialize the client
client = Client()

def get_response():
    data = request.json
    user_message = data["messages"][-1]["content"]
    print('user:', user_message)

    try:
        # Determine if streaming is required (multi response)
        stream = data.get("stream", False)

        # Use the Ollama library to generate a response
        response = client.chat(model="llama3", messages=[{"role": "user", "content": user_message}], stream=stream)

        # Check if streaming (multi response) or single response
        if stream:
            is_first_message = True
            for res in response:
                if 'message' in res and 'content' in res['message']:
                    if is_first_message:
                        data["messages"].append({"role": "assistant", "content": res["message"]["content"]})
                        is_first_message = False
                    else:
                        data["messages"][-1]["content"] += ' ' + res["message"]["content"]
        else:
            if 'message' in response and 'content' in response['message']:
                data["messages"].append({"role": "assistant", "content": response["message"]["content"]})
            else:
                raise ValueError("Unexpected response format")

        # Split the content by '.' and join with newline for better readability
        for message in data["messages"]:
            if message["role"] == "assistant":
                message["content"] = '.\n'.join(message["content"].split('.'))

        print('api_response:', response)  # Log the API response for debugging
        return jsonify(data)
    except (RequestError, ResponseError, ValueError) as e:
        print('Error:', str(e))  # Log the error for debugging
        return jsonify({"error": str(e)}), 500
