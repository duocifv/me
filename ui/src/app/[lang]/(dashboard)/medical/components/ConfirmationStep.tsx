import React from "react";
import { MedicalHistory, PatientInfo } from "@/module/medical/medical.type";

export interface DetailedSymptoms {
  painIntensity: string;
  painDuration: string;
  painLocation: string;
  associatedSymptoms: string[];
  aggravatingFactors: string[];
  relievingFactors: string[];
}

interface ConfirmationStepProps {
  patientInfo: PatientInfo;
  basicSymptoms: string[];
  detailedSymptoms: DetailedSymptoms;
  medicalHistory: MedicalHistory;
  onPrev: () => void;
  onNext: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  patientInfo,
  basicSymptoms,
  detailedSymptoms,
  medicalHistory,
  onPrev,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bước 3: Xác Nhận Thông Tin
        </h2>
        <p className="text-gray-600">
          Vui lòng kiểm tra lại thông tin trước khi gửi
        </p>
      </div>

      <div className="space-y-6">
        {/* Patient Information */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Thông tin bệnh nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Họ và tên:</p>
              <p className="font-medium">{patientInfo.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600">Tuổi:</p>
              <p className="font-medium">{patientInfo.age} tuổi</p>
            </div>
            <div>
              <p className="text-gray-600">Giới tính:</p>
              <p className="font-medium">{patientInfo.gender}</p>
            </div>
            {patientInfo.weight && (
              <div>
                <p className="text-gray-600">Cân nặng:</p>
                <p className="font-medium">{patientInfo.weight} kg</p>
              </div>
            )}
            {patientInfo.height && (
              <div>
                <p className="text-gray-600">Chiều cao:</p>
                <p className="font-medium">{patientInfo.height} cm</p>
              </div>
            )}
            {patientInfo.phone && (
              <div>
                <p className="text-gray-600">Điện thoại:</p>
                <p className="font-medium">{patientInfo.phone}</p>
              </div>
            )}
            {patientInfo.email && (
              <div className="md:col-span-2">
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{patientInfo.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Basic Symptoms */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Triệu chứng cơ bản
          </h3>
          <div className="flex flex-wrap gap-2">
            {basicSymptoms.map((symptom, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Information */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Thông tin chi tiết
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Mức độ đau:</p>
              <p className="font-medium">
                {detailedSymptoms.painIntensity || "Chưa chọn"}/10
              </p>
            </div>
            <div>
              <p className="text-gray-600">Thời gian xuất hiện:</p>
              <p className="font-medium">
                {detailedSymptoms.painDuration || "Chưa chọn"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Vị trí đau:</p>
              <p className="font-medium">
                {detailedSymptoms.painLocation || "Chưa nhập"}
              </p>
            </div>
          </div>
        </div>

        {/* Associated Symptoms */}
        {detailedSymptoms.associatedSymptoms.length > 0 && (
          <div className="border rounded-lg p-5">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">
              Triệu chứng kèm theo
            </h3>
            <div className="flex flex-wrap gap-2">
              {detailedSymptoms.associatedSymptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Aggravating Factors */}
        {detailedSymptoms.aggravatingFactors.length > 0 && (
          <div className="border rounded-lg p-5">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">
              Yếu tố làm tăng đau
            </h3>
            <div className="flex flex-wrap gap-2">
              {detailedSymptoms.aggravatingFactors.map((factor, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relieving Factors */}
        {detailedSymptoms.relievingFactors.length > 0 && (
          <div className="border rounded-lg p-5">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">
              Yếu tố làm giảm đau
            </h3>
            <div className="flex flex-wrap gap-2">
              {detailedSymptoms.relievingFactors.map((factor, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medical History */}
        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">
            Tiền sử y khoa
          </h3>

          {medicalHistory.chronicConditions.length > 0 && (
            <div className="mb-3">
              <p className="text-gray-600">Bệnh mãn tính:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {medicalHistory.chronicConditions.map((condition, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {medicalHistory.allergies && (
            <div className="mb-3">
              <p className="text-gray-600">Dị ứng:</p>
              <p className="font-medium">{medicalHistory.allergies}</p>
            </div>
          )}

          {medicalHistory.currentMedications && (
            <div className="mb-3">
              <p className="text-gray-600">Thuốc đang dùng:</p>
              <p className="font-medium">{medicalHistory.currentMedications}</p>
            </div>
          )}

          {medicalHistory.previousSurgeries && (
            <div className="mb-3">
              <p className="text-gray-600">Tiền sử phẫu thuật:</p>
              <p className="font-medium">{medicalHistory.previousSurgeries}</p>
            </div>
          )}

          {medicalHistory.familyHistory.length > 0 && (
            <div>
              <p className="text-gray-600">Tiền sử gia đình:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {medicalHistory.familyHistory.map((condition, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
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
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Xác nhận và chẩn đoán
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
