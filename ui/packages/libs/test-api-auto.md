Đã suy nghĩ trong 5 giây
Tóm tắt chung
Để dùng Dredd kiểm thử tự động hợp đồng API cho một ứng dụng NestJS đã bật Swagger tại http://localhost:5000/api/#/, bạn cần trỏ Dredd vào file OpenAPI (JSON/YAML) mà NestJS sinh ra, chứ không phải UI của Swagger. Sau đó, cấu hình và chạy Dredd để nó tự gửi các request tới server và so khớp response với spec.

1. Xác định đường dẫn đến tài liệu OpenAPI của NestJS
   Theo [NestJS Swagger guide], sau khi bạn cấu hình SwaggerModule với:

ts
Sao chép
Chỉnh sửa
SwaggerModule.setup('api', app, documentFactory);
NestJS sẽ phục vụ JSON spec tại đường dẫn mặc định http://localhost:5000/api-json hoặc http://localhost:5000/api-docs tùy cấu hình
docs.nestjs.com
.

Lưu ý: URL http://localhost:5000/api/#/ chỉ là UI tương tác, không phải tài liệu spec thô. Dredd cần URL trả về JSON/YAML.

Bạn có thể kiểm tra spec bằng cách truy cập trực tiếp trong trình duyệt:

bash
Sao chép
Chỉnh sửa
http://localhost:5000/api-json
Nếu thấy nội dung JSON theo chuẩn OpenAPI, bạn đã có đúng endpoint để Dredd đọc.

2. Cài đặt Dredd
   Dredd là công cụ CLI, hỗ trợ OpenAPI 2/3 (Swagger) và API Blueprint
   Dredd
   .

Cài toàn cục qua npm:

bash
Sao chép
Chỉnh sửa
npm install -g dredd
hoặc nếu dùng Docker:

bash
Sao chép
Chỉnh sửa
docker pull apiaryio/dredd

````:contentReference[oaicite:2]{index=2}
3. Khởi tạo file cấu hình Dredd
Tại thư mục dự án (nơi chứa package.json), chạy:

bash
Sao chép
Chỉnh sửa
dredd init
Bạn sẽ được hỏi:

Path to API description file: nhập http://localhost:5000/api-json (hoặc URL spec của bạn).
YouTube

Server URL: nhập http://localhost:5000 để Dredd biết base URL cho mọi request.

Lệnh này sinh ra dredd.yml (hoặc dredd.json) với nội dung tương tự:

yaml
Sao chép
Chỉnh sửa
swagger: 'http://localhost:5000/api-json'
server: 'http://localhost:5000'
hooks: ./dredd-hooks.js   # nếu bạn dùng hook để setup/teardown
4. Chạy kiểm thử contract
Chỉ cần gõ:

bash
Sao chép
Chỉnh sửa
dredd
Dredd sẽ:

Đọc spec OpenAPI từ swagger (URL/spec-file).

Tự động sinh request cho từng path và method như GET, POST… trong spec.

So khớp status code, header và body schema với spec.

Báo lỗi chi tiết nếu có bất kỳ mismatch nào
Dredd
.

Bạn có thể thêm tuỳ chọn CLI:

--reporter html để xuất báo cáo HTML.

--parallel để chạy song song.

--dry-run chỉ in kế hoạch, không gửi request
Dredd
.

5. (Tùy chọn) Sử dụng Hooks để chuẩn bị dữ liệu
Nếu cần seed database hoặc dọn dẹp sau mỗi test, tạo file hook (ví dụ dredd-hooks.js):

js
Sao chép
Chỉnh sửa
const { before, after } = require('dredd');
before('Users > Create user', (transaction, done) => {
  // ví dụ: tạo sẵn một user trong DB
  seedUser().then(() => done());
});
after('Users > Delete user', (transaction, done) => {
  // dọn DB
  cleanUsers().then(() => done());
});
Rồi đảm bảo dredd.yml tham chiếu tới file này:

yaml
Sao chép
Chỉnh sửa
hooks: ./dredd-hooks.js
``` :contentReference[oaicite:6]{index=6}

---

## 6. Tích hợp vào CI/CD
Trong file cấu hình CI (GitHub Actions, Travis, CircleCI…), thêm bước:
```yaml
- name: Install Dredd
  run: npm install -g dredd@14.1.0 --no-optional
- name: Run Dredd contract tests
  run: dredd
Hoặc dùng Docker:

yaml
Sao chép
Chỉnh sửa
- name: Run Dredd in Docker
  run: |
    docker run --network host -v $PWD:/api -w /api apiaryio/dredd \
      dredd http://localhost:5000/api-json http://localhost:5000
Nếu Dredd phát hiện vi phạm spec, pipeline sẽ fail và ngăn deploy, đảm bảo API luôn nhất quán với tài liệu.

Tóm lại, để dùng Dredd với NestJS + Swagger:

Lấy URL spec JSON (ví dụ /api-json).

Cài Dredd và chạy dredd init, nhập spec URL và server URL.

Chạy dredd để tự động kiểm thử mọi endpoint.

(Tuỳ chọn) Thêm hooks và tích hợp CI/CD để tự động hóa hoàn toàn.

Với quy trình này, bạn sẽ dễ dàng phát hiện mọi mismatch giữa code và Swagger docs ngay trong giai đoạn build.






Nguồn





Liên hệ thêm

How to set up Dredd's hooks for NestJS?

What are common issues when running Dredd?

Can you explain how to integrate with Docker?
````
