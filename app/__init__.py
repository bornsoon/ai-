#  app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_login import LoginManager
from app.models import db, User
from datetime import timedelta
import os
import logging
from logging.handlers import RotatingFileHandler
from pymongo import MongoClient

# Import custom configuration
from dbconfig import Config

def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    CORS(app)
    load_dotenv()
    
    app.secret_key = os.getenv('SECRET_KEY')
    app.config.from_object(Config)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
    app.config['ETRI_KEY'] = os.getenv('ETRI_KEY')
    
    # Initialize MongoDB
    mongo_uri = "mongodb://localhost:27017/"
    client = MongoClient(mongo_uri)
    app.db = client.aifriend 
    
    # Initialize the database
    db.init_app(app)
    Migrate(app, db)

    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    # Configure logging
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('App startup')

    from app.routes import main_bp, api_bp
    from app.auth import auth_bp

    # Register Blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)

    return app
