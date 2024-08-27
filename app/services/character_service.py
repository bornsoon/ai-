# app/services/character_service.py

from app.models import db, Character, UserCharacter

class CharacterService:
    def upgrade_character(self, user_id, character_id):
        # 사용자의 캐릭터 레벨을 업그레이드하는 로직
        user_char = UserCharacter.query.filter_by(user_id=user_id, character_id=character_id).first()
        if user_char:
            # 레벨 업 로직 구현
            new_level = int(user_char.level_code[1:]) + 1  # 예: "N1" -> "N2"
            user_char.level_code = f"{user_char.level_code[0]}{new_level}"
            db.session.commit()
            return True
        return False

    def get_character_by_id(self, character_id):
        return Character.query.get(character_id)
