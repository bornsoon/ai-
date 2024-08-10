# app/models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.String(36), primary_key=True, nullable=False)
    id = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    userName = db.Column(db.String(255), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, onupdate=datetime.utcnow)
    role = db.Column(db.String(255), nullable=False)
    socialLogin = db.Column(db.Boolean, default=False)
    withdrawal = db.Column(db.Boolean, default=False)

class SocialLogin(db.Model):
    __tablename__ = 'social_login'
    socialLogin_id = db.Column(db.String(36), primary_key=True, nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.user_id'), nullable=False)
    socialLoginCode = db.Column(db.String(255), nullable=False)
    socialLoginId = db.Column(db.String(255), nullable=False)

class Team(db.Model):
    __tablename__ = 'team'
    team_id = db.Column(db.String(36), primary_key=True, nullable=False)
    teamName = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.user_id'), nullable=False)

class Topic(db.Model):
    __tablename__ = 'topic'
    topic_id = db.Column(db.String(36), primary_key=True, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    AIQuestion = db.Column(db.Text, nullable=False)
    level = db.Column(db.Integer, nullable=False)

class AIChat(db.Model):
    __tablename__ = 'ai_chat'
    chat_id = db.Column(db.String(36), primary_key=True, nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.user_id'), nullable=False)
    chatDate = db.Column(db.Date, nullable=False)
    topic_id = db.Column(db.String(36), db.ForeignKey('topic.topic_id'), nullable=False)
    pronunciation = db.Column(db.Float)  # 음성평가 항목만 남김

class AIChatTest(db.Model):
    __tablename__ = 'ai_chat_test'
    chatTest_id = db.Column(db.String(36), primary_key=True, nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.user_id'), nullable=False)
    chatDate = db.Column(db.Date, nullable=False)
    topic_id = db.Column(db.String(36), db.ForeignKey('topic.topic_id'), nullable=False)
    fluency = db.Column(db.Float)
    grammar = db.Column(db.Float)
    vocabulary = db.Column(db.Float)
    content = db.Column(db.Float) 
    simpleEvaluation = db.Column(db.String(255)) 

class AIChatTestContent(db.Model):
    __tablename__ = 'ai_chat_test_content'
    chatTestContent_id = db.Column(db.String(36), primary_key=True, nullable=False)
    chatTest_id = db.Column(db.String(36), db.ForeignKey('ai_chat_test.chatTest_id'), nullable=False)
    chatDate = db.Column(db.DateTime, nullable=False)
    userContent = db.Column(db.Text, nullable=False)
    AIContent = db.Column(db.Text, nullable=False)
