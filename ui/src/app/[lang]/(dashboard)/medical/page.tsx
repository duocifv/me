"use client";
import React, { useState } from "react";
import { SymptomSearchStep } from "./components/SymptomSearchStep";
import DetailedSymptomsStep from "./components/DetailedSymptomsStep";
import ConfirmationStep, {
  DetailedSymptoms,
} from "./components/ConfirmationStep";
import { ProcessingStep } from "./components/ProcessingStep";
import ResultsStep from "./components/ResultsStep";
import { MedicalHistoryStep } from "./components/MedicalHistoryStep";
import { PatientInfoStep } from "./components/PatientInfoStep";
import { generateSummaryText } from "./components/generateSummaryText";
import { useMedicalStore } from "@/module/medical/medical.store";
import { MedicalHistory, PatientInfo } from "@/module/medical/medical.type";
import { useMedicalMutation } from "@/module/medical/medical.hook.";

export default function MedicalDiagnosisApp() {
  const { mutate } = useMedicalMutation();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const {
    patientInfo,
    basicSymptoms,
    detailedSymptoms,
    medicalHistory,
    setPatientInfo,
    setBasicSymptoms,
    setDetailedSymptoms,
    setMedicalHistory,
  } = useMedicalStore((s) => s);

  const handlePatientInfoSubmit = (info: PatientInfo) => {
    setPatientInfo(info);
  };

  const handleSymptomsSelect = (symptoms: string[]): void => {
    setBasicSymptoms(symptoms);
  };

  const handleDetailedSymptomsSubmit = (symptoms: DetailedSymptoms): void => {
    setDetailedSymptoms(symptoms);
  };

  const handleMedicalHistorySubmit = (history: MedicalHistory): void => {
    setMedicalHistory(history);
  };

  const handleNext = () => {
    if (currentStep === 4) {
      const summaryText = generateSummaryText(
        patientInfo,
        basicSymptoms,
        detailedSymptoms,
        medicalHistory
      );
      setCurrentStep(5); // chuyển sang bước xử lý ngay khi gọi mutate
      mutate(summaryText, {
        onSuccess: () => {
          console.log("Summary Text sắp gửi:", summaryText);
          setCurrentStep(6);
        },
        onError: (error) => {
          console.error("Lỗi khi gửi dữ liệu:", error);
          // Có thể chuyển về bước 4 để người dùng sửa hoặc hiện thông báo lỗi
          setCurrentStep(4);
          alert("Có lỗi xảy ra khi gửi dữ liệu, vui lòng thử lại.");
        },
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRestart = (): void => {
    setCurrentStep(0);
    setPatientInfo(patientInfo);
    setBasicSymptoms([]);
    setDetailedSymptoms(detailedSymptoms);
    setMedicalHistory(medicalHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <div
                className={`w-12 h-1 ${
                  currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <div
                className={`w-12 h-1 ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <div
                className={`w-12 h-1 ${
                  currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                4
              </div>
              <div
                className={`w-12 h-1 ${
                  currentStep >= 4 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 5
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                5
              </div>
              <div
                className={`w-12 h-1 ${
                  currentStep >= 6 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 6
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                6
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {currentStep === 0 && "Thông tin bệnh nhân"}
              {currentStep === 1 && "Chọn triệu chứng cơ bản"}
              {currentStep === 2 && "Nhập thông tin chi tiết"}
              {currentStep === 3 && "Tiền sử y khoa"}
              {currentStep === 4 && "Xác nhận thông tin"}
              {currentStep === 5 && "Đang xử lý chẩn đoán"}
              {currentStep === 6 && "Kết quả chẩn đoán"}
            </p>
          </div>
        </div>

        {/* Form Content */}
        {currentStep === 0 && (
          <PatientInfoStep
            onNext={handleNext}
            onPatientInfoSubmit={handlePatientInfoSubmit}
          />
        )}
        {currentStep === 1 && (
          <SymptomSearchStep
            onNext={handleNext}
            onSymptomsSelect={handleSymptomsSelect}
          />
        )}
        {currentStep === 2 && (
          <DetailedSymptomsStep
            onPrev={handlePrev}
            onNext={handleNext}
            onDetailedSymptomsSubmit={handleDetailedSymptomsSubmit}
          />
        )}
        {currentStep === 3 && (
          <MedicalHistoryStep
            onPrev={handlePrev}
            onNext={handleNext}
            onMedicalHistorySubmit={handleMedicalHistorySubmit}
          />
        )}
        {currentStep === 4 && (
          <ConfirmationStep
            patientInfo={patientInfo}
            basicSymptoms={basicSymptoms}
            detailedSymptoms={detailedSymptoms}
            medicalHistory={medicalHistory}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        {currentStep === 5 && <ProcessingStep />}
        {currentStep === 6 && <ResultsStep onRestart={handleRestart} />}
      </div>
    </div>
  );
}
