# Chọn môi trường nền: Python 3.9
FROM python:3.9

# Tạo user không phải root để tăng bảo mật
RUN useradd -m -u 1000 user
USER user

# Thêm thư mục pip vào PATH
ENV PATH="/home/user/.local/bin:$PATH"

# Đặt thư mục làm việc
WORKDIR /app

# Cài thư viện từ requirements.txt
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy toàn bộ mã nguồn
COPY --chown=user . /app

# Chạy ứng dụng FastAPI với uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
