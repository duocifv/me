"use client";

import React, { useEffect, useRef, useState } from "react";
import { systemInfoMap, typedSymptomData } from "./components/medical-icon";

// === Type definitions ===
type Symptom = {
  sign: string;
  description: string;
};

type AnatomicalPart = {
  anatomicalPart: string;
  clinicalSigns: Symptom[];
};

export type SystemData = {
  system: string;
  description: string;
  anatomicalParts: AnatomicalPart[];
};

// Lấy tên hệ cơ quan từ data để autocomplete
type SystemName = (typeof typedSymptomData)[number]["system"];

export default function SymptomSelector() {
  type DivRef = React.RefObject<HTMLDivElement | null>;

  const systemRefs = useRef<Record<SystemData["system"], DivRef>>(
    {} as Record<SystemData["system"], DivRef>
  );

  const [expandedSystems, setExpandedSystems] = useState<Set<SystemName>>(
    new Set()
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [matchedSystems, setMatchedSystems] = useState<Set<SystemName>>(
    new Set()
  );
  const [activeSystem, setActiveSystem] = useState<SystemName | null>(null);

  // Initialize refs
  useEffect(() => {
    typedSymptomData.forEach((system) => {
      if (!systemRefs.current[system.system]) {
        systemRefs.current[system.system] = React.createRef<HTMLDivElement>();
      }
    });
  }, []);

  const scrollToSystem = (system: SystemName) => {
    const ref = systemRefs.current[system];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setExpandedSystems((prev) => new Set(prev).add(system));
      setActiveSystem(system);

      // Auto expand parts
      setTimeout(() => {
        const systemData = typedSymptomData.find((s) => s.system === system);
        if (systemData) {
          const allParts = systemData.anatomicalParts.map(
            (part) => part.anatomicalPart
          );
          // expand logic...
          console.log("Expanding parts:", allParts);
        }
      }, 300);
    }
  };

  const handleSymptomSearch = (input: string) => {
    const matches = new Set<SystemName>();
    if (input.trim() === "") {
      setMatchedSystems(new Set());
      return;
    }

    typedSymptomData.forEach((system) => {
      system.anatomicalParts.forEach((part) => {
        part.clinicalSigns.forEach((symptom) => {
          if (
            symptom.sign.toLowerCase().includes(input.toLowerCase()) ||
            symptom.description.toLowerCase().includes(input.toLowerCase())
          ) {
            matches.add(system.system);
          }
        });
      });
    });
    setMatchedSystems(matches);
  };

  const handleCheckboxChange = (symptom: string, checked: boolean) => {
    setSelectedSymptoms((prev) =>
      checked ? [...prev, symptom] : prev.filter((s) => s !== symptom)
    );
  };

  const clearAllSelections = () => {
    setSelectedSymptoms([]);
  };

  const removeSymptom = (symptomToRemove: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptomToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Chọn Triệu Chứng Lâm Sàng
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm và chọn các triệu chứng để hỗ trợ chẩn đoán y khoa. Sử dụng
            thanh tìm kiếm để nhanh chóng xác định hệ cơ quan liên quan.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Symptom List */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Danh sách triệu chứng theo hệ cơ quan
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedSymptoms.length} triệu chứng đã chọn
                  </span>
                  {selectedSymptoms.length > 0 && (
                    <button
                      onClick={clearAllSelections}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {typedSymptomData.map((system) => {
                  const isExpanded = expandedSystems.has(system.system);
                  const isActive = activeSystem === system.system;

                  return (
                    <div
                      key={system.system}
                      ref={systemRefs.current[system.system]}
                      className={`border rounded-lg transition-all duration-300 ${
                        isActive
                          ? "border-blue-500 shadow-md bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`p-4 cursor-pointer flex items-center justify-between ${
                          isActive ? "bg-blue-100" : "bg-gray-50"
                        }`}
                        onClick={() => {
                          setExpandedSystems((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(system.system)) {
                              newSet.delete(system.system);
                            } else {
                              newSet.add(system.system);
                            }
                            return newSet;
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {systemInfoMap[system.system]?.Icon}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                              {system.system}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {system.description}
                            </p>
                          </div>
                        </div>
                        <div className="transform transition-transform duration-200">
                          {isExpanded ? "▲" : "▼"}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {system.anatomicalParts.map((part) => (
                              <div
                                key={part.anatomicalPart}
                                className="border rounded-lg p-4 bg-white"
                              >
                                <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b">
                                  {part.anatomicalPart}
                                </h4>
                                <div className="space-y-3">
                                  {part.clinicalSigns.map((symptom) => (
                                    <label
                                      key={symptom.sign}
                                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedSymptoms.includes(
                                          symptom.sign
                                        )}
                                        onChange={(e) =>
                                          handleCheckboxChange(
                                            symptom.sign,
                                            e.target.checked
                                          )
                                        }
                                        className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                      <div>
                                        <p className="font-medium text-gray-800">
                                          {symptom.sign}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {symptom.description}
                                        </p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Search and Selected Symptoms */}
          <div className="w-full lg:w-1/4">
            <div className="sticky top-6 space-y-6">
              {/* Search Section */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  🔍 Tìm kiếm triệu chứng
                </h3>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    handleSymptomSearch(e.target.value);
                  }}
                  placeholder="Nhập triệu chứng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                {searchInput && (
                  <div className="mt-4">
                    {matchedSystems.size > 0 ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Hệ cơ quan phù hợp:
                        </p>
                        <div className="space-y-2">
                          {[...matchedSystems].map((system) => (
                            <button
                              key={system}
                              onClick={() => scrollToSystem(system)}
                              className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-2"
                            >
                              <span>{systemInfoMap[system]?.Icon}</span>
                              <span className="font-medium">{system}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">😔</div>
                        <p className="text-gray-600 text-sm">
                          Không tìm thấy hệ cơ quan phù hợp
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Symptoms */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    ✅ Triệu chứng đã chọn
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {selectedSymptoms.length}
                  </span>
                </div>

                {selectedSymptoms.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedSymptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {symptom}
                        </span>
                        <button
                          onClick={() => removeSymptom(symptom)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm">Chưa có triệu chứng nào được chọn</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
                <h3 className="font-semibold text-lg mb-3">
                  ⚡ Thao tác nhanh
                </h3>
                <button
                  disabled={selectedSymptoms.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedSymptoms.length > 0
                      ? "bg-white text-blue-600 hover:bg-gray-100 shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Chẩn đoán bệnh
                </button>
                <button className="w-full mt-2 py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-colors border border-blue-400">
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
