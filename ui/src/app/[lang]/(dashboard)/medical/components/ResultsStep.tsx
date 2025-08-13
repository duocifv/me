"use client";

import { useMedicalStore } from "@/module/medical/medical.store";
import React from "react";

interface ResultsStepProps {
  onRestart: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ onRestart }) => {
  const resultsStep = useMedicalStore((s) => s.resultsStep);

  const renderList = (list: string | string[]) => {
    const arr = Array.isArray(list) ? list : list.split("\n").filter(Boolean);
    return arr.map((item, idx) => (
      <li key={idx} className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <span className="ml-3 text-gray-700">{item}</span>
      </li>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Kết Quả Chẩn Đoán
            </h2>
            <p className="text-blue-100">
              Dựa trên các triệu chứng bạn cung cấp
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Diagnosis & Severity */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                Chẩn đoán chính
              </h3>
              <p>
                <strong>Bệnh:</strong> {resultsStep.diagnosis}
              </p>
              <p>
                <strong>Mức độ:</strong> {resultsStep.severity}
              </p>
              <p>
                <strong>Độ chính xác:</strong> {resultsStep.confidence_percent}%
              </p>
            </div>

            {/* User friendly summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                Tóm tắt dễ hiểu
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {resultsStep.user_friendly_summary}
              </p>
            </div>

            {/* Confidence */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Mức độ chắc chắn
              </h3>
              <p className="text-xl font-bold text-blue-700">
                {resultsStep.confidence_level}
              </p>
            </div>

            {/* Explanation */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                Phân tích chi tiết
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {resultsStep.explanation}
              </p>
            </div>

            {/* Management Advice */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                Xử trí / Khuyến nghị
              </h3>
              <ul className="space-y-3">
                {renderList(resultsStep.management_advice)}
              </ul>
            </div>

            {/* Red Flags */}
            {resultsStep.red_flags && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 shadow-sm">
                <h3 className="font-semibold text-xl text-red-800 mb-2">
                  Cảnh báo
                </h3>
                <ul className="space-y-3">
                  {renderList(resultsStep.red_flags)}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                onClick={() => window.print()}
              >
                In kết quả
              </button>
              <button
                onClick={onRestart}
                className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Bắt đầu lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;
