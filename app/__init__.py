# /app/__init__.py 

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from app.routes import main_bp, api_bp
from app.models import db
import os
from datetime import timedelta
import logging
from logging.handlers import RotatingFileHandler

# Import Config from project root
from dbconfig import Config

def create_app():
    app = Flask(__name__, template_folder='../templates', 
                        static_folder='../static', 
                        static_url_path='/ai/static')
    CORS(app)

    load_dotenv()

    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for Flask application")
    print(f"Loaded SECRET_KEY: {SECRET_KEY}")  # 개발 중에만 사용, 배포 시 제거

    app.secret_key = SECRET_KEY
    app.config.from_object(Config)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

    db.init_app(app)
    Migrate(app, db)

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)

    # 로그 설정
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

        app.logger.setLevel(logging.INFO)
        app.logger.info('App startup')

    return app
