# \app\auth\views.py

from flask import render_template, url_for, flash, redirect, request, session
from app import db
from app.auth import auth_bp
from app.auth.forms import LoginForm, RegistrationForm 
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(id=form.userid.data).first()
        if user and check_password_hash(user.password, form.password.data):
            session['user'] = user.user_id
            flash('로그인 성공!!', 'success')
            return redirect(url_for('main.chat'))
        else:
            flash('로그인 실패. 다시 입력해 주세요.', 'danger')
    return render_template('login.html', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data, method='sha256')
        new_user = User(user_id=str(uuid.uuid4()), id=form.userid.data, userName=form.userName.data, email=form.email.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('계정을 생성했습니다. 이제 로그인이 가능합니다.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('register.html', form=form)
