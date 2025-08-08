import React, { useState } from "react";

interface DetailedSymptoms {
  painIntensity: string;
  painDuration: string;
  painLocation: string;
  associatedSymptoms: string[];
  aggravatingFactors: string[];
  relievingFactors: string[];
}

interface DetailedSymptomsStepProps {
  onPrev: () => void;
  onNext: () => void;
  onDetailedSymptomsSubmit: (data: DetailedSymptoms) => void;
}

export const DetailedSymptomsStep: React.FC<DetailedSymptomsStepProps> = ({
  onPrev,
  onNext,
  onDetailedSymptomsSubmit,
}) => {
  const [detailedSymptoms, setDetailedSymptoms] = useState<DetailedSymptoms>({
    painIntensity: "",
    painDuration: "",
    painLocation: "",
    associatedSymptoms: [],
    aggravatingFactors: [],
    relievingFactors: [],
  });

  const handleDetailedSymptomChange = (
    field: keyof DetailedSymptoms,
    value: string
  ) => {
    setDetailedSymptoms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelectChange = (
    field: "associatedSymptoms" | "aggravatingFactors" | "relievingFactors",
    value: string,
    checked: boolean
  ) => {
    setDetailedSymptoms((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleSubmit = () => {
    onDetailedSymptomsSubmit(detailedSymptoms);
    onNext();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bước 2: Nhập Thông Tin Chi Tiết
        </h2>
        <p className="text-gray-600">
          Vui lòng cung cấp thêm thông tin chi tiết về các triệu chứng
        </p>
      </div>

      <div className="space-y-8">
        {/* Pain Intensity */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Mức độ đau
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Không đau</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <label
                  key={level}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="painIntensity"
                    value={level}
                    checked={
                      detailedSymptoms.painIntensity === level.toString()
                    }
                    onChange={(e) =>
                      handleDetailedSymptomChange(
                        "painIntensity",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm mt-1">{level}</span>
                </label>
              ))}
              <span className="text-gray-600">Rất đau</span>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Mức độ hiện tại: {detailedSymptoms.painIntensity || "Chưa chọn"}
              </span>
            </div>
          </div>
        </div>

        {/* Pain Duration */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Thời gian xuất hiện
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "Dưới 1 giờ",
              "1-6 giờ",
              "6-24 giờ",
              "1-3 ngày",
              "3-7 ngày",
              "1-2 tuần",
              "2-4 tuần",
              "Trên 1 tháng",
            ].map((duration) => (
              <label
                key={duration}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="painDuration"
                  value={duration}
                  checked={detailedSymptoms.painDuration === duration}
                  onChange={(e) =>
                    handleDetailedSymptomChange("painDuration", e.target.value)
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{duration}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pain Location */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Vị trí đau
          </h3>
          <input
            type="text"
            value={detailedSymptoms.painLocation}
            onChange={(e) =>
              handleDetailedSymptomChange("painLocation", e.target.value)
            }
            placeholder="Ví dụ: vùng thượng vị, bên phải bụng dưới..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Associated Symptoms */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Triệu chứng kèm theo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Sốt",
              "Buồn nôn/Nôn",
              "Mệt mỏi",
              "Chán ăn",
              "Đổ mồ hôi",
              "Choáng váng",
              "Khó thở",
              "Tiêu chảy",
              "Táo bón",
            ].map((symptom) => (
              <label
                key={symptom}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={detailedSymptoms.associatedSymptoms.includes(
                    symptom
                  )}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "associatedSymptoms",
                      symptom,
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{symptom}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Aggravating Factors */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Yếu tố làm tăng đau
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Ăn no",
              "Đói bụng",
              "Vận động",
              "Nằm xuống",
              "Hít sâu",
              "Ho",
              "Căng thẳng",
              "Thời tiết thay đổi",
            ].map((factor) => (
              <label
                key={factor}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={detailedSymptoms.aggravatingFactors.includes(factor)}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "aggravatingFactors",
                      factor,
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{factor}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Relieving Factors */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Yếu tố làm giảm đau
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Nghỉ ngơi",
              "Uống nước ấm",
              "Ăn nhẹ",
              "Massage",
              "Thuốc giảm đau",
              "Thay đổi tư thế",
              "Hít thở sâu",
              "Giấc ngủ",
            ].map((factor) => (
              <label
                key={factor}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={detailedSymptoms.relievingFactors.includes(factor)}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "relievingFactors",
                      factor,
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm">{factor}</span>
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
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
};

export default DetailedSymptomsStep;
