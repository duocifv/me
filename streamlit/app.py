import streamlit as st

st.set_page_config(
    page_title="CRUD App",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Giao diện trắng (light)
st.markdown("""
    <style>
        body {
            background-color: white;
            color: black;
        }
    </style>
""", unsafe_allow_html=True)

st.title("📋 CRUD App Demo")
st.write("Chào mừng bạn đến với ứng dụng CRUD!")
st.write("Sử dụng sidebar để điều hướng giữa các trang.")

st.info("💡 **Hướng dẫn sử dụng:**")
st.markdown("""
- Trang này là **Trang chủ** của ứng dụng CRUD
- Sử dụng **sidebar bên trái** để điều hướng đến các trang khác
- **🏥 Y tế**: Quản lý hồ sơ bệnh án, thuốc và lịch khám
- Các trang khác: Quản lý, Cá nhân, Đăng ký, Đăng nhập
""")
