# pages/user_manager.py
import streamlit as st
from st_aggrid import AgGrid, GridOptionsBuilder, GridUpdateMode
from services.user_service import get_users, save_users, delete_user, update_user_password
from utils.helpers import hash_password
import pandas as pd

st.set_page_config(page_title="Quản lý người dùng", page_icon="👥")
st.title("👥 Quản lý người dùng")

# Chặn truy cập nếu không phải admin
if "user" not in st.session_state or st.session_state.user != "admin":
    st.warning("Chỉ admin mới có quyền truy cập trang này.")
    st.stop()

# --- 1) Hiển thị bảng và chọn user ---
users = get_users()
df = pd.DataFrame([
    {"Tài khoản": u, "Admin": d.get("is_admin", False)}
    for u, d in users.items()
])

gb = GridOptionsBuilder.from_dataframe(df)
gb.configure_pagination(paginationAutoPageSize=False, paginationPageSize=10)
gb.configure_selection("single", use_checkbox=True)
grid_opts = gb.build()

grid_resp = AgGrid(
    df,
    gridOptions=grid_opts,
    update_mode=GridUpdateMode.SELECTION_CHANGED,
    fit_columns_on_grid_load=True,
    height=350,
    theme="streamlit",
)
selected = grid_resp.get("selected_rows", [])

if isinstance(selected, pd.DataFrame):
    selected = selected.to_dict("records")

selected_user = selected[0]["Tài khoản"] if selected else None

st.markdown("---")

# --- 2) Ba nút Thêm / Sửa / Xóa ---
col_add, col_edit, col_del = st.columns([1,1,1])
with col_add:
    if st.button("➕ Thêm người dùng"):
        st.session_state.mode = "add"
with col_edit:
    if st.button("✏️ Sửa người dùng") and selected_user:
        st.session_state.mode = "edit"
with col_del:
    if st.button("🗑️ Xóa người dùng") and selected_user:
        st.session_state.mode = "delete"

# --- 3) Expander tương ứng từng mode ---
mode = st.session_state.get("mode")
if mode == "add":
    with st.expander("🆕 Thêm người dùng", expanded=True):
        new_user = st.text_input("Tên tài khoản mới", key="add_user")
        new_pw = st.text_input("Mật khẩu", type="password", key="add_pw")
        is_admin = st.checkbox("Là admin?", key="add_admin")
        if st.button("✅ Tạo", key="add_confirm"):
            users[new_user] = {"password": hash_password(new_pw), "is_admin": is_admin}
            save_users(users)
            st.success(f"Đã thêm user `{new_user}`")
            st.session_state.mode = None
            st.rerun()

elif mode == "edit" and selected_user:
    with st.expander(f"✏️ Sửa `{selected_user}`", expanded=True):
        new_pw = st.text_input("Mật khẩu mới (để trống nếu không đổi)", type="password", key="edit_pw")
        is_admin = st.checkbox("Là admin?", value=users[selected_user]["is_admin"], key="edit_admin")
        if st.button("✅ Cập nhật", key="edit_confirm"):
            if new_pw:
                update_user_password(selected_user, hash_password(new_pw))
            users[selected_user]["is_admin"] = is_admin
            save_users(users)
            st.success(f"Đã cập nhật `{selected_user}`")
            st.session_state.mode = None
            st.rerun()

elif mode == "delete" and selected_user:
    with st.expander(f"❗ Xóa `{selected_user}`", expanded=True):
        st.write(f"Bạn có chắc muốn xóa user **{selected_user}** không?")
        if st.button("🗑️ Xác nhận xóa", key="del_confirm"):
            delete_user(selected_user)
            st.success(f"Đã xóa `{selected_user}`")
            st.session_state.mode = None
            st.rerun()

else:
    st.write("Chọn nút ➕ / ✏️ / 🗑️ và chọn dòng trong bảng để thao tác.")
