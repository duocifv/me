import streamlit as st
from services.user_service import get_users, update_profile
from utils.helpers import hash_password

# Kiểm tra đã login
if "user" not in st.session_state:
    st.warning("Bạn chưa đăng nhập")
    st.stop()

st.title("👤 Trang cá nhân")
st.write(f"Xin chào, **{st.session_state.user}**!")

# Lấy profile để hiển thị nếu cần
users = get_users()
profile = users.get(st.session_state.user, {})
old_email = profile.get("email", "Chưa cập nhật")
old_bio = profile.get("bio", "Chưa cập nhật")

st.markdown("### Thông tin chi tiết của bạn:")
st.write(f"**Email:** {old_email}")
st.write(f"**Giới thiệu:** {old_bio}")

# Nút bật panel chỉnh sửa
if st.button("✏️ Chỉnh sửa thông tin"):
    st.session_state.show_edit = True

# Panel chỉnh sửa thông tin
if st.session_state.get("show_edit", False):
    exp = st.expander("📝 Chỉnh sửa thông tin cá nhân", expanded=True)
    with exp:
        new_email = st.text_input("📧 Email mới", value=profile.get("email", ""), key="modal_email")
        new_bio = st.text_area("🖋️ Giới thiệu bản thân", value=profile.get("bio", ""), key="modal_bio")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("✅ Lưu thay đổi", key="save_profile"):
                update_profile(st.session_state.user, new_email, new_bio)
                st.success("Đã lưu thông tin cá nhân!")
                st.session_state.show_edit = False
                st.rerun()
        with col2:
            if st.button("❌ Hủy", key="cancel_profile"):
                st.info("Đã hủy chỉnh sửa.")
                st.session_state.show_edit = False
                st.rerun()