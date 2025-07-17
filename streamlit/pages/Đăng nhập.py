import streamlit as st
from services.auth_service import login_user

st.title("🔐 Đăng nhập")

username = st.text_input("Tên đăng nhập")
password = st.text_input("Mật khẩu", type="password")

if st.button("Đăng nhập"):
    if login_user(username, password):
        st.session_state.user = username
        # <-- Dùng API chính thức
        st.switch_page("pages/Cá nhân.py")
    else:
        st.error("Sai tên đăng nhập hoặc mật khẩu")
