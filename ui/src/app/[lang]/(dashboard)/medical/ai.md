import React, { useState, useRef } from "react";

const MedicalDataProcessingApp = () => {
const [activeModal, setActiveModal] = useState(null);
const [skinResults, setSkinResults] = useState(null);
const [lungResults, setLungResults] = useState(null);
const [vitalResults, setVitalResults] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);
const fileInputRef = useRef(null);
const audioInputRef = useRef(null);

// Mock data for results
const mockSkinResults = {
diagnosis: "Nevus melanocytic (痣细胞痣)",
confidence: "92%",
description: "Đây là một nốt ruồi lành tính, thường gặp ở người trưởng thành. Tuy nhiên, cần theo dõi sự thay đổi về kích thước, màu sắc và hình dạng.",
recommendations: [
"Theo dõi định kỳ mỗi 6 tháng",
"Tránh tiếp xúc trực tiếp với ánh nắng mặt trời",
"Sử dụng kem chống nắng SPF 30+",
"Liên hệ bác sĩ nếu có bất kỳ thay đổi nào"
]
};

const mockLungResults = {
diagnosis: "Bình thường",
confidence: "88%",
description: "Âm thanh hô hấp nghe rõ ràng, đều đặn. Không phát hiện tiếng ran, wheeze hay stridor. Nhịp thở ổn định ở mức 16-18 nhịp/phút.",
findings: [
"Âm thanh phổi rõ ràng",
"Không có tiếng bất thường",
"Nhịp thở đều đặn",
"Không có dấu hiệu tắc nghẽn"
]
};

const mockVitalResults = {
diagnosis: "Chỉ số sinh lý bình thường",
summary: "Các chỉ số sinh lý đều nằm trong phạm vi bình thường cho độ tuổi và giới tính.",
metrics: {
heartRate: "72 bpm (Bình thường)",
bloodPressure: "120/80 mmHg (Tốt)",
oxygenSaturation: "98% (Tốt)",
temperature: "36.8°C (Bình thường)"
},
recommendations: [
"Duy trì lối sống lành mạnh",
"Tập thể dục đều đặn",
"Theo dõi huyết áp hàng tuần",
"Khám sức khỏe định kỳ 6 tháng/lần"
]
};

// Skin Image Processing
const handleSkinImageUpload = (event) => {
const file = event.target.files[0];
if (file) {
setIsProcessing(true);
setActiveModal('skin');

      // Simulate API call
      setTimeout(() => {
        setSkinResults(mockSkinResults);
        setIsProcessing(false);
      }, 3000);
    }

};

const handleSkinImageDrop = (event) => {
event.preventDefault();
const file = event.dataTransfer.files[0];
if (file && file.type.startsWith('image/')) {
setIsProcessing(true);
setActiveModal('skin');

      // Simulate API call
      setTimeout(() => {
        setSkinResults(mockSkinResults);
        setIsProcessing(false);
      }, 3000);
    }

};

// Lung Audio Processing
const handleLungAudioUpload = (event) => {
const file = event.target.files[0];
if (file) {
setIsProcessing(true);
setActiveModal('lung');

      // Simulate API call
      setTimeout(() => {
        setLungResults(mockLungResults);
        setIsProcessing(false);
      }, 3000);
    }

};

const startLungRecording = () => {
setIsProcessing(true);
setActiveModal('lung');

    // Simulate recording and processing
    setTimeout(() => {
      setLungResults(mockLungResults);
      setIsProcessing(false);
    }, 3000);

};

// Vital Signs Processing
const [vitalSigns, setVitalSigns] = useState({
heartRate: '',
bloodPressureSystolic: '',
bloodPressureDiastolic: '',
oxygenSaturation: '',
temperature: ''
});

const handleVitalSignsChange = (field, value) => {
setVitalSigns(prev => ({
...prev,
[field]: value
}));
};

const processVitalSigns = () => {
if (vitalSigns.heartRate && vitalSigns.bloodPressureSystolic && vitalSigns.bloodPressureDiastolic) {
setIsProcessing(true);
setActiveModal('vital');

      // Simulate API call
      setTimeout(() => {
        setVitalResults(mockVitalResults);
        setIsProcessing(false);
      }, 2000);
    }

};

const resetAll = () => {
setSkinResults(null);
setLungResults(null);
setVitalResults(null);
setVitalSigns({
heartRate: '',
bloodPressureSystolic: '',
bloodPressureDiastolic: '',
oxygenSaturation: '',
temperature: ''
});
setActiveModal(null);
};

// Modal Components
const SkinImageModal = () => (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-bold text-gray-800">Phân Tích Ảnh Da</h2>
<button
onClick={() => setActiveModal(null)}
className="text-gray-500 hover:text-gray-700 text-2xl" >
×
</button>
</div>

          {isProcessing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang xử lý ảnh</h3>
              <p className="text-gray-600">Hệ thống đang phân tích hình ảnh da của bạn...</p>
            </div>
          ) : skinResults ? (
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 bg-blue-50 p-5 rounded-r-lg">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Chẩn đoán chính</h3>
                <p className="text-xl font-bold text-blue-700">{skinResults.diagnosis}</p>
                <p className="text-sm text-gray-600 mt-1">Độ tin cậy: {skinResults.confidence}</p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Mô tả</h3>
                <p className="text-gray-700">{skinResults.description}</p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Khuyến nghị</h3>
                <ul className="space-y-2">
                  {skinResults.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Lưu kết quả
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleSkinImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tải lên ảnh da</h3>
                <p className="text-gray-500 mb-4">Kéo và thả ảnh vào đây hoặc click để chọn</p>
                <p className="text-sm text-gray-400">Hỗ trợ JPG, PNG, GIF (tối đa 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSkinImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm font-medium">Phân tích AI</p>
                  <p className="text-xs text-gray-500">Nhận diện bệnh da liễu</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-medium">Chẩn đoán</p>
                  <p className="text-xs text-gray-500">Báo cáo chi tiết</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🛡️</div>
                  <p className="text-sm font-medium">An toàn</p>
                  <p className="text-xs text-gray-500">Bảo mật dữ liệu</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-sm font-medium">Nhanh chóng</p>
                  <p className="text-xs text-gray-500">Kết quả tức thì</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

);

const LungAudioModal = () => (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-bold text-gray-800">Phân Tích Âm Thanh Hô Hấp</h2>
<button
onClick={() => setActiveModal(null)}
className="text-gray-500 hover:text-gray-700 text-2xl" >
×
</button>
</div>

          {isProcessing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang xử lý âm thanh</h3>
              <p className="text-gray-600">Hệ thống đang phân tích âm thanh hô hấp của bạn...</p>
            </div>
          ) : lungResults ? (
            <div className="space-y-6">
              <div className="border-l-4 border-green-600 bg-green-50 p-5 rounded-r-lg">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Kết luận</h3>
                <p className="text-xl font-bold text-green-700">{lungResults.diagnosis}</p>
                <p className="text-sm text-gray-600 mt-1">Độ tin cậy: {lungResults.confidence}</p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Mô tả chi tiết</h3>
                <p className="text-gray-700">{lungResults.description}</p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Phát hiện</h3>
                <ul className="space-y-2">
                  {lungResults.findings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Lưu kết quả
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <div className="text-5xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Tải file âm thanh</h3>
                  <p className="text-gray-500 mb-4">Click để chọn file WAV, MP3</p>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleLungAudioUpload}
                    className="hidden"
                  />
                </div>

                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                  onClick={startLungRecording}
                >
                  <div className="text-5xl mb-4">🎙️</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Ghi âm trực tiếp</h3>
                  <p className="text-gray-500 mb-4">Click để bắt đầu ghi âm</p>
                  <p className="text-sm text-gray-400">Ghi âm trong 10-15 giây</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-5">
                <h3 className="font-semibold text-blue-800 mb-3">Hướng dẫn ghi âm</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Tìm nơi yên tĩnh, không có tiếng ồn xung quanh</li>
                  <li>• Ngồi thẳng, thư giãn và thở đều</li>
                  <li>• Ghi âm trong khoảng 10-15 giây</li>
                  <li>• Tránh nói chuyện hoặc phát ra tiếng động khác</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔊</div>
                  <p className="text-sm font-medium">Phân tích âm thanh</p>
                  <p className="text-xs text-gray-500">Nhận diện bất thường</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🫁</div>
                  <p className="text-sm font-medium">Chẩn đoán hô hấp</p>
                  <p className="text-xs text-gray-500">Phát hiện bệnh phổi</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🛡️</div>
                  <p className="text-sm font-medium">An toàn</p>
                  <p className="text-xs text-gray-500">Bảo mật dữ liệu</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-sm font-medium">Nhanh chóng</p>
                  <p className="text-xs text-gray-500">Kết quả tức thì</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

);

const VitalSignsModal = () => (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-bold text-gray-800">Chỉ Số Sinh Lý</h2>
<button
onClick={() => setActiveModal(null)}
className="text-gray-500 hover:text-gray-700 text-2xl" >
×
</button>
</div>

          {isProcessing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang xử lý dữ liệu</h3>
              <p className="text-gray-600">Hệ thống đang phân tích các chỉ số sinh lý của bạn...</p>
            </div>
          ) : vitalResults ? (
            <div className="space-y-6">
              <div className="border-l-4 border-purple-600 bg-purple-50 p-5 rounded-r-lg">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Tóm tắt chẩn đoán</h3>
                <p className="text-xl font-bold text-purple-700">{vitalResults.diagnosis}</p>
                <p className="text-gray-700 mt-2">{vitalResults.summary}</p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Các chỉ số</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(vitalResults.metrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">
                        {key === 'heartRate' && 'Nhịp tim'}
                        {key === 'bloodPressure' && 'Huyết áp'}
                        {key === 'oxygenSaturation' && 'Độ bão hòa oxy'}
                        {key === 'temperature' && 'Nhiệt độ'}
                      </p>
                      <p className="font-semibold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Khuyến nghị</h3>
                <ul className="space-y-2">
                  {vitalResults.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
                <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Lưu kết quả
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Nhập chỉ số sinh lý</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhịp tim (bpm)</label>
                    <input
                      type="number"
                      value={vitalSigns.heartRate}
                      onChange={(e) => handleVitalSignsChange('heartRate', e.target.value)}
                      placeholder="72"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Huyết áp</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={vitalSigns.bloodPressureSystolic}
                        onChange={(e) => handleVitalSignsChange('bloodPressureSystolic', e.target.value)}
                        placeholder="120"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="flex items-center">/</span>
                      <input
                        type="number"
                        value={vitalSigns.bloodPressureDiastolic}
                        onChange={(e) => handleVitalSignsChange('bloodPressureDiastolic', e.target.value)}
                        placeholder="80"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="flex items-center">mmHg</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Độ bão hòa oxy (%)</label>
                    <input
                      type="number"
                      value={vitalSigns.oxygenSaturation}
                      onChange={(e) => handleVitalSignsChange('oxygenSaturation', e.target.value)}
                      placeholder="98"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhiệt độ cơ thể (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalSigns.temperature}
                      onChange={(e) => handleVitalSignsChange('temperature', e.target.value)}
                      placeholder="36.8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={processVitalSigns}
                    disabled={!vitalSigns.heartRate || !vitalSigns.bloodPressureSystolic || !vitalSigns.bloodPressureDiastolic}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      vitalSigns.heartRate && vitalSigns.bloodPressureSystolic && vitalSigns.bloodPressureDiastolic
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Phân tích chỉ số
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Kết nối thiết bị</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">🩺</div>
                    <h4 className="font-semibold text-gray-700 mb-2">Kết nối thiết bị đo</h4>
                    <p className="text-gray-600 mb-4">Kết nối với các thiết bị đo sinh lý thông qua Bluetooth</p>
                    <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                      Quét thiết bị
                    </button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Thiết bị hỗ trợ</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Máy đo huyết áp Omron</li>
                      <li>• Đồng hồ thông minh Apple Watch</li>
                      <li>• Máy đo SpO2 Contec</li>
                      <li>• Máy đo nhiệt độ Xiaomi</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">❤️</div>
                  <p className="text-sm font-medium">Theo dõi tim mạch</p>
                  <p className="text-xs text-gray-500">Nhịp tim, huyết áp</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🌡️</div>
                  <p className="text-sm font-medium">Nhiệt độ cơ thể</p>
                  <p className="text-xs text-gray-500">Phát hiện sốt</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">💨</div>
                  <p className="text-sm font-medium">Độ bão hòa oxy</p>
                  <p className="text-xs text-gray-500">Theo dõi hô hấp</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-medium">Báo cáo tổng hợp</p>
                  <p className="text-xs text-gray-500">Phân tích toàn diện</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

);

return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
<div className="max-w-6xl mx-auto">
<div className="text-center mb-12">
<h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
Hệ Thống Chẩn Đoán Y Khoa Toàn Diện
</h1>
<p className="text-gray-600 max-w-2xl mx-auto">
Phân tích đa dạng dữ liệu y tế bao gồm hình ảnh da, âm thanh hô hấp và chỉ số sinh lý
</p>
</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Skin Analysis Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="text-xl font-bold mb-2">Phân Tích Ảnh Da</h3>
              <p className="text-pink-100">Chẩn đoán bệnh da liễu bằng AI</p>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Nhận diện u nhọt, nốt ruồi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Phát hiện ung thư da sớm</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Báo cáo chi tiết</span>
                </li>
              </ul>
              <button
                onClick={() => setActiveModal('skin')}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
              >
                Bắt đầu phân tích
              </button>
            </div>
          </div>

          {/* Lung Audio Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
              <div className="text-4xl mb-3">🫁</div>
              <h3 className="text-xl font-bold mb-2">Âm Thanh Hô Hấp</h3>
              <p className="text-blue-100">Phân tích âm thanh phổi</p>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Phát hiện tiếng ran, wheeze</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Chẩn đoán bệnh hô hấp</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Ghi âm trực tiếp</span>
                </li>
              </ul>
              <button
                onClick={() => setActiveModal('lung')}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Phân tích âm thanh
              </button>
            </div>
          </div>

          {/* Vital Signs Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
              <div className="text-4xl mb-3">❤️</div>
              <h3 className="text-xl font-bold mb-2">Chỉ Số Sinh Lý</h3>
              <p className="text-purple-100">Theo dõi sức khỏe toàn diện</p>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Nhịp tim, huyết áp</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Độ bão hòa oxy, nhiệt độ</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Kết nối thiết bị</span>
                </li>
              </ul>
              <button
                onClick={() => setActiveModal('vital')}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Theo dõi sinh lý
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(skinResults || lungResults || vitalResults) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Kết Quả Tổng Hợp</h2>
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Reset tất cả
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {skinResults && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📸</span>
                    <h3 className="font-semibold text-gray-800">Ảnh da</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{skinResults.diagnosis}</p>
                  <p className="text-xs text-blue-600">Độ tin cậy: {skinResults.confidence}</p>
                </div>
              )}

              {lungResults && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🫁</span>
                    <h3 className="font-semibold text-gray-800">Âm thanh hô hấp</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{lungResults.diagnosis}</p>
                  <p className="text-xs text-green-600">Độ tin cậy: {lungResults.confidence}</p>
                </div>
              )}

              {vitalResults && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">❤️</span>
                    <h3 className="font-semibold text-gray-800">Chỉ số sinh lý</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{vitalResults.diagnosis}</p>
                  <p className="text-xs text-purple-600">Phân tích toàn diện</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Gửi cho MedAlpaca
              </button>
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                Xuất báo cáo PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'skin' && <SkinImageModal />}
      {activeModal === 'lung' && <LungAudioModal />}
      {activeModal === 'vital' && <VitalSignsModal />}
    </div>

);
};

export default MedicalDataProcessingApp;
