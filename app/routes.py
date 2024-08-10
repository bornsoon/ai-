# /app/routes.py
from flask import Blueprint, request, jsonify, send_file, render_template, session, redirect, url_for, flash
from app.ai_chat import get_response
from app.audio_processing import transcribe_audio
import pyttsx3

main_bp = Blueprint('main', __name__, url_prefix='/ai')
api_bp = Blueprint('api', __name__, url_prefix='/api')

engine = pyttsx3.init()

mock_users = {
    "abc1234": "aa1234",
    "cba1234": "bb1234"
}

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/chat')
def chat():
    user = session.get('user')
    res_text = session.get('res_text', '')
    return render_template('chat.html')

@main_bp.route('/aitest')
def aitest():
    user = session.get('user')
    res_text = session.get('res_text', '')
    return render_template('aitest.html')


@main_bp.route('/myreport')
def myreport():
    user = session.get('user')
    if user:
        res_text = session.get('res_text', '')
        return render_template('myreport.html', res_text=res_text)
    else:
        session['next'] = request.url
        flash('로그인이 필요합니다.', 'danger')
        return redirect(url_for('main.login'))

@main_bp.route('/mypage')
def mypage():
    user = session.get('user')
    if user:
        res_text = session.get('res_text', '')
        return render_template('mypage.html', res_text=res_text)
    else:
        session['next'] = request.url
        flash('로그인이 필요합니다.', 'danger')
        return redirect(url_for('main.login'))

@main_bp.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

@main_bp.route('/join', methods=['GET'])
def join():
    return render_template('join.html')

@main_bp.route('/check_session')
def check_session():
    user = session.get('user')
    if user:
        return f'Logged in as {user}'
    else:
        return 'No user logged in'

@api_bp.route('/login', methods=['POST'])
def api_login():
    userid = request.form['userid']
    password = request.form['password']
    print(f"Received login attempt: userid={userid}, password={password}")  # 디버깅용 출력
    if userid in mock_users and mock_users[userid] == password:
        session['user'] = userid
        next_url = session.pop('next', None)
        print(f'로그인 성공: {session["user"]}')  # 디버깅용 출력
        flash('로그인 성공!', 'success')
        return redirect(next_url or url_for('main.chat'))  # 원래 페이지로 리디렉트
    else:
        print(f'로그인 실패: userid={userid}, password={password}')  # 디버깅용 출력
        flash('로그인 실패. 다시 시도하세요.', 'danger')
        return redirect(url_for('main.login'))

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
