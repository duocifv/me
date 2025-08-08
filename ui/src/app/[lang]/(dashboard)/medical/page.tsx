"use client";
import React, { useState } from "react";
import { SymptomSearchStep } from "./components/SymptomSearchStep";
import DetailedSymptomsStep from "./components/DetailedSymptomsStep";
import ConfirmationStep from "./components/ConfirmationStep";
import { ProcessingStep } from "./components/ProcessingStep";
import ResultsStep from "./components/ResultsStep";
import { MedicalHistoryStep } from "./components/MedicalHistoryStep";

interface DetailedSymptoms {
  painIntensity: string;
  painDuration: string;
  painLocation: string;
  associatedSymptoms: string[];
  aggravatingFactors: string[];
  relievingFactors: string[];
}

export interface MedicalHistory {
  chronicConditions: string[];
  allergies: string;
  currentMedications: string;
  previousSurgeries: string;
  familyHistory: string[];
}

const initialDetailedSymptoms: DetailedSymptoms = {
  painIntensity: "",
  painDuration: "",
  painLocation: "",
  associatedSymptoms: [],
  aggravatingFactors: [],
  relievingFactors: [],
};

const initialMedicalHistory: MedicalHistory = {
  chronicConditions: [],
  allergies: "",
  currentMedications: "",
  previousSurgeries: "",
  familyHistory: [],
};

export default function MedicalDiagnosisApp() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [basicSymptoms, setBasicSymptoms] = useState<string[]>([]);
  const [detailedSymptoms, setDetailedSymptoms] = useState<DetailedSymptoms>(
    initialDetailedSymptoms
  );
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>(
    initialMedicalHistory
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSymptomsSelect = (symptoms: string[]): void => {
    setBasicSymptoms(symptoms);
  };

  const handleDetailedSymptomsSubmit = (symptoms: DetailedSymptoms): void => {
    setDetailedSymptoms(symptoms);
  };

  const handleMedicalHistorySubmit = (history: MedicalHistory): void => {
    setMedicalHistory(history);
  };

  const handleNext = (): void => {
    if (currentStep === 4) {
      setCurrentStep(5);
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(6);
      }, 3000);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRestart = (): void => {
    setCurrentStep(1);
    setBasicSymptoms([]);
    setDetailedSymptoms(initialDetailedSymptoms);
    setMedicalHistory(initialMedicalHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-16 h-1 ${
                        currentStep > step ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
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
            basicSymptoms={basicSymptoms}
            detailedSymptoms={detailedSymptoms}
            medicalHistory={medicalHistory}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
        {currentStep === 5 && isProcessing && <ProcessingStep />}
        {currentStep === 6 && <ResultsStep onRestart={handleRestart} />}
      </div>
    </div>
  );
}
