# \app\auth\forms.py

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField  # 'passwordField'를 'PasswordField'로 수정
from wtforms.validators import DataRequired, Length, Email, EqualTo

class LoginForm(FlaskForm):
    userid = StringField('User ID', validators=[DataRequired(), Length(min=4, max=25)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6, max=35)])
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    userid = StringField('User ID', validators=[DataRequired(), Length(min=4, max=25)])
    userName = StringField('Username', validators=[DataRequired(), Length(min=2, max=50)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6, max=35)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')
