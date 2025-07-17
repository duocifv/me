import streamlit as st

st.set_page_config(
    page_title="CRUD App",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Giao diện trắng (light) — cấu hình tạm thời
st.markdown("""
    <style>
        body {
            background-color: white;
            color: black;
        }
    </style>
""", unsafe_allow_html=True)
