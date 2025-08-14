import streamlit as st

st.set_page_config(
    page_title="Y tế - CRUD App",
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

st.title("🏥 Quản lý Y tế")
st.write("Trang quản lý thông tin y tế")

# Tạo tabs cho các chức năng y tế
tab1, tab2, tab3 = st.tabs(["📝 Hồ sơ bệnh án", "💊 Thuốc", "📅 Lịch khám"])

with tab1:
    st.subheader("Quản lý hồ sơ bệnh án")
    
    # Form thêm bệnh án mới
    with st.expander("➕ Thêm hồ sơ bệnh án mới"):
        col1, col2 = st.columns(2)
        with col1:
            ten_benh_nhan = st.text_input("Tên bệnh nhân")
            tuoi = st.number_input("Tuổi", min_value=0, max_value=150, value=30)
            gioi_tinh = st.selectbox("Giới tính", ["Nam", "Nữ", "Khác"])
        with col2:
            so_dien_thoai = st.text_input("Số điện thoại")
            dia_chi = st.text_area("Địa chỉ")
            
        chan_doan = st.text_area("Chẩn đoán")
        ghi_chu = st.text_area("Ghi chú")
        
        if st.button("💾 Lưu hồ sơ", type="primary"):
            if ten_benh_nhan:
                st.success(f"✅ Đã lưu hồ sơ cho bệnh nhân: {ten_benh_nhan}")
            else:
                st.error("❌ Vui lòng nhập tên bệnh nhân!")
    
    # Hiển thị danh sách hồ sơ (demo)
    st.subheader("📋 Danh sách hồ sơ bệnh án")
    sample_data = [
        {"Tên": "Nguyễn Văn A", "Tuổi": 35, "Giới tính": "Nam", "Chẩn đoán": "Cảm cúm", "Ngày khám": "2024-01-15"},
        {"Tên": "Trần Thị B", "Tuổi": 28, "Giới tính": "Nữ", "Chẩn đoán": "Đau đầu", "Ngày khám": "2024-01-14"},
    ]
    st.dataframe(sample_data, use_container_width=True)

with tab2:
    st.subheader("💊 Quản lý thuốc")
    
    # Form thêm thuốc
    with st.expander("➕ Thêm thuốc mới"):
        col1, col2 = st.columns(2)
        with col1:
            ten_thuoc = st.text_input("Tên thuốc")
            loai_thuoc = st.selectbox("Loại thuốc", ["Kháng sinh", "Giảm đau", "Vitamin", "Khác"])
            gia_thuoc = st.number_input("Giá (VNĐ)", min_value=0, value=50000)
        with col2:
            so_luong = st.number_input("Số lượng", min_value=0, value=100)
            han_su_dung = st.date_input("Hạn sử dụng")
            
        mo_ta = st.text_area("Mô tả thuốc")
        
        if st.button("💾 Lưu thuốc", type="primary", key="save_medicine"):
            if ten_thuoc:
                st.success(f"✅ Đã thêm thuốc: {ten_thuoc}")
            else:
                st.error("❌ Vui lòng nhập tên thuốc!")
    
    # Danh sách thuốc
    st.subheader("📋 Kho thuốc")
    medicine_data = [
        {"Tên thuốc": "Paracetamol", "Loại": "Giảm đau", "Số lượng": 500, "Giá": "15,000 VNĐ", "Hạn SD": "2025-12-31"},
        {"Tên thuốc": "Amoxicillin", "Loại": "Kháng sinh", "Số lượng": 200, "Giá": "25,000 VNĐ", "Hạn SD": "2025-06-30"},
    ]
    st.dataframe(medicine_data, use_container_width=True)

with tab3:
    st.subheader("📅 Lịch khám bệnh")
    
    # Form đặt lịch
    with st.expander("➕ Đặt lịch khám mới"):
        col1, col2 = st.columns(2)
        with col1:
            ten_benh_nhan_lich = st.text_input("Tên bệnh nhân", key="patient_appointment")
            ngay_kham = st.date_input("Ngày khám")
            gio_kham = st.time_input("Giờ khám")
        with col2:
            bac_si = st.selectbox("Bác sĩ", ["BS. Nguyễn Văn X", "BS. Trần Thị Y", "BS. Lê Văn Z"])
            chuyen_khoa = st.selectbox("Chuyên khoa", ["Nội khoa", "Ngoại khoa", "Sản phụ khoa", "Nhi khoa"])
            
        ly_do = st.text_area("Lý do khám")
        
        if st.button("📅 Đặt lịch", type="primary", key="book_appointment"):
            if ten_benh_nhan_lich:
                st.success(f"✅ Đã đặt lịch khám cho {ten_benh_nhan_lich} vào {ngay_kham} lúc {gio_kham}")
            else:
                st.error("❌ Vui lòng nhập tên bệnh nhân!")
    
    # Lịch khám hôm nay
    st.subheader("📋 Lịch khám hôm nay")
    appointment_data = [
        {"Giờ": "08:00", "Bệnh nhân": "Nguyễn Văn A", "Bác sĩ": "BS. Nguyễn Văn X", "Chuyên khoa": "Nội khoa", "Trạng thái": "Đã khám"},
        {"Giờ": "09:30", "Bệnh nhân": "Trần Thị B", "Bác sĩ": "BS. Trần Thị Y", "Chuyên khoa": "Sản phụ khoa", "Trạng thái": "Đang chờ"},
        {"Giờ": "10:15", "Bệnh nhân": "Lê Văn C", "Bác sĩ": "BS. Lê Văn Z", "Chuyên khoa": "Nhi khoa", "Trạng thái": "Chưa đến"},
    ]
    st.dataframe(appointment_data, use_container_width=True)
