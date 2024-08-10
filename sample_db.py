# sample_db.property
from app import create_app
from app.models import db, User, Topic, AIChat

app = create_app()

with app.app_context():
    db.create_all()

    # Create sample users
    user1 = User(
        user_id="123e4567-e89b-12d3-a456-426614174000",
        id="abc1234",
        password="aa1234",
        userName="박수형",
        birth_date="1990-01-01",
        role="student"
    )

    user2 = User(
        user_id="123e4567-e89b-12d3-a456-426614174001",
        id="dba1234",
        password="bb1234",
        userName="황조현",
        birth_date="1992-02-02",
        role="student"
    )

    # Create sample topic
    topic1 = Topic(
        topic_id="123e4567-e89b-12d3-a456-426614174002",
        topic="Basic English",
        AIQuestion="What is your name?",
        level=1
    )

    # Add to session and commit to the database
    db.session.add_all([user1, user2, topic1])
    db.session.commit()

    print("Sample data inserted successfully.")
