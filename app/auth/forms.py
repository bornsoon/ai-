# app/auth/forms.py

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, DateField
from wtforms.validators import DataRequired, Length, EqualTo
from datetime import datetime

class LoginForm(FlaskForm):
    userid = StringField('User ID', validators=[DataRequired(), Length(min=4, max=25)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6, max=35)])
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    userid = StringField('User ID', validators=[DataRequired(), Length(min=4, max=25)])
    nickName = StringField('Nickname', validators=[DataRequired(), Length(min=2, max=50)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6, max=35)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    birth_date = DateField('Birth Date', format='%Y-%m-%d', validators=[DataRequired()])
    gender = SelectField('Gender', choices=[('male', '남성'), ('female', '여성'), ('other', '기타')], validators=[DataRequired()])
    submit = SubmitField('Register')
