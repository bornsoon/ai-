from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from app.routes import main_bp, api_bp
import os

def create_app():
    app = Flask(__name__, template_folder='../templates', 
                        static_folder='../static', 
                        static_url_path='/ai/static')
    CORS(app)
    
    load_dotenv()
    
    GPT_KEY = os.environ.get('GPT_KEY')
    ACCESS_KEY = os.environ.get('ACCESS_KEY')

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    
    return app
