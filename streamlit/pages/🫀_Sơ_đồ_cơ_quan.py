import streamlit as st
import plotly.graph_objects as go
import numpy as np

# ============================================================================
# CONFIGURATION & INITIALIZATION
# ============================================================================

# Initialize session state
if 'selected_organ' not in st.session_state:
    st.session_state.selected_organ = None

st.set_page_config(
    page_title="Sơ đồ cơ quan - CRUD App",
    layout="wide",
    initial_sidebar_state="expanded"
)

def load_custom_css():
    """Load custom CSS styles for the application"""
    st.markdown("""
        <style>
            .system-info {
                background-color: #f0f8ff;
                padding: 15px;
                border-radius: 10px;
                border-left: 4px solid #4CAF50;
                margin: 10px 0;
            }
            .organ-detail {
                background-color: #fff3cd;
                padding: 10px;
                border-radius: 8px;
                margin: 5px 0;
            }
        </style>
    """, unsafe_allow_html=True)

# ============================================================================
# DATA CONFIGURATION
# ============================================================================

# Dictionary chính: Hệ cơ quan → Danh sách cơ quan
ORGAN_SYSTEMS = {
    "Tim mạch": ["Tim", "Mạch máu chính", "Tĩnh mạch"],
    "Hô hấp": ["Phổi trái", "Phổi phải", "Khí quản", "Phế quản"],
    "Tiêu hóa": ["Gan", "Dạ dày", "Ruột non", "Ruột già"],
    "Thần kinh": ["Não", "Tủy sống", "Dây thần kinh"],
    "Cơ": ["Cơ tim", "Cơ vân", "Cơ trơn"],
    "Nội tiết": ["Tuyến giáp", "Tuyến thượng thận", "Tuyến tụy"],
    "Tiết niệu": ["Thận", "Bàng quang", "Niệu quản"],
    "Sinh sản": ["Buồng trứng", "Tử cung", "Tinh hoàn"]
}

# Dictionary chính: Hệ cơ quan → Danh sách cơ quan
ORGAN_SYSTEMS = {
    "Tim mạch": ["Tim", "Mạch máu chính", "Tĩnh mạch"],
    "Hô hấp": ["Phổi trái", "Phổi phải", "Khí quản", "Phế quản"],
    "Tiêu hóa": ["Gan", "Dạ dày", "Ruột non", "Ruột già"],
    "Thần kinh": ["Não", "Tủy sống", "Dây thần kinh"],
    "Cơ": ["Cơ tim", "Cơ vân", "Cơ trơn"],
    "Nội tiết": ["Tuyến giáp", "Tuyến thượng thận", "Tuyến tụy"],
    "Tiết niệu": ["Thận", "Bàng quang", "Niệu quản"],
    "Sinh sản": ["Buồng trứng", "Tử cung", "Tinh hoàn"]
}

# Thông tin chi tiết các hệ cơ quan
system_info = {
    "Tim mạch": {
        "color": "#e74c3c",
        "description": "Hệ tuần hoàn chịu trách nhiệm bơm máu khắp cơ thể",
        "function": "Vận chuyển oxy, chất dinh dưỡng và loại bỏ chất thải"
    },
    "Hô hấp": {
        "color": "#3498db", 
        "description": "Hệ hô hấp chịu trách nhiệm trao đổi khí",
        "function": "Hấp thụ oxy và thải carbon dioxide"
    },
    "Tiêu hóa": {
        "color": "#f39c12",
        "description": "Hệ tiêu hóa chịu trách nhiệm phân giải thức ăn",
        "function": "Tiêu hóa thức ăn, hấp thụ chất dinh dưỡng, giải độc"
    },
    "Thần kinh": {
        "color": "#9b59b6",
        "description": "Hệ thần kinh là trung tâm điều khiển cơ thể",
        "function": "Xử lý thông tin, điều khiển các hoạt động của cơ thể"
    },
    "Cơ": {
        "color": "#27ae60",
        "description": "Hệ cơ chịu trách nhiệm vận động",
        "function": "Tạo ra chuyển động, duy trì tư thế"
    },
    "Nội tiết": {
        "color": "#e67e22",
        "description": "Hệ nội tiết điều hòa các hoạt động cơ thể",
        "function": "Sản xuất và tiết ra hormone điều hòa"
    },
    "Tiết niệu": {
        "color": "#1abc9c",
        "description": "Hệ tiết niệu lọc và thải độc tố",
        "function": "Lọc máu, duy trì cân bằng nước và điện giải"
    },
    "Sinh sản": {
        "color": "#e91e63",
        "description": "Hệ sinh sản chịu trách nhiệm sinh sản",
        "function": "Tạo ra giao tử và duy trì nòi giống"
    }
}

# Dictionary chứa thông tin chi tiết về từng cơ quan
ORGAN_DETAILS = {
    "Tim": {
        "name": "Tim",
        "structure": "Tim gồm 4 buồng: 2 tâm nhĩ (trái, phải) và 2 tâm thất (trái, phải). Có 4 van tim: van 3 lá, van phổi, van 2 lá, van động mạch chủ.",
        "function": "Tim bơm máu theo nhịp, trung bình 70 bpm ở người trưởng thành. Tâm thất trái bơm máu giàu oxy đi khắp cơ thể, tâm thất phải bơm máu về phổi để trao đổi khí.",
        "facts": [
            "Bơm khoảng 5 lít máu mỗi phút",
            "Đập khoảng 100,000 lần mỗi ngày",
            "Nặng khoảng 250-350 gram",
            "Có thể hoạt động độc lập nhờ hệ dẫn truyền điện"
        ],
        "diseases": ["Nhồi máu cơ tim", "Suy tim", "Rối loạn nhịp tim", "Bệnh van tim"]
    },
    "Phổi trái": {
        "name": "Phổi trái",
        "structure": "Phổi trái có 2 thùy (thùy trên và thùy dưới), nhỏ hơn phổi phải do tim chiếm chỗ. Gồm phế quản, phế quản nhỏ và khoảng 300 triệu phế nang.",
        "function": "Trao đổi khí: hấp thụ oxy từ không khí vào máu và thải carbon dioxide từ máu ra ngoài. Điều hòa pH máu và nhiệt độ cơ thể.",
        "facts": [
            "Diện tích trao đổi khí khoảng 70m²",
            "Thở khoảng 20,000 lần mỗi ngày",
            "Chứa khoảng 300 triệu phế nang",
            "Có thể hoạt động với chỉ 1 phổi"
        ],
        "diseases": ["Viêm phổi", "Hen suyễn", "COPD", "Ung thư phổi"]
    },
    "Phổi phải": {
        "name": "Phổi phải", 
        "structure": "Phổi phải có 3 thùy (thùy trên, thùy giữa, thùy dưới), lớn hơn phổi trái. Cấu trúc tương tự phổi trái với hệ thống phế quản và phế nang.",
        "function": "Tương tự phổi trái, tham gia trao đổi khí và điều hòa cân bằng acid-base trong máu. Phổi phải xử lý lượng không khí lớn hơn do kích thước.",
        "facts": [
            "Lớn hơn phổi trái khoảng 10%",
            "Có 3 thùy thay vì 2 thùy như phổi trái",
            "Xử lý khoảng 55% lượng không khí",
            "Có khả năng tái tạo một phần khi bị tổn thương"
        ],
        "diseases": ["Viêm phổi", "Tràn dịch màng phổi", "Khí phế thũng", "Xơ phổi"]
    },
    "Gan": {
        "name": "Gan",
        "structure": "Gan là cơ quan lớn nhất trong cơ thể, nặng khoảng 1.5kg. Gồm 2 thùy chính (trái, phải) và hàng triệu tế bào gan (hepatocyte).",
        "function": "Thực hiện hơn 500 chức năng: giải độc, sản xuất protein, tổng hợp cholesterol, chuyển hóa đường, protein, lipid. Sản xuất mật để tiêu hóa chất béo.",
        "facts": [
            "Cơ quan nội tạng lớn nhất (1.5kg)",
            "Có thể tái tạo 75% khối lượng khi bị cắt",
            "Xử lý 1.5 lít máu mỗi phút",
            "Thực hiện hơn 500 chức năng sinh hóa"
        ],
        "diseases": ["Viêm gan", "Xơ gan", "Ung thư gan", "Gan nhiễm mỡ"]
    },
    "Não": {
        "name": "Não",
        "structure": "Não gồm 3 phần chính: não trước (đại não), não giữa, não sau (tiểu não, thân não). Có khoảng 86 tỷ tế bào thần kinh (neuron).",
        "function": "Trung tâm điều khiển toàn bộ cơ thể: xử lý thông tin, điều khiển vận động, cảm giác, tư duy, trí nhớ, cảm xúc. Tiêu thụ 20% năng lượng cơ thể.",
        "facts": [
            "Chứa 86 tỷ tế bào thần kinh",
            "Tiêu thụ 20% năng lượng cơ thể",
            "Nặng khoảng 1.4kg",
            "Xử lý thông tin với tốc độ 120 m/s"
        ],
        "diseases": ["Đột quỵ", "Alzheimer", "Parkinson", "Động kinh"]
    },
    "Thận": {
        "name": "Thận trái",
        "structure": "Thận có dạng hạt đậu, dài khoảng 12cm. Gồm vỏ thận (cortex) và tủy thận (medulla), chứa khoảng 1 triệu đơn vị lọc (nephron).",
        "function": "Lọc máu, loại bỏ chất thải qua nước tiểu. Điều hòa cân bằng nước, điện giải, pH máu. Sản xuất hormone điều hòa huyết áp và tạo hồng cầu.",
        "facts": [
            "Lọc 180 lít máu mỗi ngày",
            "Chứa 1 triệu đơn vị lọc (nephron)",
            "Sản xuất 1-2 lít nước tiểu/ngày",
            "Có thể sống khỏe với 1 thận"
        ],
        "diseases": ["Suy thận", "Sỏi thận", "Viêm thận", "Bệnh thận đa nang"]
    },
    "Thận phải": {
        "name": "Thận phải",
        "structure": "Cấu trúc tương tự thận trái, nhưng thường thấp hơn 1-2cm do gan nằm phía trên. Có cùng số lượng nephron và chức năng.",
        "function": "Chức năng tương tự thận trái: lọc máu, điều hòa cân bằng nước-muối, sản xuất hormone. Hai thận hoạt động phối hợp để duy trì homeostasis.",
        "facts": [
            "Thấp hơn thận trái 1-2cm",
            "Cùng khả năng lọc với thận trái",
            "Có thể bù trừ khi thận trái bị bệnh",
            "Vị trí gần gan và ruột già"
        ],
        "diseases": ["Suy thận", "Nhiễm trùng đường tiết niệu", "Ung thư thận", "Tăng huyết áp thận"]
    },
    "Tuyến giáp": {
        "name": "Tuyến giáp",
        "structure": "Tuyến giáp có hình con bướm, nằm trước khí quản. Gồm 2 thùy nối với nhau bởi eo giáp. Chứa các nang giáp (follicle) sản xuất hormone.",
        "function": "Sản xuất hormone giáp (T3, T4) điều hòa trao đổi chất, nhiệt độ cơ thể, nhịp tim. Sản xuất calcitonin điều hòa canxi máu.",
        "facts": [
            "Nặng khoảng 15-25 gram",
            "Sản xuất 80% T4 và 20% T3",
            "Cần iod để sản xuất hormone",
            "Ảnh hưởng đến mọi tế bào trong cơ thể"
        ],
        "diseases": ["Cường giáp", "Suy giáp", "Bướu giáp", "Ung thư giáp"]
    }
}

# Load CSS và setup giao diện
load_custom_css()

st.title("🫀 Sơ đồ Cơ quan Cơ thể Người")
st.write("Sơ đồ 2D đơn giản các cơ quan chính trong cơ thể")

# Sidebar với các hệ cơ quan
st.sidebar.title("🧭 Hệ Cơ quan")
st.sidebar.write("Chọn hệ cơ quan để tìm hiểu:")

# Các nút hệ cơ quan - sử dụng keys từ ORGAN_SYSTEMS dict
system_options = ["Tất cả"] + list(ORGAN_SYSTEMS.keys())
selected_system = st.sidebar.radio(
    "Chọn hệ:",
    system_options,
    index=0
)

# Hiển thị thông tin hệ cơ quan được chọn
if selected_system != "Tất cả":
    info = system_info[selected_system]
    organs_list = ORGAN_SYSTEMS[selected_system]
    st.sidebar.markdown(f"""
    <div class="system-info">
        <h4>🔍 {selected_system}</h4>
        <p><strong>Mô tả:</strong> {info['description']}</p>
        <p><strong>Chức năng:</strong> {info['function']}</p>
        <p><strong>Cơ quan chính:</strong> {', '.join(organs_list)}</p>
        <p><strong>Số lượng cơ quan:</strong> {len(organs_list)}</p>
    </div>
    """, unsafe_allow_html=True)

# Tạo sơ đồ cơ quan 2D với animation và interactive highlight
def create_organ_diagram(highlight_system=None):
    fig = go.Figure()
    
    # Định nghĩa vị trí và thuộc tính các cơ quan (mở rộng thêm cơ quan)
    organs = {
        "Tim": {
            "shape": "triangle",
            "x": 0.45, "y": 0.6,
            "size": 0.1,
            "system": "Tim mạch",
            "color": "#e74c3c",
            "info": "Cơ quan bơm máu"
        },
        "Phổi_trái": {
            "shape": "ellipse", 
            "x": 0.35, "y": 0.65,
            "width": 0.15, "height": 0.25,
            "system": "Hô hấp",
            "color": "#3498db",
            "info": "Trao đổi khí bên trái"
        },
        "Phổi_phải": {
            "shape": "ellipse",
            "x": 0.65, "y": 0.65, 
            "width": 0.15, "height": 0.25,
            "system": "Hô hấp",
            "color": "#3498db",
            "info": "Trao đổi khí bên phải"
        },
        "Gan": {
            "shape": "rectangle",
            "x": 0.55, "y": 0.4,
            "width": 0.18, "height": 0.12,
            "system": "Tiêu hóa", 
            "color": "#f39c12",
            "info": "Cơ quan giải độc và tiêu hóa"
        },
        "Não": {
            "shape": "ellipse",
            "x": 0.5, "y": 0.85,
            "width": 0.2, "height": 0.15,
            "system": "Thần kinh",
            "color": "#9b59b6",
            "info": "Trung tâm điều khiển"
        },
        "Thận": {
            "shape": "ellipse",
            "x": 0.4, "y": 0.3,
            "width": 0.08, "height": 0.12,
            "system": "Tiết niệu",
            "color": "#1abc9c",
            "info": "Lọc máu và tạo nước tiểu"
        },
        "Thận_phải": {
            "shape": "ellipse",
            "x": 0.6, "y": 0.3,
            "width": 0.08, "height": 0.12,
            "system": "Tiết niệu",
            "color": "#1abc9c",
            "info": "Lọc máu và tạo nước tiểu"
        },
        "Tuyến_giáp": {
            "shape": "rectangle",
            "x": 0.5, "y": 0.75,
            "width": 0.06, "height": 0.04,
            "system": "Nội tiết",
            "color": "#e67e22",
            "info": "Điều hòa trao đổi chất"
        }
    }
    
    # Vẽ khung cơ thể
    body_x = [0.25, 0.25, 0.3, 0.35, 0.4, 0.6, 0.65, 0.7, 0.75, 0.75, 0.7, 0.65, 0.6, 0.4, 0.35, 0.3, 0.25]
    body_y = [0.05, 0.25, 0.45, 0.65, 0.8, 0.8, 0.65, 0.45, 0.25, 0.05, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.05]
    
    fig.add_trace(go.Scatter(
        x=body_x, y=body_y,
        mode='lines',
        line=dict(color='#2c3e50', width=3),
        name='Khung cơ thể',
        showlegend=False,
        hoverinfo='skip'
    ))
    
    # Vẽ các cơ quan với logic highlight và animation
    for organ_name, organ in organs.items():
        # Kiểm tra xem cơ quan có thuộc hệ được chọn không
        organ_display_name = organ_name.replace("_", " ")
        is_highlighted = False
        
        if highlight_system != "Tất cả" and highlight_system in ORGAN_SYSTEMS:
            selected_organs = ORGAN_SYSTEMS[highlight_system]
            # Kiểm tra tên cơ quan có trong danh sách không (flexible matching)
            for selected_organ in selected_organs:
                if (selected_organ.lower() in organ_display_name.lower() or 
                    organ_display_name.lower() in selected_organ.lower() or
                    organ["system"] == highlight_system):
                    is_highlighted = True
                    break
        
        # Xác định màu sắc và opacity với animation effect
        if highlight_system == "Tất cả" or highlight_system is None:
            color = organ["color"]
            opacity = 0.8
            line_width = 2
            marker_size = 1.0
        elif is_highlighted:
            # Highlighted organs: bright color with animation effect
            color = system_info[highlight_system]["color"]
            opacity = 1.0
            line_width = 4  # Thicker border for highlight
            marker_size = 1.2  # Slightly larger for emphasis
        else:
            # Non-highlighted organs: faded
            color = "#bdc3c7"
            opacity = 0.2
            line_width = 1
            marker_size = 0.9
            
        if organ["shape"] == "triangle":
            # Tim - hình tam giác với animation effect
            size = organ["size"] * marker_size
            x_tri = [organ["x"], organ["x"] - size/2, organ["x"] + size/2, organ["x"]]
            y_tri = [organ["y"] + size/2, organ["y"] - size/2, organ["y"] - size/2, organ["y"] + size/2]
            
            fig.add_trace(go.Scatter(
                x=x_tri, y=y_tri,
                fill='toself',
                fillcolor=color,
                opacity=opacity,
                line=dict(color=color, width=line_width),
                name=organ_name.replace("_", " "),
                hovertemplate=f"<b>{organ_name.replace('_', ' ')}</b><br>{organ['info']}<br>Hệ: {organ['system']}<extra></extra>",
                showlegend=True if is_highlighted or highlight_system == "Tất cả" else False
            ))
            
        elif organ["shape"] == "ellipse":
            # Phổi, Não, Thận - hình elip với animation effect
            theta = np.linspace(0, 2*np.pi, 50)
            width_scaled = organ["width"] * marker_size
            height_scaled = organ["height"] * marker_size
            x_ellipse = organ["x"] + (width_scaled/2) * np.cos(theta)
            y_ellipse = organ["y"] + (height_scaled/2) * np.sin(theta)
            
            fig.add_trace(go.Scatter(
                x=x_ellipse, y=y_ellipse,
                fill='toself',
                fillcolor=color,
                opacity=opacity,
                line=dict(color=color, width=line_width),
                name=organ_name.replace("_", " "),
                hovertemplate=f"<b>{organ_name.replace('_', ' ')}</b><br>{organ['info']}<br>Hệ: {organ['system']}<extra></extra>",
                showlegend=True if is_highlighted or highlight_system == "Tất cả" else False
            ))
            
        elif organ["shape"] == "rectangle":
            # Gan, Tuyến giáp - hình chữ nhật với animation effect
            w, h = (organ["width"] * marker_size)/2, (organ["height"] * marker_size)/2
            x_rect = [organ["x"] - w, organ["x"] + w, organ["x"] + w, organ["x"] - w, organ["x"] - w]
            y_rect = [organ["y"] - h, organ["y"] - h, organ["y"] + h, organ["y"] + h, organ["y"] - h]
            
            fig.add_trace(go.Scatter(
                x=x_rect, y=y_rect,
                fill='toself',
                fillcolor=color,
                opacity=opacity,
                line=dict(color=color, width=line_width),
                name=organ_name.replace("_", " "),
                hovertemplate=f"<b>{organ_name.replace('_', ' ')}</b><br>{organ['info']}<br>Hệ: {organ['system']}<extra></extra>",
                showlegend=True if is_highlighted or highlight_system == "Tất cả" else False
            ))
    
    # Cấu hình layout với animation
    title_text = f"🫀 Sơ đồ Cơ quan - {highlight_system if highlight_system != 'Tất cả' else 'Tổng quan'}"
    if highlight_system != "Tất cả" and highlight_system in system_info:
        title_text += f" <span style='color: {system_info[highlight_system]['color']}'>[Đang highlight]</span>"
    
    fig.update_layout(
        title=dict(
            text=title_text,
            x=0.5,
            font=dict(size=18, color="#2c3e50")
        ),
        xaxis=dict(
            range=[0, 1],
            showgrid=False,
            showticklabels=False,
            zeroline=False
        ),
        yaxis=dict(
            range=[0, 1],
            showgrid=False,
            showticklabels=False,
            zeroline=False,
            scaleanchor="x",
            scaleratio=1
        ),
        showlegend=True,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.1,
            xanchor="center",
            x=0.5,
            bgcolor="rgba(255,255,255,0.8)",
            bordercolor="rgba(0,0,0,0.2)",
            borderwidth=1
        ),
        plot_bgcolor='white',
        paper_bgcolor='white',
        height=650,
        margin=dict(l=50, r=50, t=100, b=80),
        # Animation configuration
        transition=dict(
            duration=500,
            easing="cubic-in-out"
        ),
        # Hover effects
        hovermode='closest'
    )
    
    return fig

# Hiển thị trạng thái highlight
if selected_system != "Tất cả":
    info = system_info[selected_system]
    organs_count = len(ORGAN_SYSTEMS[selected_system])
    st.info(f"🎯 **Đang highlight hệ {selected_system}** - {organs_count} cơ quan được làm nổi bật với màu {info['color']}")

# Tạo và hiển thị sơ đồ
col1, col2 = st.columns([3, 1])

with col1:
    fig = create_organ_diagram(selected_system)
    
    # Xử lý click events trên plotly chart
    clicked_data = st.plotly_chart(fig, use_container_width=True, key=f"organ_diagram_{selected_system}", on_select="rerun")
    
    # Buttons để click vào từng cơ quan (workaround cho plotly click event)
    st.markdown("### 🖱️ Click để tìm hiểu chi tiết:")
    organ_buttons_col1, organ_buttons_col2, organ_buttons_col3 = st.columns(3)
    
    with organ_buttons_col1:
        if st.button("🫀 Tim", key="btn_tim"):
            st.session_state.selected_organ = "Tim"
        if st.button("🧠 Não", key="btn_nao"):
            st.session_state.selected_organ = "Não"
        if st.button("🫁 Phổi trái", key="btn_phoi_trai"):
            st.session_state.selected_organ = "Phổi trái"
    
    with organ_buttons_col2:
        if st.button("🫁 Phổi phải", key="btn_phoi_phai"):
            st.session_state.selected_organ = "Phổi phải"
        if st.button("🟫 Gan", key="btn_gan"):
            st.session_state.selected_organ = "Gan"
        if st.button("🫘 Thận trái", key="btn_than_trai"):
            st.session_state.selected_organ = "Thận"
    
    with organ_buttons_col3:
        if st.button("🫘 Thận phải", key="btn_than_phai"):
            st.session_state.selected_organ = "Thận phải"
        if st.button("🦋 Tuyến giáp", key="btn_tuyen_giap"):
            st.session_state.selected_organ = "Tuyến giáp"
        if st.button("🔄 Reset", key="btn_reset"):
            st.session_state.selected_organ = None

with col2:
    st.subheader("📚 Thông tin Chi tiết")
    
    if selected_system == "Tất cả":
        st.markdown("""
        <div class="organ-detail">
        <h5>🫀 Hướng dẫn sử dụng:</h5>
        <ul>
        <li>Chọn hệ cơ quan từ sidebar</li>
        <li>Di chuột lên các cơ quan để xem thông tin</li>
        <li>Các hình dạng đại diện:</li>
        <ul>
        <li>🔺 Tam giác = Tim</li>
        <li>⭕ Elip = Phổi, Não</li>
        <li>⬜ Chữ nhật = Gan</li>
        </ul>
        </ul>
        </div>
        """, unsafe_allow_html=True)
    else:
        info = system_info[selected_system]
        organs_list = ORGAN_SYSTEMS[selected_system]
        st.markdown(f"""
        <div class="organ-detail">
        <h5>🔍 {selected_system}</h5>
        <p><strong>Cơ quan:</strong> {', '.join(organs_list)}</p>
        <p><strong>Chức năng:</strong> {info['function']}</p>
        <p><strong>Màu sắc:</strong> <span style="color: {info['color']}">●</span> {info['color']}</p>
        <p><strong>Tổng số:</strong> {len(organs_list)} cơ quan</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Thêm thông tin bổ sung
    st.markdown("""
    ### 📖 Kiến thức bổ sung:
    
    **🫀 Tim:** Bơm khoảng 5 lít máu/phút
    
    **🫁 Phổi:** Trao đổi 500ml khí/lần thở
    
    **🟫 Gan:** Lọc 1.5 lít máu/phút
    
    **🧠 Não:** Tiêu thụ 20% năng lượng cơ thể
    """)

# Hiển thị thông tin chi tiết về cơ quan được chọn
if st.session_state.selected_organ and st.session_state.selected_organ in ORGAN_DETAILS:
    organ_info = ORGAN_DETAILS[st.session_state.selected_organ]
    
    st.markdown("---")
    st.markdown(f"## 🔬 Chi tiết về {organ_info['name']}")
    
    # Tạo tabs cho thông tin chi tiết
    detail_tab1, detail_tab2, detail_tab3, detail_tab4 = st.tabs(["🏗️ Cấu tạo", "⚙️ Chức năng", "📊 Thông tin thú vị", "🏥 Bệnh lý"])
    
    with detail_tab1:
        st.markdown("### 🏗️ Cấu tạo")
        st.write(organ_info['structure'])
        
    with detail_tab2:
        st.markdown("### ⚙️ Nguyên lý hoạt động")
        st.write(organ_info['function'])
        
    with detail_tab3:
        st.markdown("### 📊 Những điều thú vị")
        for fact in organ_info['facts']:
            st.write(f"• {fact}")
            
    with detail_tab4:
        st.markdown("### 🏥 Các bệnh lý thường gặp")
        for disease in organ_info['diseases']:
            st.write(f"• {disease}")
    
    # Thêm nút đóng thông tin
    if st.button("❌ Đóng thông tin chi tiết", key="close_detail"):
        st.session_state.selected_organ = None
        st.rerun()

elif st.session_state.selected_organ:
    st.warning(f"⚠️ Không tìm thấy thông tin chi tiết cho cơ quan: {st.session_state.selected_organ}")

# Footer
st.markdown("---")
st.markdown("💡 **Ghi chú:** Đây là sơ đồ đơn giản hóa để học tập. Vị trí và kích thước các cơ quan chỉ mang tính chất minh họa.")
st.markdown("🖱️ **Hướng dẫn:** Click vào các nút cơ quan để xem thông tin chi tiết về cấu tạo và chức năng.")
