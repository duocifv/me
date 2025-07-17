import streamlit as st
from services.auth_service import register_user

st.title("📝 Đăng ký tài khoản")

username = st.text_input("Tên đăng ký")
password = st.text_input("Mật khẩu", type="password")

if st.button("Đăng ký"):
    success, message = register_user(username, password)
    if success:
        st.success(message)
    else:
        st.error(message)
