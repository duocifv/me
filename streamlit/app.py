import streamlit as st

st.set_page_config(layout="centered")
st.title("🧠 Mô phỏng Hệ Tiêu Hóa Người (Canvas API)")

st.markdown("""
**Mô tả:**
- Miệng 👉 Thực quản 👉 Dạ dày 👉 Ruột non 👉 Ruột già  
- Viên thức ăn (🔵) di chuyển theo hành trình tiêu hóa  
- Vẽ bằng **Canvas API**
""")

html = """
<canvas id="digestiveCanvas" width="400" height="600" style="border:1px solid #ccc; background: #fdfdfd; margin-top:20px;"></canvas>

<script>
const canvas = document.getElementById("digestiveCanvas");
const ctx = canvas.getContext("2d");

// Vẽ sơ đồ hệ tiêu hóa đơn giản
function drawDigestiveSystem() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffc0cb"; // Miệng
    ctx.fillRect(180, 30, 40, 40);
    ctx.fillStyle = "black";
    ctx.fillText("Miệng", 180, 25);

    ctx.fillStyle = "#ffa07a"; // Thực quản
    ctx.fillRect(195, 70, 10, 60);
    ctx.fillText("Thực quản", 160, 100);

    ctx.beginPath(); // Dạ dày
    ctx.fillStyle = "#f4a460";
    ctx.ellipse(200, 160, 40, 30, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText("Dạ dày", 170, 160);

    ctx.beginPath(); // Ruột non
    ctx.fillStyle = "#f0e68c";
    ctx.moveTo(200, 200);
    ctx.bezierCurveTo(160, 230, 240, 270, 180, 300);
    ctx.bezierCurveTo(200, 330, 160, 360, 200, 390);
    ctx.stroke();
    ctx.fillText("Ruột non", 160, 310);

    ctx.beginPath(); // Ruột già
    ctx.strokeStyle = "#8fbc8f";
    ctx.moveTo(200, 390);
    ctx.lineTo(200, 500);
    ctx.stroke();
    ctx.fillText("Ruột già", 170, 490);
}

// Tạo path đơn giản di chuyển thức ăn
const path = [
    {x: 200, y: 50},  // miệng
    {x: 200, y: 100}, // thực quản
    {x: 200, y: 160}, // dạ dày
    {x: 180, y: 300}, // ruột non
    {x: 200, y: 390}, // ruột non
    {x: 200, y: 500}, // ruột già
];

let progress = 0;
function animate() {
    drawDigestiveSystem();

    // Tính vị trí viên thức ăn
    let i = Math.floor(progress);
    let t = progress - i;
    if (i >= path.length - 1) {
        progress = 0;
        requestAnimationFrame(animate);
        return;
    }

    let x = path[i].x * (1 - t) + path[i+1].x * t;
    let y = path[i].y * (1 - t) + path[i+1].y * t;

    // Vẽ viên thức ăn
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();

    progress += 0.01;
    requestAnimationFrame(animate);
}

drawDigestiveSystem();
animate();
</script>
"""

st.components.v1.html(html, height=700)
