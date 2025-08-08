// Step 4 Component
export const ProcessingStep = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Đang xử lý chẩn đoán
        </h2>
        <p className="text-gray-600 mb-6">
          Hệ thống đang phân tích các triệu chứng của bạn. Vui lòng đợi trong
          giây lát...
        </p>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Thời gian dự kiến: 15 phút
            <br />
            <span className="text-blue-600 font-medium">Đang xử lý...</span>
          </p>
        </div>
      </div>
    </div>
  );
};
