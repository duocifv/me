import streamlit as st
import plotly.graph_objects as go
import numpy as np

# ============================================================================
# CONFIGURATION & INITIALIZATION
# ============================================================================

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

ORGAN_SYSTEMS = {
    "Tim mạch": ["Tim", "Động mạch chủ", "Tĩnh mạch chủ", "Mao mạch"],
    "Hô hấp": ["Phổi trái", "Phổi phải", "Khí quản", "Phế quản trái", "Phế quản phải"],
    "Tiêu hóa": ["Thực quản", "Dạ dày", "Gan", "Tuyến tụy", "Ruột non", "Ruột già", "Trực tràng"],
    "Tiết niệu": ["Thận trái", "Thận phải", "Niệu quản", "Bàng quang"],
    "Thần kinh": ["Não", "Tủy sống", "Dây thần kinh cánh tay", "Dây thần kinh chân"],
    "Cơ": ["Cơ nhị đầu", "Cơ tam đầu", "Cơ tứ đầu đùi", "Cơ calf", "Cơ bụng", "Cơ ngực"],
    "Xương": ["Hộp sọ", "Cột sống", "Xương sườn", "Xương đòn", "Xương cánh tay", "Xương đùi", "Xương chày"],
    "Nội tiết": ["Tuyến giáp", "Tuyến thượng thận", "Tuyến tụy", "Tuyến yên"]
}

SYSTEM_INFO = {
    "Tim mạch": {"color": "#e74c3c", "description": "Hệ tuần hoàn bơm máu và vận chuyển chất dinh dưỡng khắp cơ thể", "function": "Cung cấp O2, chất dinh dưỡng và thu gom CO2, chất thải"},
    "Hô hấp": {"color": "#3498db", "description": "Hệ hô hấp thực hiện trao đổi khí O2/CO2", "function": "Hít O2 vào máu, thải CO2 ra ngoài qua phổi"},
    "Tiêu hóa": {"color": "#f39c12", "description": "Hệ tiêu hóa phân giải thức ăn thành chất dinh dưỡng", "function": "Tiêu hóa, hấp thụ chất dinh dưỡng và thải chất thừa"},
    "Tiết niệu": {"color": "#1abc9c", "description": "Hệ tiết niệu lọc máu và thải độc tố", "function": "Lọc máu, điều hòa nước-muối, thải độc tố qua nước tiểu"},
    "Thần kinh": {"color": "#9b59b6", "description": "Hệ thần kinh điều khiển và phối hợp mọi hoạt động", "function": "Xử lý thông tin, điều khiển vận động và các chức năng sống"},
    "Cơ": {"color": "#27ae60", "description": "Hệ cơ tạo ra chuyển động và duy trì tư thế", "function": "Co thắt tạo chuyển động, duy trì tư thế và sản sinh nhiệt"},
    "Xương": {"color": "#95a5a6", "description": "Hệ xương tạo khung xương và bảo vệ cơ quan", "function": "Hỗ trợ cấu trúc, bảo vệ cơ quan, sản xuất tế bào máu"},
    "Nội tiết": {"color": "#e67e22", "description": "Hệ nội tiết sản xuất hormone điều hòa cơ thể", "function": "Tiết hormone điều hòa trao đổi chất, tăng trưởng, sinh sản"}
}

# Dictionary giải thích cơ quan đơn giản cho học sinh/sinh viên
explanations = {
    # HỆ TIM MẠCH
    "Tim": "Tim bơm máu theo nhịp, gồm 4 buồng (2 tâm nhĩ, 2 tâm thất). Tim đập khoảng 70 lần/phút, bơm 5 lít máu/phút khắp cơ thể. Có 4 van tim kiểm soát dòng chảy máu một chiều.",
    "Động mạch chủ": "Động mạch chủ là mạch máu lớn nhất, vận chuyển máu giàu O2 từ tim đi khắp cơ thể. Đường kính 2-3cm, thành dày và đàn hồi chịu được áp lực cao từ tim.",
    "Tĩnh mạch chủ": "Tĩnh mạch chủ thu gom máu nghèo O2 từ khắp cơ thể về tim. Gồm tĩnh mạch chủ trên (từ đầu, cánh tay) và dưới (từ bụng, chân). Thành mỏng, có van một chiều.",
    "Mao mạch": "Mao mạch là những ống máu nhỏ nhất (5-10 micromet), nối động mạch với tĩnh mạch. Tại đây xảy ra trao đổi O2, CO2, chất dinh dưỡng giữa máu và tế bào.",
    
    # HỆ HÔ HẤP
    "Phổi trái": "Phổi trái thực hiện hô hấp, trao đổi O2/CO2 qua 300 triệu phế nang. Có 2 thùy, nhỏ hơn phổi phải để nhường chỗ cho tim. Diện tích trao đổi khí bằng sân tennis.",
    "Phổi phải": "Phổi phải có 3 thùy, lớn hơn phổi trái 10%. Chứa 400 triệu phế nang để trao đổi O2/CO2. Cùng với phổi trái thở 20,000 lần/ngày, xử lý 10,000 lít khí.",
    "Khí quản": "Khí quản là ống dẫn khí chính dài 10-12cm, nối họng với phế quản. Thành có sụn hình chữ C giữ ống luôn mở. Niêm mạc có lông chuyển đẩy bụi bẩn ra ngoài.",
    "Phế quản trái": "Phế quản trái dẫn khí vào phổi trái, chia thành nhiều nhánh nhỏ dần. Thành có sụn và cơ trơn điều chỉnh đường kính, kiểm soát lưu lượng khí vào phổi.",
    "Phế quản phải": "Phế quản phải dẫn khí vào phổi phải, ngắn và rộng hơn phế quản trái. Chia thành 3 nhánh chính cho 3 thùy phổi phải. Dễ bị dị vật mắc kẹt do góc nghiêng ít.",
    
    # HỆ TIÊU HÓA
    "Thực quản": "Thực quản là ống cơ dài 25cm nối họng với dạ dày. Thành có cơ vân co bóp đẩy thức ăn xuống dạ dày (nhu động). Đi qua cơ hoành tại lỗ thực quản.",
    "Dạ dày": "Dạ dày tiêu hóa thức ăn bằng acid HCl (pH 1.5-2) và enzyme pepsin. Co bóp trộn thức ăn thành chyme. Chứa 1-1.5 lít, niêm mạc tái tạo 3-5 ngày/lần.",
    "Gan": "Gan là cơ quan lớn nhất (1.5kg), thực hiện 500+ chức năng: giải độc, sản xuất protein máu, tổng hợp cholesterol, lưu trữ glycogen, sản xuất mật. Có thể tái tạo 75% khối lượng.",
    "Tuyến tụy": "Tuyến tụy sản xuất enzyme tiêu hóa (lipase, amylase, protease) và hormone insulin điều hòa đường máu. Dài 15cm, nặng 80g, nằm sau dạ dày.",
    "Ruột non": "Ruột non dài 6-7m, hấp thụ 90% chất dinh dưỡng qua hàng triệu lông chuyển (villi). Chia 3 đoạn: tá tràng (tiêu hóa), hỗng tràng và hồi tràng (hấp thụ).",
    "Ruột già": "Ruột già dài 1.5m, hấp thụ nước (1-2 lít/ngày) và tạo phân. Chứa 100 tỷ vi khuẩn có lợi sản xuất vitamin K, giúp tiêu hóa và tăng cường miễn dịch.",
    "Trực tràng": "Trực tràng là đoạn cuối ruột già dài 12cm, chứa phân trước khi thải ra. Có nhiều mạch máu và dây thần kinh, thành có cơ vòng kiểm soát việc đại tiện.",
    
    # HỆ TIẾT NIỆU
    "Thận trái": "Thận trái lọc máu và sản xuất nước tiểu. Có 1 triệu nephron lọc 180 lít máu/ngày, tạo 1-2 lít nước tiểu. Điều hòa nước, muối, pH máu và huyết áp.",
    "Thận phải": "Thận phải thấp hơn thận trái 2-3cm do gan đè. Cùng chức năng với thận trái: lọc máu, thải độc tố, điều hòa cân bằng nước-điện giải, sản xuất hormone tạo máu.",
    "Niệu quản": "Niệu quản là ống cơ dài 25-30cm dẫn nước tiểu từ thận xuống bàng quang. Co bóp nhu động đẩy nước tiểu, có van một chiều ngăn nước tiểu trào ngược.",
    "Bàng quang": "Bàng quang chứa nước tiểu (400-600ml), thành có cơ co bóp để tiểu. Niêm mạc giãn nở đặc biệt, có thể tăng gấp 10 lần kích thước khi đầy.",
    
    # HỆ THẦN KINH
    "Não": "Não gồm 100 tỷ tế bào thần kinh, điều khiển tư duy, cảm xúc, trí nhớ, vận động. Tiêu thụ 20% năng lượng cơ thể, xử lý thông tin với tốc độ ánh sáng.",
    "Tủy sống": "Tủy sống dài 45cm, truyền tín hiệu giữa não và cơ thể. Được bảo vệ bởi cột sống, chứa 31 cặp dây thần kinh tủy sống. Điều khiển phản xạ tự động.",
    "Dây thần kinh cánh tay": "Dây thần kinh cánh tay truyền tín hiệu giữa não và cánh tay. Điều khiển vận động cơ bắp tay, cảm giác xúc giác, đau, nhiệt độ từ da và cơ cánh tay.",
    "Dây thần kinh chân": "Dây thần kinh chân truyền tín hiệu giữa tủy sống và chân. Điều khiển vận động đi lại, giữ thăng bằng, cảm giác từ da và cơ chân, phản xạ gân xanh.",
    
    # HỆ CƠ
    "Cơ nhị đầu": "Cơ nhị đầu (biceps) ở mặt trước cánh tay, có 2 đầu cơ. Co thắt để gập khuỷu tay và xoay cẳng tay. Là cơ vân, co thắt theo ý thức.",
    "Cơ tam đầu": "Cơ tam đầu (triceps) ở mặt sau cánh tay, có 3 đầu cơ. Co thắt để duỗi thẳng khuỷu tay, đối kháng với cơ nhị đầu. Chiếm 2/3 khối lượng cơ cánh tay.",
    "Cơ tứ đầu đùi": "Cơ tứ đầu đùi gồm 4 bó cơ ở mặt trước đùi. Co thắt để duỗi thẳng đầu gối, nâng đùi lên. Là nhóm cơ mạnh nhất cơ thể, quan trọng cho đi lại.",
    "Cơ calf": "Cơ calf (bắp chân) ở mặt sau cẳng chân, gồm cơ tràng chân và cơ cá. Co thắt để nhón chân, đẩy cơ thể lên khi đi bộ, chạy. Giúp bơm máu về tim.",
    "Cơ bụng": "Cơ bụng gồm nhiều lớp cơ bao quanh ổ bụng. Co thắt để cúi người, xoay thân, thở ra mạnh, ho, hắt hơi. Bảo vệ các cơ quan nội tạng trong ổ bụng.",
    "Cơ ngực": "Cơ ngực (pectoralis) là cơ lớn ở ngực, nối xương sườn với xương cánh tay. Co thắt để đưa cánh tay vào trong, đẩy vật. Quan trọng cho hô hấp sâu.",
    
    # HỆ XƯƠNG
    "Hộp sọ": "Hộp sọ gồm 22 xương liền nhau bảo vệ não. Xương chắc nhưng nhẹ, có các lỗ cho dây thần kinh và mạch máu. Xương trán, đỉnh, chẩm tạo thành vòm sọ.",
    "Cột sống": "Cột sống gồm 33 đốt sống (7 cổ, 12 ngực, 5 thắt lưng, 5 cùng, 4 cụt) bảo vệ tủy sống. Có cấu trúc cong tự nhiên hấp thụ lực tác động.",
    "Xương sườn": "12 cặp xương sườn tạo lồng ngực bảo vệ tim, phổi. 7 cặp đầu nối trực tiếp với xương ức, 3 cặp nối gián tiếp, 2 cặp cuối tự do (sườn trôi).",
    "Xương đòn": "Xương đòn nối vai với lồng ngực, duy nhất nối cánh tay với thân mình. Dài 12-15cm, hình chữ S, dễ gãy khi ngã tay chống đất.",
    "Xương cánh tay": "Xương cánh tay (humerus) là xương dài nhất cánh tay, nối vai với khuỷu tay. Đầu trên khớp với xương vai, đầu dưới khớp với xương cẳng tay.",
    "Xương đùi": "Xương đùi (femur) là xương dài và mạnh nhất cơ thể, chịu được lực gấp 30 lần trọng lượng cơ thể. Nối hông với đầu gối, quan trọng cho việc đi lại.",
    "Xương chày": "Xương chày (tibia) là xương lớn ở cẳng chân, chịu trọng lượng cơ thể. Nối đầu gối với mắt cá chân, có mào xương chày sờ được ở mặt trước.",
    
    # HỆ NỘI TIẾT
    "Tuyến giáp": "Tuyến giáp hình cánh bướm ở cổ, sản xuất hormone T3, T4 điều hòa trao đổi chất, nhiệt độ, nhịp tim. Nặng 15-25g, cần iod để hoạt động.",
    "Tuyến thượng thận": "Tuyến thượng thận nằm trên đỉnh thận, sản xuất hormone cortisol (chống stress), adrenaline (phản ứng khẩn cấp), aldosterone (điều hòa muối).",
    "Tuyến tụy": "Tuyến tụy vừa tiết enzyme tiêu hóa, vừa sản xuất hormone insulin và glucagon điều hòa đường máu. Đảo Langerhans chứa tế bào beta sản xuất insulin.",
    "Tuyến yên": "Tuyến yên nhỏ như hạt đậu ở đáy não, được gọi là 'tuyến chủ'. Sản xuất hormone tăng trưởng, prolactin, và điều khiển các tuyến nội tiết khác."
}

# Dictionary chi tiết cho tabs (giữ nguyên cấu trúc cũ để tương thích)
ORGAN_DETAILS = {
    "Tim": {
        "name": "Tim",
        "structure": "Tim gồm 4 buồng: 2 tâm nhĩ (trái, phải) và 2 tâm thất (trái, phải). Có 4 van tim kiểm soát dòng chảy máu.",
        "function": "Tim bơm máu theo nhịp, trung bình 70 bpm ở người trưởng thành. Bơm khoảng 5 lít máu mỗi phút khắp cơ thể.",
        "facts": ["Bơm khoảng 5 lít máu mỗi phút", "Đập khoảng 100,000 lần mỗi ngày", "Cơ tim không bao giờ nghỉ ngơi", "Có hệ thống dẫn truyền điện riêng"],
        "diseases": ["Nhồi máu cơ tim", "Suy tim", "Rối loạn nhịp tim", "Bệnh van tim"]
    },
    "Phổi trái": {
        "name": "Phổi trái", 
        "structure": "Phổi trái có 2 thùy, chứa khoảng 300 triệu phế nang (túi khí nhỏ) để trao đổi khí.",
        "function": "Thực hiện trao đổi khí O2/CO2 qua màng phế nang mỏng. Cung cấp O2 cho máu, thải CO2 ra ngoài.",
        "facts": ["Có 2 thùy (ít hơn phổi phải)", "Diện tích trao đổi khí bằng sân tennis", "Thở 20,000 lần/ngày", "Chứa 300 triệu phế nang"],
        "diseases": ["Viêm phổi", "Hen suyễn", "Lao phổi", "Ung thư phổi"]
    },
    "Phổi phải": {
        "name": "Phổi phải",
        "structure": "Phổi phải có 3 thùy, lớn hơn phổi trái, chứa khoảng 400 triệu phế nang để trao đổi khí.",
        "function": "Thực hiện trao đổi khí O2/CO2 qua màng phế nang mỏng. Cung cấp O2 cho máu, thải CO2 ra ngoài.",
        "facts": ["Có 3 thùy (nhiều hơn phổi trái)", "Lớn hơn phổi trái 10%", "Chứa 400 triệu phế nang", "Diện tích trao đổi khí rất lớn"],
        "diseases": ["Viêm phổi", "Hen suyễn", "Lao phổi", "Ung thư phổi"]
    },
    "Gan": {
        "name": "Gan",
        "structure": "Gan là cơ quan lớn nhất trong cơ thể, nặng khoảng 1.5kg, có 2 thùy chính và hàng tỷ tế bào gan.",
        "function": "Thực hiện hơn 500 chức năng: giải độc, sản xuất protein máu, tổng hợp cholesterol, lưu trữ glycogen, sản xuất mật.",
        "facts": ["Cơ quan nội tạng lớn nhất (1.5kg)", "Có thể tái tạo 75% khối lượng", "Thực hiện 500+ chức năng", "Sản xuất 1 lít mật/ngày"],
        "diseases": ["Viêm gan", "Xơ gan", "Ung thư gan", "Gan nhiễm mỡ"]
    },
    "Não": {
        "name": "Não",
        "structure": "Não gồm 100 tỷ tế bào thần kinh, chia thành vỏ não, thân não, tiểu não. Nặng khoảng 1.4kg.",
        "function": "Điều khiển tư duy, cảm xúc, trí nhớ, vận động, các chức năng sống cơ bản như hô hấp, nhịp tim.",
        "facts": ["100 tỷ tế bào thần kinh", "Tiêu thụ 20% năng lượng cơ thể", "Xử lý thông tin với tốc độ ánh sáng", "Không có thụ thể đau"],
        "diseases": ["Đột quỵ", "Alzheimer", "Parkinson", "Động kinh"]
    },
    "Thận": {
        "name": "Thận",
        "structure": "Mỗi thận có 1 triệu đơn vị lọc (nephron), dài khoảng 12cm, nặng 150g.",
        "function": "Lọc máu, thải độc tố qua nước tiểu. Điều hòa nước, muối, pH máu. Sản xuất hormone điều hòa huyết áp.",
        "facts": ["Lọc 180 lít máu/ngày", "1 triệu nephron/thận", "Sản xuất 1-2 lít nước tiểu/ngày", "Điều hòa huyết áp"],
        "diseases": ["Suy thận", "Sỏi thận", "Viêm thận", "Bệnh thận đa nang"]
    },
    "Dạ dày": {
        "name": "Dạ dày", 
        "structure": "Dạ dày có dạng túi co giãn, thành có 3 lớp cơ, niêm mạc có hàng triệu tuyến tiết acid.",
        "function": "Tiêu hóa thức ăn bằng acid HCl và enzyme pepsin. Co bóp trộn thức ăn thành chất lỏng (chyme).",
        "facts": ["Chứa 1-1.5 lít thức ăn", "Niêm mạc tái tạo 3-5 ngày/lần", "Tiết 2-3 lít dịch dạ dày/ngày", "pH acid rất thấp (1.5-2)"],
        "diseases": ["Loét dạ dày", "Viêm dạ dày", "Ung thư dạ dày", "Trào ngược dạ dày"]
    },
    "Tuyến giáp": {
        "name": "Tuyến giáp",
        "structure": "Tuyến giáp có hình cánh bướm, nặng 15-25g, gồm 2 thùy nối bởi eo giáp.",
        "function": "Sản xuất hormone T3, T4 điều hòa trao đổi chất, nhiệt độ cơ thể, nhịp tim. Sản xuất calcitonin điều hòa canxi.",
        "facts": ["Nặng 15-25g", "Sản xuất 80% T4, 20% T3", "Cần iod để sản xuất hormone", "Ảnh hưởng đến mọi tế bào"],
        "diseases": ["Cường giáp", "Suy giáp", "Bướu giáp", "Ung thư giáp"]
    },
    "Bàng quang": {
        "name": "Bàng quang",
        "structure": "Bàng quang là túi cơ co giãn, có thể chứa 400-600ml nước tiểu, thành có nhiều lớp cơ.",
        "function": "Chứa nước tiểu từ thận, co bóp để đẩy nước tiểu ra ngoài qua niệu đạo khi cần thiết.",
        "facts": ["Chứa 400-600ml nước tiểu", "Niêm mạc giãn nở đặc biệt", "Co bóp khi đầy 200-300ml", "Kiểm soát bởi hệ thần kinh"],
        "diseases": ["Viêm bàng quang", "Sỏi bàng quang", "Ung thư bàng quang", "Bàng quang tăng động"]
    },
    "Ruột non": {
        "name": "Ruột non",
        "structure": "Ruột non dài 6-7m, có hàng triệu lông chuyển (villi) và vi lông chuyển tăng diện tích hấp thụ.",
        "function": "Hấp thụ chất dinh dưỡng từ thức ăn đã tiêu hóa. Hoàn tất quá trình tiêu hóa protein, carbohydrate, lipid.",
        "facts": ["Dài 6-7m", "Diện tích hấp thụ = sân tennis", "Hàng triệu lông chuyển", "Hấp thụ 90% chất dinh dưỡng"],
        "diseases": ["Viêm ruột", "Hội chứng ruột kích thích", "Bệnh Crohn", "Tắc ruột"]
    },
    "Ruột già": {
        "name": "Ruột già",
        "structure": "Ruột già dài 1.5m, đường kính lớn hơn ruột non, có các túi nhỏ (haustra) và dải cơ dọc.",
        "function": "Hấp thụ nước và muối từ chất thải, tạo phân. Chứa hàng tỷ vi khuẩn có lợi giúp tiêu hóa.",
        "facts": ["Dài 1.5m", "Chứa 100 tỷ vi khuẩn", "Hấp thụ 1-2 lít nước/ngày", "Sản xuất vitamin K"],
        "diseases": ["Viêm đại tràng", "Hội chứng ruột kích thích", "Ung thư đại tràng", "Táo bón"]
    },
    
    # HỆ TIM MẠCH (bổ sung)
    "Động mạch chủ": {
        "name": "Động mạch chủ",
        "structure": "Động mạch lớn nhất, đường kính 2-3cm, thành dày 3 lớp với cơ trơn và mô đàn hồi.",
        "function": "Vận chuyển máu giàu O2 từ thất trái tim đi khắp cơ thể với áp lực cao.",
        "facts": ["Áp lực tối đa 120mmHg", "Thành đàn hồi", "Dài khoảng 35cm", "Chia thành động mạch chủ lên và xuống"],
        "diseases": ["Phình động mạch chủ", "Bóc tách động mạch chủ", "Xơ vữa động mạch", "Hẹp động mạch chủ"]
    },
    "Tĩnh mạch chủ": {
        "name": "Tĩnh mạch chủ",
        "structure": "Gồm tĩnh mạch chủ trên và dưới, thành mỏng, có van một chiều ngăn máu trào ngược.",
        "function": "Thu gom máu nghèo O2 từ khắp cơ thể về tâm nhĩ phải với áp lực thấp.",
        "facts": ["Áp lực 2-8mmHg", "Chứa 70% lượng máu", "Có van một chiều", "Đường kính lớn"],
        "diseases": ["Suy tĩnh mạch", "Huyết khối tĩnh mạch", "Giãn tĩnh mạch", "Viêm tĩnh mạch"]
    },
    "Mao mạch": {
        "name": "Mao mạch",
        "structure": "Ống máu nhỏ nhất (5-10 micromet), thành chỉ có 1 lớp tế bào nội mô.",
        "function": "Trao đổi O2, CO2, chất dinh dưỡng giữa máu và tế bào qua thành mỏng.",
        "facts": ["Nhỏ hơn sợi tóc 10 lần", "Tổng chiều dài 100,000km", "Diện tích trao đổi 600m²", "Mật độ cao ở não, cơ, phổi"],
        "diseases": ["Rối loạn vi tuần hoàn", "Xuất huyết mao mạch", "Tắc mao mạch", "Viêm mao mạch"]
    },
    
    # HỆ HÔ HẤP (bổ sung)
    "Khí quản": {
        "name": "Khí quản",
        "structure": "Ống dẫn khí dài 10-12cm, đường kính 2cm, thành có 15-20 vòng sụn hình chữ C.",
        "function": "Dẫn khí từ họng xuống phế quản. Lông chuyển và chất nhầy làm sạch không khí.",
        "facts": ["15-20 vòng sụn hình C", "Lông chuyển đập 1000 lần/phút", "Tiết 100ml chất nhầy/ngày", "Phản xạ ho bảo vệ"],
        "diseases": ["Viêm khí quản", "Hẹp khí quản", "Ung thư khí quản", "Dị vật khí quản"]
    },
    "Phế quản trái": {
        "name": "Phế quản trái",
        "structure": "Nhánh trái của khí quản, dài và hẹp hơn phế quản phải, góc nghiêng 45°.",
        "function": "Dẫn khí vào phổi trái, điều chỉnh lưu lượng khí bằng cơ trơn.",
        "facts": ["Góc nghiêng 45°", "Dài hơn phế quản phải", "Chia thành 2 nhánh chính", "Có cơ trơn điều chỉnh"],
        "diseases": ["Viêm phế quản", "Hen phế quản", "Tắc phế quản", "Co thắt phế quản"]
    },
    "Phế quản phải": {
        "name": "Phế quản phải",
        "structure": "Nhánh phải của khí quản, ngắn và rộng hơn phế quản trái, góc nghiêng 25°.",
        "function": "Dẫn khí vào phổi phải, dễ bị dị vật mắc kẹt do góc nghiêng ít.",
        "facts": ["Góc nghiêng 25°", "Ngắn và rộng hơn phế quản trái", "Chia thành 3 nhánh chính", "Dễ bị dị vật mắc kẹt"],
        "diseases": ["Viêm phế quản", "Dị vật phế quản", "Hen phế quản", "Tắc phế quản"]
    },
    
    # HỆ TIÊU HÓA (bổ sung)
    "Thực quản": {
        "name": "Thực quản",
        "structure": "Ống cơ dài 25cm, đường kính 2cm, thành có 2 lớp cơ: vân (trên) và trơn (dưới).",
        "function": "Vận chuyển thức ăn từ họng xuống dạ dày bằng nhu động. Có 2 cơ thắt kiểm soát.",
        "facts": ["Dài 25cm", "Nhu động 3-5cm/giây", "2 cơ thắt trên và dưới", "Đi qua 3 vùng: cổ, ngực, bụng"],
        "diseases": ["Trào ngược thực quản", "Ung thư thực quản", "Viêm thực quản", "Hẹp thực quản"]
    },
    "Tuyến tụy": {
        "name": "Tuyến tụy",
        "structure": "Tuyến dài 15cm, nặng 80g, có đầu, thân, đuôi. Chứa tế bào ngoại tiết và đảo Langerhans.",
        "function": "Tiết enzyme tiêu hóa và hormone (insulin, glucagon) điều hòa đường máu.",
        "facts": ["Tiết 1.5 lít dịch tụy/ngày", "1-2 triệu đảo Langerhans", "pH dịch tụy = 8.5", "Enzyme hoạt động ở ruột non"],
        "diseases": ["Viêm tụy", "Ung thư tụy", "Đái tháo đường", "Suy tụy ngoại tiết"]
    },
    "Trực tràng": {
        "name": "Trực tràng",
        "structure": "Đoạn cuối ruột già dài 12cm, thành có nhiều nếp gấp, 2 cơ thắt: trong và ngoài.",
        "function": "Chứa phân trước khi thải, có thụ thể cảm nhận độ đầy, cơ thắt kiểm soát đại tiện.",
        "facts": ["Dài 12cm", "Chứa được 100-200ml phân", "2 cơ thắt kiểm soát", "Nhiều mạch máu và thần kinh"],
        "diseases": ["Trĩ", "Ung thư trực tràng", "Viêm trực tràng", "Rò trực tràng"]
    },
    
    # HỆ TIẾT NIỆU (bổ sung)
    "Thận trái": {
        "name": "Thận trái",
        "structure": "Hình hạt đậu, dài 12cm, nặng 150g, có vỏ và tủy, chứa 1 triệu nephron, cao hơn thận phải.",
        "function": "Lọc máu, sản xuất nước tiểu, điều hòa nước-điện giải, sản xuất hormone erythropoietin.",
        "facts": ["1 triệu nephron", "Lọc 180 lít máu/ngày", "Cao hơn thận phải", "Nhận 25% lưu lượng tim"],
        "diseases": ["Suy thận", "Sỏi thận", "Viêm thận", "Ung thư thận"]
    },
    "Thận phải": {
        "name": "Thận phải",
        "structure": "Hình hạt đậu, dài 12cm, nặng 150g, thấp hơn thận trái 2-3cm do gan đè, cấu trúc tương tự.",
        "function": "Lọc máu, sản xuất nước tiểu, điều hòa nước-điện giải, chức năng tương tự thận trái.",
        "facts": ["Thấp hơn thận trái 2-3cm", "1 triệu nephron", "Bị gan đè từ trên", "Chức năng tương đương thận trái"],
        "diseases": ["Suy thận", "Sỏi thận", "Viêm thận", "Ung thư thận"]
    },
    "Niệu quản": {
        "name": "Niệu quản",
        "structure": "Ống cơ dài 25-30cm, đường kính 3-4mm, thành có 3 lớp: niêm mạc, cơ trơn, mạc ngoài.",
        "function": "Vận chuyển nước tiểu từ thận xuống bàng quang bằng nhu động, có van một chiều.",
        "facts": ["Dài 25-30cm", "Nhu động 1-5 lần/phút", "3 chỗ hẹp tự nhiên", "Van chống trào ngược"],
        "diseases": ["Sỏi niệu quản", "Viêm niệu quản", "Hẹp niệu quản", "Trào ngược niệu"]
    },
    
    # HỆ THẦN KINH (bổ sung)
    "Tủy sống": {
        "name": "Tủy sống",
        "structure": "Dài 45cm, đường kính 1cm, có chất xám (tế bào thần kinh) và chất trắng (sợi thần kinh).",
        "function": "Truyền tín hiệu giữa não và cơ thể, điều khiển phản xạ tự động, xử lý thông tin cảm giác.",
        "facts": ["31 cặp dây thần kinh tủy sống", "Được bảo vệ bởi cột sống", "Chất xám hình bướm", "Phản xạ không cần não"],
        "diseases": ["Chấn thương tủy sống", "Viêm tủy sống", "Khối u tủy sống", "Thoái hóa tủy sống"]
    },
    "Dây thần kinh cánh tay": {
        "name": "Dây thần kinh cánh tay",
        "structure": "Mạng lưới dây thần kinh từ C5-T1, gồm rễ, thân, bó và nhánh cuối, dài khoảng 40cm.",
        "function": "Điều khiển vận động và cảm giác của vai, cánh tay, cẳng tay và bàn tay.",
        "facts": ["Từ đốt sống C5-T1", "Điều khiển 27 cơ cánh tay", "Cảm giác da cánh tay", "Phản xạ gân xanh"],
        "diseases": ["Liệt dây thần kinh", "Hội chứng ống cổ tay", "Chấn thương đám rối", "Viêm dây thần kinh"]
    },
    "Dây thần kinh chân": {
        "name": "Dây thần kinh chân",
        "structure": "Mạng lưới dây thần kinh từ L1-S4, gồm dây thần kinh tọa, mác chung, chày, dài tới 1m.",
        "function": "Điều khiển vận động và cảm giác của hông, đùi, cẳng chân và bàn chân. Điều khiển đi lại.",
        "facts": ["Dây thần kinh tọa dài nhất cơ thể", "Điều khiển 30+ cơ chân", "Cảm giác da chân", "Quan trọng cho đi lại"],
        "diseases": ["Đau dây thần kinh tọa", "Liệt dây thần kinh mác", "Hội chứng ống cổ chân", "Viêm dây thần kinh"]
    },
    
    # HỆ CƠ (bổ sung)
    "Cơ nhị đầu": {
        "name": "Cơ nhị đầu",
        "structure": "Cơ vân có 2 đầu: đầu dài và đầu ngắn, bám từ xương vai đến xương quay, dài 30-35cm.",
        "function": "Gập khuỷu tay, xoay cẳng tay ngửa, nâng cánh tay lên. Cơ biểu tượng sức mạnh.",
        "facts": ["Có 2 đầu cơ", "Cơ biểu tượng sức mạnh", "Co thắt tối đa 60%", "Phản xạ gân xanh"],
        "diseases": ["Rách cơ nhị đầu", "Viêm gân cơ nhị đầu", "Hội chứng kẹt gân", "Yếu cơ"]
    },
    "Cơ tam đầu": {
        "name": "Cơ tam đầu",
        "structure": "Cơ vân có 3 đầu: đầu dài, đầu ngoài, đầu trong, bám từ xương vai và cánh tay đến khuỷu.",
        "function": "Duỗi thẳng khuỷu tay, đối kháng với cơ nhị đầu, ổn định khớp vai khi đẩy vật.",
        "facts": ["Có 3 đầu cơ", "Chiếm 2/3 khối lượng cánh tay", "Đối kháng cơ nhị đầu", "Quan trọng khi đẩy"],
        "diseases": ["Rách cơ tam đầu", "Viêm gân cơ tam đầu", "Yếu cơ tam đầu", "Hội chứng kẹt"]
    },
    "Cơ tứ đầu đùi": {
        "name": "Cơ tứ đầu đùi",
        "structure": "Nhóm 4 cơ vân: cơ thẳng đùi, cơ rộng ngoài, trong, giữa, bám từ xương hông đến bánh chè.",
        "function": "Duỗi thẳng đầu gối, nâng đùi lên, ổn định đầu gối khi đứng và đi. Cơ mạnh nhất cơ thể.",
        "facts": ["Nhóm cơ mạnh nhất", "4 bó cơ riêng biệt", "Lực co thắt 3000N", "Quan trọng cho đi lại"],
        "diseases": ["Rách cơ tứ đầu", "Viêm gân bánh chè", "Yếu cơ tứ đầu", "Hội chứng đau đầu gối"]
    },
    "Cơ calf": {
        "name": "Cơ calf",
        "structure": "Gồm cơ tràng chân (2 đầu) và cơ cá (1 đầu), bám từ xương đùi và chày đến gót chân.",
        "function": "Nhón chân, đẩy cơ thể lên khi đi/chạy, bơm máu tĩnh mạch về tim, giữ thăng bằng.",
        "facts": ["Gân Achilles mạnh nhất", "Bơm máu tĩnh mạch", "Lực nhón chân 1000N", "Quan trọng cho chạy nhảy"],
        "diseases": ["Rách gân Achilles", "Viêm cơ tràng chân", "Chuột rút", "Hội chứng khoang cơ"]
    },
    "Cơ bụng": {
        "name": "Cơ bụng",
        "structure": "Gồm 4 nhóm cơ: cơ thẳng bụng, cơ chéo ngoài, trong, cơ ngang bụng, tạo thành thành bụng.",
        "function": "Cúi người, xoay thân, thở ra mạnh, ho, hắt hơi, bảo vệ nội tạng, tăng áp lực bụng.",
        "facts": ["4 nhóm cơ khác nhau", "Tạo áp lực bụng", "Bảo vệ nội tạng", "Quan trọng cho hô hấp"],
        "diseases": ["Thoát vị bụng", "Rách cơ bụng", "Yếu cơ bụng", "Hội chứng đau bụng"]
    },
    "Cơ ngực": {
        "name": "Cơ ngực",
        "structure": "Cơ ngực lớn hình quạt, bám từ xương ước, xương đòn, sườn đến xương cánh tay.",
        "function": "Đưa cánh tay vào trong, xoay trong, đẩy vật, hỗ trợ hô hấp sâu khi cần thiết.",
        "facts": ["Cơ hình quạt lớn nhất", "Quan trọng khi đẩy", "Hỗ trợ hô hấp", "Biểu tượng sức mạnh nam"],
        "diseases": ["Rách cơ ngực", "Viêm gân cơ ngực", "Hội chứng kẹt", "Yếu cơ ngực"]
    }
}

# ============================================================================
# MODULAR FUNCTIONS
# ============================================================================

def sidebar_controls():
    """Vẽ sidebar với các nút hệ cơ quan"""
    st.sidebar.title("🧭 Hệ Cơ quan")
    st.sidebar.write("Chọn hệ cơ quan để tìm hiểu:")
    
    system_options = ["Tất cả"] + list(ORGAN_SYSTEMS.keys())
    selected_system = st.sidebar.radio("Chọn hệ:", system_options, index=0)
    
    if selected_system != "Tất cả":
        info = SYSTEM_INFO[selected_system]
        organs_list = ORGAN_SYSTEMS[selected_system]
        st.sidebar.markdown(f"""
        <div class="system-info">
            <h4>🔍 {selected_system}</h4>
            <p><strong>Mô tả:</strong> {info['description']}</p>
            <p><strong>Cơ quan:</strong> {', '.join(organs_list)}</p>
        </div>
        """, unsafe_allow_html=True)
    
    return selected_system

def highlight_system(system_name, organs):
    """Xác định logic highlight cho hệ cơ quan được chọn"""
    highlighted_organs = []
    for organ_name, organ in organs.items():
        # Chỉ highlight khi chọn hệ cụ thể, không highlight khi "Tất cả"
        is_highlighted = (system_name != "Tất cả" and organ["system"] == system_name)
        highlighted_organs.append((organ_name, is_highlighted))
    return highlighted_organs

def animate_organ(organ_name, organ, is_highlighted, system_name, selected_organ=None):
    """Tạo animation parameters cho cơ quan"""
    # Nếu có cơ quan được chọn cụ thể, highlight cơ quan đó
    if selected_organ and organ_name == selected_organ:
        return "#ff6b35", 1.0, 6, 1.5  # Màu cam nổi bật, viền dày, kích thước lớn
    elif system_name == "Tất cả":
        return organ["color"], 0.8, 2, 1.0
    elif is_highlighted:
        return SYSTEM_INFO[system_name]["color"], 1.0, 4, 1.2
    else:
        return "#bdc3c7", 0.2, 1, 0.9

def draw_body_map(highlight_system_name=None, selected_organ=None):
    """Vẽ các cơ quan trên canvas với highlight và animation"""
    fig = go.Figure()
    
    # Định nghĩa tất cả cơ quan với vị trí tương đối chính xác trên cơ thể
    organs = {
        # HỆ TIM MẠCH
        "Tim": {"shape": "triangle", "x": 0.45, "y": 0.62, "size": 0.08, "system": "Tim mạch", "color": "#e74c3c"},
        "Động mạch chủ": {"shape": "rectangle", "x": 0.48, "y": 0.68, "width": 0.03, "height": 0.15, "system": "Tim mạch", "color": "#c0392b"},
        "Tĩnh mạch chủ": {"shape": "rectangle", "x": 0.52, "y": 0.68, "width": 0.03, "height": 0.15, "system": "Tim mạch", "color": "#8e44ad"},
        "Mao mạch": {"shape": "ellipse", "x": 0.7, "y": 0.5, "width": 0.04, "height": 0.04, "system": "Tim mạch", "color": "#e67e22"},
        
        # HỆ HÔ HẤP
        "Phổi trái": {"shape": "ellipse", "x": 0.4, "y": 0.58, "width": 0.12, "height": 0.18, "system": "Hô hấp", "color": "#3498db"},
        "Phổi phải": {"shape": "ellipse", "x": 0.6, "y": 0.58, "width": 0.12, "height": 0.18, "system": "Hô hấp", "color": "#2980b9"},
        "Khí quản": {"shape": "rectangle", "x": 0.5, "y": 0.75, "width": 0.02, "height": 0.1, "system": "Hô hấp", "color": "#5dade2"},
        "Phế quản trái": {"shape": "rectangle", "x": 0.45, "y": 0.68, "width": 0.02, "height": 0.06, "system": "Hô hấp", "color": "#85c1e9"},
        "Phế quản phải": {"shape": "rectangle", "x": 0.55, "y": 0.68, "width": 0.02, "height": 0.06, "system": "Hô hấp", "color": "#85c1e9"},
        
        # HỆ TIÊU HÓA
        "Thực quản": {"shape": "rectangle", "x": 0.5, "y": 0.7, "width": 0.015, "height": 0.12, "system": "Tiêu hóa", "color": "#f4d03f"},
        "Dạ dày": {"shape": "ellipse", "x": 0.45, "y": 0.48, "width": 0.08, "height": 0.12, "system": "Tiêu hóa", "color": "#f39c12"},
        "Gan": {"shape": "rectangle", "x": 0.58, "y": 0.52, "width": 0.15, "height": 0.1, "system": "Tiêu hóa", "color": "#d68910"},
        "Tuyến tụy": {"shape": "rectangle", "x": 0.52, "y": 0.45, "width": 0.1, "height": 0.03, "system": "Tiêu hóa", "color": "#f7dc6f"},
        "Ruột non": {"shape": "ellipse", "x": 0.5, "y": 0.35, "width": 0.2, "height": 0.15, "system": "Tiêu hóa", "color": "#f8c471"},
        "Ruột già": {"shape": "rectangle", "x": 0.5, "y": 0.25, "width": 0.18, "height": 0.08, "system": "Tiêu hóa", "color": "#dc7633"},
        "Trực tràng": {"shape": "rectangle", "x": 0.5, "y": 0.18, "width": 0.04, "height": 0.06, "system": "Tiêu hóa", "color": "#a93226"},
        
        # HỆ TIẾT NIỆU
        "Thận trái": {"shape": "ellipse", "x": 0.35, "y": 0.4, "width": 0.06, "height": 0.1, "system": "Tiết niệu", "color": "#1abc9c"},
        "Thận phải": {"shape": "ellipse", "x": 0.65, "y": 0.38, "width": 0.06, "height": 0.1, "system": "Tiết niệu", "color": "#16a085"},
        "Niệu quản": {"shape": "rectangle", "x": 0.5, "y": 0.3, "width": 0.01, "height": 0.15, "system": "Tiết niệu", "color": "#48c9b0"},
        "Bàng quang": {"shape": "ellipse", "x": 0.5, "y": 0.2, "width": 0.08, "height": 0.06, "system": "Tiết niệu", "color": "#76d7c4"},
        
        # HỆ THẦN KINH
        "Não": {"shape": "ellipse", "x": 0.5, "y": 0.88, "width": 0.18, "height": 0.12, "system": "Thần kinh", "color": "#9b59b6"},
        "Tủy sống": {"shape": "rectangle", "x": 0.5, "y": 0.55, "width": 0.015, "height": 0.4, "system": "Thần kinh", "color": "#8e44ad"},
        "Dây thần kinh cánh tay": {"shape": "rectangle", "x": 0.25, "y": 0.6, "width": 0.02, "height": 0.2, "system": "Thần kinh", "color": "#bb8fce"},
        "Dây thần kinh chân": {"shape": "rectangle", "x": 0.45, "y": 0.15, "width": 0.02, "height": 0.25, "system": "Thần kinh", "color": "#bb8fce"},
        
        # HỆ CƠ
        "Cơ nhị đầu": {"shape": "ellipse", "x": 0.2, "y": 0.65, "width": 0.06, "height": 0.12, "system": "Cơ", "color": "#27ae60"},
        "Cơ tam đầu": {"shape": "ellipse", "x": 0.15, "y": 0.65, "width": 0.05, "height": 0.1, "system": "Cơ", "color": "#229954"},
        "Cơ tứ đầu đùi": {"shape": "ellipse", "x": 0.4, "y": 0.25, "width": 0.08, "height": 0.15, "system": "Cơ", "color": "#2ecc71"},
        "Cơ calf": {"shape": "ellipse", "x": 0.45, "y": 0.08, "width": 0.06, "height": 0.1, "system": "Cơ", "color": "#58d68d"},
        "Cơ bụng": {"shape": "rectangle", "x": 0.5, "y": 0.45, "width": 0.12, "height": 0.15, "system": "Cơ", "color": "#82e5aa"},
        "Cơ ngực": {"shape": "rectangle", "x": 0.5, "y": 0.65, "width": 0.2, "height": 0.08, "system": "Cơ", "color": "#a9dfbf"},
        
        # HỆ XƯƠNG
        "Hộp sọ": {"shape": "ellipse", "x": 0.5, "y": 0.88, "width": 0.2, "height": 0.14, "system": "Xương", "color": "#95a5a6"},
        "Cột sống": {"shape": "rectangle", "x": 0.5, "y": 0.55, "width": 0.02, "height": 0.4, "system": "Xương", "color": "#7f8c8d"},
        "Xương sườn": {"shape": "ellipse", "x": 0.5, "y": 0.6, "width": 0.25, "height": 0.2, "system": "Xương", "color": "#bdc3c7"},
        "Xương đòn": {"shape": "rectangle", "x": 0.5, "y": 0.75, "width": 0.15, "height": 0.02, "system": "Xương", "color": "#d5dbdb"},
        "Xương cánh tay": {"shape": "rectangle", "x": 0.25, "y": 0.6, "width": 0.03, "height": 0.2, "system": "Xương", "color": "#aab7b8"},
        "Xương đùi": {"shape": "rectangle", "x": 0.45, "y": 0.3, "width": 0.03, "height": 0.2, "system": "Xương", "color": "#85929e"},
        "Xương chày": {"shape": "rectangle", "x": 0.45, "y": 0.1, "width": 0.02, "height": 0.15, "system": "Xương", "color": "#566573"},
        
        # HỆ NỘI TIẾT
        "Tuyến giáp": {"shape": "ellipse", "x": 0.5, "y": 0.8, "width": 0.04, "height": 0.03, "system": "Nội tiết", "color": "#e67e22"},
        "Tuyến thượng thận": {"shape": "triangle", "x": 0.35, "y": 0.45, "size": 0.03, "system": "Nội tiết", "color": "#d35400"},
        "Tuyến tụy": {"shape": "rectangle", "x": 0.52, "y": 0.45, "width": 0.08, "height": 0.02, "system": "Nội tiết", "color": "#f39c12"},
        "Tuyến yên": {"shape": "ellipse", "x": 0.5, "y": 0.85, "width": 0.01, "height": 0.01, "system": "Nội tiết", "color": "#ff6b35"}
    }
    
    highlighted_organs = highlight_system(highlight_system_name, organs)
    
    for (organ_name, is_highlighted) in highlighted_organs:
        organ = organs[organ_name]
        color, opacity, line_width, marker_size = animate_organ(organ_name, organ, is_highlighted, highlight_system_name, selected_organ)
        
        # Tạo hover text với tên cơ quan
        hover_text = f"<b>{organ_name}</b><br>Hệ: {organ['system']}<br>Click để xem chi tiết"
        
        if organ["shape"] == "triangle":
            size = organ["size"] * marker_size
            x_tri = [organ["x"], organ["x"] - size/2, organ["x"] + size/2, organ["x"]]
            y_tri = [organ["y"] + size/2, organ["y"] - size/2, organ["y"] - size/2, organ["y"] + size/2]
            fig.add_trace(go.Scatter(
                x=x_tri, y=y_tri, fill='toself', fillcolor=color, opacity=opacity,
                line=dict(color=color, width=line_width), name=organ_name,
                hovertemplate=hover_text + "<extra></extra>",
                mode='lines'
            ))
        
        elif organ["shape"] == "rectangle":
            w, h = (organ["width"] * marker_size)/2, (organ["height"] * marker_size)/2
            x_rect = [organ["x"] - w, organ["x"] + w, organ["x"] + w, organ["x"] - w, organ["x"] - w]
            y_rect = [organ["y"] - h, organ["y"] - h, organ["y"] + h, organ["y"] + h, organ["y"] - h]
            fig.add_trace(go.Scatter(
                x=x_rect, y=y_rect, fill='toself', fillcolor=color, opacity=opacity,
                line=dict(color=color, width=line_width), name=organ_name,
                hovertemplate=hover_text + "<extra></extra>",
                mode='lines'
            ))
        
        elif organ["shape"] == "ellipse":
            theta = np.linspace(0, 2*np.pi, 50)
            width_scaled = organ["width"] * marker_size
            height_scaled = organ["height"] * marker_size
            x_ellipse = organ["x"] + (width_scaled/2) * np.cos(theta)
            y_ellipse = organ["y"] + (height_scaled/2) * np.sin(theta)
            fig.add_trace(go.Scatter(
                x=x_ellipse, y=y_ellipse, fill='toself', fillcolor=color, opacity=opacity,
                line=dict(color=color, width=line_width), name=organ_name,
                hovertemplate=hover_text + "<extra></extra>",
                mode='lines'
            ))
    
    # Tạo title dựa trên trạng thái hiện tại
    if selected_organ:
        title = f"🫀 Sơ đồ Cơ quan - Đang focus: {selected_organ}"
    elif highlight_system_name != 'Tất cả':
        title = f"🫀 Sơ đồ Cơ quan - Hệ: {highlight_system_name}"
    else:
        title = "🫀 Sơ đồ Cơ quan - Tổng quan"
    
    fig.update_layout(
        title=title,
        xaxis=dict(range=[0, 1], showgrid=False, showticklabels=False, zeroline=False),
        yaxis=dict(range=[0, 1], showgrid=False, showticklabels=False, zeroline=False, scaleanchor="x", scaleratio=1),
        showlegend=False, plot_bgcolor='white', height=700,
        hovermode='closest',
        margin=dict(l=20, r=20, t=60, b=20),
        font=dict(size=12),
        transition={'duration': 500, 'easing': 'cubic-in-out'}
    )
    
    return fig

def show_explanation(organ_name):
    """Hiển thị giải thích chi tiết về cơ quan được chọn"""
    if organ_name:
        st.markdown("---")
        col1, col2 = st.columns([3, 1])
        
        with col1:
            st.markdown(f"### 🔍 Chi tiết về **{organ_name}**")
        
        with col2:
            if st.button("❌ Đóng", key="close_detail"):
                st.session_state.selected_organ = None
                st.rerun()
        
        # Hiển thị giải thích đơn giản từ dictionary explanations
        if organ_name in explanations:
            st.markdown(f"""
            <div class="organ-detail">
                <p style="font-size: 16px; line-height: 1.6;">
                    {explanations[organ_name]}
                </p>
            </div>
            """, unsafe_allow_html=True)
        
        # Hiển thị thông tin chi tiết trong tabs nếu có
        if organ_name in ORGAN_DETAILS:
            organ_info = ORGAN_DETAILS[organ_name]
            
            # Tạo tabs cho thông tin chi tiết
            tab1, tab2, tab3, tab4 = st.tabs(["🏗️ Cấu tạo", "⚙️ Chức năng", "💡 Thông tin thú vị", "🏥 Bệnh lý"])
            
            with tab1:
                st.markdown(f"**Cấu tạo:** {organ_info['structure']}")
            
            with tab2:
                st.markdown(f"**Chức năng:** {organ_info['function']}")
            
            with tab3:
                st.markdown("**Những điều thú vị:**")
                for fact in organ_info['facts']:
                    st.markdown(f"• {fact}")
            
            with tab4:
                st.markdown("**Các bệnh lý thường gặp:**")
                for disease in organ_info['diseases']:
                    st.markdown(f"• {disease}")
        else:
            st.info(f"Thông tin chi tiết về {organ_name} sẽ được cập nhật sớm.")

def organ_click_controls():
    """Tạo buttons để click vào từng cơ quan, phân nhóm theo hệ"""
    st.markdown("### 🖱️ Click để tìm hiểu chi tiết:")
    
    # Định nghĩa biểu tượng y khoa cho từng hệ cơ quan
    system_icons = {
        "Tim mạch": "🫀",
        "Hô hấp": "🫁", 
        "Tiêu hóa": "🍽️",
        "Tiết niệu": "💧",
        "Thần kinh": "🧠",
        "Cơ": "💪",
        "Xương": "🦴",
        "Nội tiết": "🔬"
    }
    
    # Định nghĩa biểu tượng cụ thể cho từng cơ quan
    organ_icons = {
        # Hệ tim mạch
        "Tim": "❤️", "Động mạch chủ": "🔴", "Tĩnh mạch chủ": "🔵", "Mao mạch": "🩸",
        
        # Hệ hô hấp
        "Phổi trái": "🫁", "Phổi phải": "🫁", "Khí quản": "🌬️", "Phế quản trái": "🌪️", "Phế quản phải": "🌪️",
        
        # Hệ tiêu hóa
        "Thực quản": "🟨", "Dạ dày": "🟡", "Gan": "🟤", "Tuyến tụy": "🟠", "Ruột non": "🟢", "Ruột già": "🟫", "Trực tràng": "🔴",
        
        # Hệ tiết niệu
        "Thận": "🫘", "Thận trái": "🫘", "Thận phải": "🫘", "Niệu quản": "💙", "Bàng quang": "💧",
        
        # Hệ thần kinh
        "Não": "🧠", "Tủy sống": "🔗", "Dây thần kinh cánh tay": "⚡", "Dây thần kinh chân": "⚡",
        
        # Hệ cơ
        "Cơ nhị đầu": "💪", "Cơ tam đầu": "💪", "Cơ tứ đầu đùi": "🦵", "Cơ calf": "🦵", "Cơ bụng": "🤸", "Cơ ngực": "💪",
        
        # Hệ xương
        "Hộp sọ": "💀", "Cột sống": "🦴", "Xương sườn": "🦴", "Xương đòn": "🦴", "Xương cánh tay": "🦴", "Xương đùi": "🦴", "Xương chày": "🦴",
        
        # Hệ nội tiết
        "Tuyến giáp": "🦋", "Tuyến thượng thận": "🔺", "Tuyến tụy": "🟨", "Tuyến yên": "🔴"
    }
    
    # Tạo expander cho từng hệ cơ quan
    for system_name, organs in ORGAN_SYSTEMS.items():
        system_icon = system_icons.get(system_name, "🔸")
        
        with st.expander(f"{system_icon} **Hệ {system_name}** ({len(organs)} cơ quan)", expanded=False):
            # Chia thành 4 cột cho mỗi hệ để hiển thị gọn gàng
            cols = st.columns(4)
            
            for i, organ in enumerate(organs):
                col_idx = i % 4
                with cols[col_idx]:
                    organ_icon = organ_icons.get(organ, "🔸")
                    
                    # Tạo key duy nhất
                    unique_key = f"organ_{system_name}_{organ}_{i}"
                    
                    if st.button(f"{organ_icon} {organ}", key=unique_key):
                        st.session_state.selected_organ = organ
    
    # Nút reset
    st.markdown("---")
    col_reset = st.columns([1, 1, 1])[1]  # Căn giữa
    with col_reset:
        if st.button("🔄 Đặt lại", key="reset_organ"):
            st.session_state.selected_organ = None

# ============================================================================
# MAIN APPLICATION
# ============================================================================

def main():
    """Main application function"""
    load_custom_css()
    
    st.title("🫀 Sơ đồ Cơ quan Cơ thể Người")
    st.write("Sơ đồ 2D đơn giản các cơ quan chính trong cơ thể")
    
    # Sidebar controls
    selected_system = sidebar_controls()
    
    # Status display
    if selected_system != "Tất cả":
        info = SYSTEM_INFO[selected_system]
        organs_count = len(ORGAN_SYSTEMS[selected_system])
        st.info(f"🎯 **Đang highlight hệ {selected_system}** - {organs_count} cơ quan được làm nổi bật")
    
    # Main content
    col1, col2 = st.columns([3, 1])
    
    with col1:
        # Get selected organ from session state
        selected_organ = st.session_state.get('selected_organ', None)
        
        # Draw body map with both system and organ highlighting
        fig = draw_body_map(selected_system, selected_organ)
        st.plotly_chart(fig, use_container_width=True)
        
        # Organ click controls
        organ_click_controls()
    
    with col2:
        st.subheader("📚 Thông tin Chi tiết")
        if selected_system == "Tất cả":
            st.markdown("""
            <div class="organ-detail">
            <h5>🫀 Hướng dẫn sử dụng:</h5>
            <ul>
            <li>Chọn hệ cơ quan từ sidebar</li>
            <li>Click nút cơ quan để xem chi tiết</li>
            <li>🔺 Tam giác = Tim</li>
            <li>⬜ Chữ nhật = Gan</li>
            <li>⭕ Elip = Não</li>
            </ul>
            </div>
            """, unsafe_allow_html=True)
        else:
            info = SYSTEM_INFO[selected_system]
            organs_list = ORGAN_SYSTEMS[selected_system]
            st.markdown(f"""
            <div class="organ-detail">
            <h5>🔍 {selected_system}</h5>
            <p><strong>Cơ quan:</strong> {', '.join(organs_list)}</p>
            <p><strong>Mô tả:</strong> {info['description']}</p>
            <p><strong>Tổng số:</strong> {len(organs_list)} cơ quan</p>
            </div>
            """, unsafe_allow_html=True)
    
    # Show organ explanation if selected
    show_explanation(st.session_state.selected_organ)
    
    # Footer
    st.markdown("---")
    st.markdown("💡 **Ghi chú:** Đây là sơ đồ đơn giản hóa để học tập.")
    st.markdown("🖱️ **Hướng dẫn:** Click vào các nút cơ quan để xem thông tin chi tiết.")

if __name__ == "__main__":
    main()
