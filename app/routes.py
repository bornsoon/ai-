from flask import Blueprint, request, jsonify, send_file, render_template, session
from app.ai_chat import get_response
from app.audio_processing import transcribe_audio
import pyttsx3
import os

# main url 경로 라우터
main_bp = Blueprint('main', __name__, url_prefix='/ai')
api_bp = Blueprint('api', __name__, url_prefix='/api')

engine = pyttsx3.init()

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/chat')
def chat():
    res_text = session.get('res_text', '')    
    return render_template('chat.html', res_text=res_text)

@main_bp.route('/myreport')
def chat():
    res_text = session.get('res_text', '')    
    return render_template('myreport.html', res_text=res_text)

@main_bp.route('/aitest')
def aitest():
    return render_template('aitest.html') # gpt-api 연결 설정 추가 필요

@api_bp.route('/aiChat', methods=['POST'])
def ai_query():
    return get_response()    

@api_bp.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_file(f'static/uploads/{filename}', mimetype='audio/mp3')

@main_bp.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@api_bp.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal Server Error"}), 500
# routes.py

from flask import Blueprint, request, jsonify, send_file, render_template, session
from app.ai_chat import get_response
from app.audio_processing import transcribe_audio
import pyttsx3
import os

# main url 경로 라우터
main_bp = Blueprint('main', __name__, url_prefix='/ai')
api_bp = Blueprint('api', __name__, url_prefix='/api')

engine = pyttsx3.init()

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/chat')
def chat():
    res_text = session.get('res_text', '')    
    return render_template('chat.html', res_text=res_text)

@main_bp.route('/aitest')
def aitest():
    return render_template('aitest.html') # gpt-api 연결 설정 추가 필요

@main_bp.route('/myreport')
def myreport():
    return render_template('myreport.html')

@api_bp.route('/aiChat', methods=['POST'])
def ai_query():
    return get_response()    

@api_bp.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_file(f'static/uploads/{filename}', mimetype='audio/mp3')

@main_bp.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@api_bp.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal Server Error"}), 500
