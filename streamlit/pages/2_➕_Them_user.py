import streamlit as st
from services.user_service import get_users, save_users
from utils.helpers import hash_password

st.set_page_config(page_title="Thêm người dùng", page_icon="➕")

if "user" not in st.session_state or st.session_state.user != "admin":
    st.warning("Chỉ admin mới được truy cập.")
    st.stop()

new_user = st.text_input("Tên tài khoản mới")
new_pw = st.text_input("Mật khẩu", type="password")
is_admin = st.checkbox("Là admin?")

if st.button("✅ Tạo"):
    users = get_users()
    users[new_user] = {"password": hash_password(new_pw), "is_admin": is_admin}
    save_users(users)
    st.success(f"Đã thêm user `{new_user}`")
