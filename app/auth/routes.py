# app/auth/routes.py
from flask import render_template, redirect, url_for, flash, session, request, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user
from app.models import User, db
from app.auth import auth_bp
from app.auth.forms import LoginForm, RegistrationForm
import uuid
import logging

# 로그 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@auth_bp.route('/join', methods=['GET', 'POST'])
def join():
    form = RegistrationForm()
    if form.validate_on_submit():
        userid = form.userid.data
        password = form.password.data
        nickname = form.nickName.data
        birth_date = form.birth_date.data
        gender = form.gender.data

        try:
            user = User(
                user_id=str(uuid.uuid4()),  # userUuid로 사용
                id=userid,
                password=generate_password_hash(password),
                nickName=nickname,
                birth_date=birth_date,
                role="user",
                socialLogin=False,
                gender=gender
            )
            
            db.session.add(user)
            db.session.commit()
            flash('회원가입이 완료되었습니다. 로그인 해주세요.', 'success')
            logger.info(f'New user registered: {userid}')
            return redirect(url_for('auth.login'))

        except Exception as e:
            db.session.rollback()
            error_msg = f'회원가입 중 오류가 발생했습니다: {str(e)}'
            flash(error_msg, 'danger')
            logger.error(f'Error during registration for user {userid}: {str(e)}', exc_info=True)
            return redirect(url_for('auth.join'))

    return render_template('join.html', form=form)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        userid = form.userid.data
        password = form.password.data
        
        # User 테이블에서 로그인한 사용자 정보 조회
        user = User.query.filter_by(id=userid).first()
        
        if user and check_password_hash(user.password, password):
            # 로그인 성공 시 사용자 정보를 session에 저장
            login_user(user)
            
            # 사용자 정보 세션에 저장
            session['logged_in'] = True
            session['id'] = user.id
            session['user_id'] = user.user_id  # user_id를 session에 저장 (userUuid로 사용)
            session['nickname'] = user.nickName
            session['role'] = user.role
            
            # 추가적으로 birth_year와 gender 정보를 session에 저장
            session['birth_year'] = user.birth_date.year  # 생년월일의 연도만 저장
            session['gender'] = user.gender
            
            flash('로그인 성공!', 'success')
            logger.info(f'User logged in: {userid}')
            return redirect(url_for('main.mypage'))  # 로그인 후 mypage로 리다이렉트
        else:
            flash('로그인 실패. 다시 시도하세요.', 'danger')
            logger.warning(f'Failed login attempt for user {userid}')
            return redirect(url_for('auth.login'))
    
    return render_template('login.html', form=form)

@auth_bp.route('/check-userid')
def check_userid():
    userid = request.args.get('userid')
    user = User.query.filter_by(id=userid).first()
    return {'exists': bool(user)}
