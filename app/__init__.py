from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from app.routes import main_bp, api_bp
import os

# .env 에서 다양한 환경설정 로드

def create_app():
    # 절대 경로가 아닌 상대 경로로 변경
    app = Flask(__name__, template_folder='../templates', 
                        static_folder='../static', 
                        static_url_path='/static')
    CORS(app)
    
    load_dotenv()
    
    GPT_KEY = os.environ.get('GPT_KEY')
    ACCESS_KEY = os.environ.get('ACCESS_KEY')
    # SERVER = os.environ.get('SERVER')

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    
    
    
    return app
