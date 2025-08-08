import React from "react";

interface DiagnosisResult {
  diagnosis: string;
  confidence: string;
  description: string;
  recommendations: string[];
  urgentCare: boolean;
}

interface ResultsStepProps {
  onRestart: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ onRestart }) => {
  // Mock result data
  const diagnosisResult: DiagnosisResult = {
    diagnosis: "Viêm dạ dày cấp tính",
    confidence: "85%",
    description:
      "Dựa trên các triệu chứng bạn cung cấp, khả năng cao bạn đang mắc viêm dạ dày cấp tính. Đây là tình trạng viêm niêm mạc dạ dày thường do vi khuẩn, stress hoặc sử dụng thuốc.",
    recommendations: [
      "Uống nhiều nước và nghỉ ngơi",
      "Tránh thức ăn cay nóng, nhiều dầu mỡ",
      "Dùng thuốc theo chỉ định của bác sĩ",
      "Tái khám nếu triệu chứng kéo dài hơn 3 ngày",
    ],
    urgentCare: false,
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Kết Quả Chẩn Đoán
        </h2>
        <p className="text-gray-600">Dựa trên các triệu chứng bạn cung cấp</p>
      </div>

      <div className="space-y-6">
        {/* Main Diagnosis */}
        <div className="border-l-4 border-blue-600 bg-blue-50 p-5 rounded-r-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">
            Chẩn đoán chính
          </h3>
          <p className="text-xl font-bold text-blue-700">
            {diagnosisResult.diagnosis}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Độ tin cậy: {diagnosisResult.confidence}
          </p>
        </div>

        {/* Description */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">Mô tả</h3>
          <p className="text-gray-700">{diagnosisResult.description}</p>
        </div>

        {/* Recommendations */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">
            Khuyến nghị
          </h3>
          <ul className="space-y-2">
            {diagnosisResult.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Urgent Care Warning */}
        {diagnosisResult.urgentCare && (
          <div className="border-l-4 border-red-600 bg-red-50 p-5 rounded-r-lg">
            <h3 className="font-semibold text-lg text-red-800 mb-2">
              Cảnh báo
            </h3>
            <p className="text-red-700">
              Tình trạng của bạn có thể nghiêm trọng. Vui lòng đến cơ sở y tế
              gần nhất ngay lập tức.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            In kết quả
          </button>
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            Lưu kết quả
          </button>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Bắt đầu lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;
