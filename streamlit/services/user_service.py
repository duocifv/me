import json
import os

USER_FILE = "data/users.json"

def get_users():
    if os.path.exists(USER_FILE):
        with open(USER_FILE, "r") as f:
            return json.load(f)
    return {}

def add_user(username, hashed_password, is_admin=False):
    users = get_users()
    users[username] = {
        "password": hashed_password,
        "is_admin": is_admin
    }
    with open("data/users.json", "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def save_users(users):
    with open(USER_FILE, "w") as f:
        json.dump(users, f, indent=2)

def delete_user(username):
    users = get_users()
    if username in users:
        del users[username]
        save_users(users)

def update_user_password(username, new_hashed_password):
    users = get_users()
    if username in users:
        users[username]["password"] = new_hashed_password
        save_users(users)

def update_profile(username, email: str, bio: str):
    """
    Cập nhật email và sinh hoạt cá nhân của user
    """
    users = get_users()
    if username in users:
        users[username]["email"] = email
        users[username]["bio"] = bio
        save_users(users)