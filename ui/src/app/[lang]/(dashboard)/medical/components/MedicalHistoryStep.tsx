import React, { useState } from "react";

interface MedicalHistory {
  chronicConditions: string[];
  allergies: string;
  currentMedications: string;
  previousSurgeries: string;
  familyHistory: string[];
}

interface MedicalHistoryStepProps {
  onPrev: () => void;
  onNext: () => void;
  onMedicalHistorySubmit: (data: MedicalHistory) => void;
}

export const MedicalHistoryStep: React.FC<MedicalHistoryStepProps> = ({
  onPrev,
  onNext,
  onMedicalHistorySubmit,
}) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    chronicConditions: [],
    allergies: "",
    currentMedications: "",
    previousSurgeries: "",
    familyHistory: [],
  });

  const chronicConditions = [
    "Đái tháo đường",
    "Tăng huyết áp",
    "Bệnh tim mạch",
    "Bệnh gan",
    "Bệnh thận",
    "Hen suyễn",
    "Bệnh dạ dày",
    "Ung thư",
    "Rối loạn tâm thần",
    "Bệnh tự miễn",
  ];

  const familyHistoryOptions = [
    "Bệnh tim mạch",
    "Đái tháo đường",
    "Ung thư",
    "Bệnh Alzheimer",
    "Bệnh Parkinson",
    "Rối loạn tâm thần",
    "Bệnh tự miễn",
  ];

  const handleMultiSelectChange = (
    field: keyof Pick<MedicalHistory, "chronicConditions" | "familyHistory">,
    value: string,
    checked: boolean
  ) => {
    setMedicalHistory((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleTextChange = (
    field: keyof Omit<MedicalHistory, "chronicConditions" | "familyHistory">,
    value: string
  ) => {
    setMedicalHistory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onMedicalHistorySubmit(medicalHistory);
    onNext();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bước 3: Tiền Sử Y Khoa
        </h2>
        <p className="text-gray-600">
          Vui lòng cung cấp thông tin về tiền sử bệnh lý của bạn
        </p>
      </div>

      <div className="space-y-8">
        {/* Chronic Conditions */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Bệnh mãn tính
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {chronicConditions.map((condition) => (
              <label
                key={condition}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={medicalHistory.chronicConditions.includes(condition)}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "chronicConditions",
                      condition,
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Dị ứng</h3>
          <textarea
            value={medicalHistory.allergies}
            onChange={(e) => handleTextChange("allergies", e.target.value)}
            placeholder="Liệt kê các chất gây dị ứng (thức ăn, thuốc, hóa chất...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* Current Medications */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Thuốc đang dùng
          </h3>
          <textarea
            value={medicalHistory.currentMedications}
            onChange={(e) =>
              handleTextChange("currentMedications", e.target.value)
            }
            placeholder="Liệt kê các loại thuốc bạn đang sử dụng (tên thuốc, liều lượng, thời gian dùng...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* Previous Surgeries */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Tiền sử phẫu thuật
          </h3>
          <textarea
            value={medicalHistory.previousSurgeries}
            onChange={(e) =>
              handleTextChange("previousSurgeries", e.target.value)
            }
            placeholder="Liệt kê các ca phẫu thuật đã thực hiện (năm, loại phẫu thuật...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* Family History */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Tiền sử gia đình
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {familyHistoryOptions.map((condition) => (
              <label
                key={condition}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={medicalHistory.familyHistory.includes(condition)}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "familyHistory",
                      condition,
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{condition}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
};
