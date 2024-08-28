from app import create_app
from app.models import db, AIChat, AIChatTest, Topic
from datetime import datetime, timedelta
import uuid
import random

app = create_app()

with app.app_context():
    user_id = "6856f521-3d73-4c18-a8c8-96185a500691"
    start_date = datetime(2024, 8, 28)  # Start from August 24, 2024
    
    # Fetch a topic or create one if none exists
    topic = Topic.query.first()
    if not topic:
        topic = Topic(
            topic_id=str(uuid.uuid4()),
            topic="Basic English",
            AIQuestion="What is your name?",
            level=1
        )
        db.session.add(topic)
        db.session.commit()

    # Generate data for August 24th and 25th
    for day in range(4):  # For 2 days
        for _ in range(3):  # 2 entries per day
            chat_date = start_date + timedelta(days=day)
            
            # Generate AIChat data
            ai_chat = AIChat(
                chat_id=str(uuid.uuid4()),
                user_id=user_id,
                chatDate=chat_date,
                topic_id=topic.topic_id,
                pronunciation=random.uniform(5.0, 10.0)  # Randomly generate pronunciation score
            )
            db.session.add(ai_chat)
            
            # Generate AIChatTest data
            ai_chat_test = AIChatTest(
                chatTest_id=str(uuid.uuid4()),
                user_id=user_id,
                chatDate=chat_date,
                topic_id=topic.topic_id,
                fluency=random.uniform(5.0, 10.0),
                grammar=random.uniform(5.0, 10.0),
                vocabulary=random.uniform(5.0, 10.0),
                content=random.uniform(5.0, 10.0),
                simpleEvaluation="Good"
            )
            db.session.add(ai_chat_test)
    
    # Commit all changes to the database
    db.session.commit()

    print("Sample AIChat and AIChatTest data for August 24-25, 2024, generated successfully.")
