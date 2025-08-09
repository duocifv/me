import React, { useState, ChangeEvent, FormEvent } from "react";
import { PatientInfo } from "@/module/medical/medical.type";

interface PatientInfoStepProps {
  onNext: () => void;
  onPatientInfoSubmit: (info: PatientInfo) => void;
}

export const PatientInfoStep: React.FC<PatientInfoStepProps> = ({
  onNext,
  onPatientInfoSubmit,
}) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    fullName: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    phone: "",
    email: "",
  });

  const handleInputChange = (field: keyof PatientInfo, value: string) => {
    setPatientInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (patientInfo.fullName && patientInfo.age && patientInfo.gender) {
      onPatientInfoSubmit(patientInfo);
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Thông Tin Bệnh Nhân
        </h2>
        <p className="text-gray-600">
          Vui lòng cung cấp thông tin cá nhân của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patientInfo.fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("fullName", e.target.value)
              }
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tuổi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={patientInfo.age}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("age", e.target.value)
              }
              placeholder="30"
              min={1}
              max={120}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {["Nam", "Nữ", "Khác"].map((genderOption) => (
                <label key={genderOption} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={genderOption}
                    checked={patientInfo.gender === genderOption}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "gender",
                        e.target.value as PatientInfo["gender"]
                      )
                    }
                    className="h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-700">{genderOption}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cân nặng (kg)
            </label>
            <input
              type="number"
              value={patientInfo.weight}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("weight", e.target.value)
              }
              placeholder="70"
              min={1}
              max={300}
              step={0.1}
              className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều cao (cm)
            </label>
            <input
              type="number"
              value={patientInfo.height}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("height", e.target.value)
              }
              placeholder="170"
              min={50}
              max={250}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Height */}
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Tiếp tục →
          </button>
        </div>
      </form>
    </div>
  );
};
