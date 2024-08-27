from app import create_app
from app.models import db, User
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash

def create_sample_users():
    app = create_app()
    app.app_context().push()
    
    users = [
        User(
            user_id=str(uuid.uuid4()),
            id=f"user{i}",
            password=generate_password_hash("password123"),  # 비밀번호는 해시로 저장됩니다.
            nickName=f"User{i}",
            birth_date=datetime.strptime(f"199{i%10}-01-01", '%Y-%m-%d').date() if i <= 9 else datetime.strptime(f"200{i-10}-01-01", '%Y-%m-%d').date(),  # 'YYYY-01-01' 형식으로 저장
            gender="male" if i % 2 == 0 else "female",  # 짝수는 남성, 홀수는 여성
            role="user",
            socialLogin=False
        ) for i in range(1, 19)
    ]
    
    db.session.bulk_save_objects(users)
    db.session.commit()

if __name__ == "__main__":
    create_sample_users()
    print("Sample users created.")
