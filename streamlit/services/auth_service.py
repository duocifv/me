from services.user_service import get_users, save_users
from utils.helpers import hash_password

def register_user(username, password):
    users = get_users()
    if username in users:
        return False, "Tên người dùng đã tồn tại."
    users[username] = {"password": hash_password(password), "is_admin": False}
    save_users(users)
    return True, "Đăng ký thành công!"

def login_user(username, password):
    users = get_users()
    user = users.get(username)
    if not user:
        return False
    return user["password"] == hash_password(password)
