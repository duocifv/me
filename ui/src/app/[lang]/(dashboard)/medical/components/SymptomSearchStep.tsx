"use client";
import React, { useEffect, useRef, useState } from "react";
import { systemInfoMap, typedSymptomData } from "./medical-icon";

interface SymptomSearchStepProps {
  onNext: () => void;
  onSymptomsSelect: (selectedSymptoms: string[]) => void;
}

export const SymptomSearchStep: React.FC<SymptomSearchStepProps> = ({
  onNext,
  onSymptomsSelect,
}) => {
  const [basicSymptoms, setBasicSymptoms] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [matchedSystems, setMatchedSystems] = useState<Set<string>>(new Set());

  // Theo dõi hệ đang mở
  const [expandedSystems, setExpandedSystems] = useState<
    Record<string, boolean>
  >({});

  // Tên hệ cần scroll tới
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  type DivRef = React.RefObject<HTMLDivElement | null>;
  const systemRefs = useRef<Record<string, DivRef>>(
    {} as Record<string, DivRef>
  );

  useEffect(() => {
    typedSymptomData.forEach((system) => {
      if (!systemRefs.current[system.system]) {
        systemRefs.current[system.system] = React.createRef<HTMLDivElement>();
      }
    });
  }, []);

  const toggleSystem = (systemName: string) => {
    setExpandedSystems((prev) => ({
      ...prev,
      [systemName]: !prev[systemName],
    }));
  };

  // Mở hệ và set scroll target
  const scrollToSystem = (systemName: string) => {
    setExpandedSystems((prev) => ({
      ...prev,
      [systemName]: true,
    }));
    setScrollTarget(systemName);
  };

  // Khi hệ được mở và là scrollTarget thì scroll tới phần tử đó
  useEffect(() => {
    if (scrollTarget && expandedSystems[scrollTarget]) {
      const ref = systemRefs.current[scrollTarget];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setScrollTarget(null); // Reset để không scroll lại lần nữa
      }
    }
  }, [expandedSystems, scrollTarget]);

  const handleSymptomSearch = (input: string) => {
    const matches = new Set<string>();
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
    setBasicSymptoms((prev) =>
      checked ? [...prev, symptom] : prev.filter((s) => s !== symptom)
    );
  };

  const handleSubmit = () => {
    onSymptomsSelect(basicSymptoms);
    onNext();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bước 1: Chọn Triệu Chứng Cơ Bản
        </h2>
        <p className="text-gray-600">
          Tìm kiếm hoặc duyệt qua các hệ cơ quan để chọn triệu chứng
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8 bg-gray-50 rounded-lg p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">
          🔍 Tìm kiếm triệu chứng
        </h3>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            handleSymptomSearch(e.target.value);
          }}
          placeholder="Nhập triệu chứng để tìm nhanh (ví dụ: đau đầu, ho, đau bụng...)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        {searchInput && (
          <div className="mt-4">
            {matchedSystems.size > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Kết quả tìm kiếm - Click để xem chi tiết:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...matchedSystems].map((systemName) => (
                    <button
                      key={systemName}
                      onClick={() => scrollToSystem(systemName)}
                      className="text-left p-3 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">
                        {systemInfoMap[systemName]?.Icon}
                      </span>
                      <span className="font-medium">{systemName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">😔</div>
                <p className="text-gray-600 text-sm">
                  Không tìm thấy kết quả phù hợp với {searchInput}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Symptoms List */}
      <div className="space-y-5">
        {typedSymptomData.map((system) => (
          <div
            key={system.system}
            ref={(el) => {
              if (el) {
                systemRefs.current[system.system] = { current: el };
              }
            }}
            className="border rounded-lg bg-gray-50"
          >
            <div
              className={`system-header p-4 cursor-pointer flex items-center justify-between rounded-t-lg select-none transition-colors ${
                expandedSystems[system.system]
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => toggleSystem(system.system)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {systemInfoMap[system.system]?.Icon}
                </span>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {system.system}
                  </h3>
                  <p className="text-sm text-gray-600">{system.description}</p>
                </div>
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  expandedSystems[system.system] ? "rotate-180" : ""
                }`}
              >
                ▼
              </div>
            </div>

            {expandedSystems[system.system] && (
              <div className="p-4 border-t">
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
                              checked={basicSymptoms.includes(symptom.sign)}
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
        ))}
      </div>

      {/* Selected Symptoms Summary */}
      {basicSymptoms.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            Triệu chứng đã chọn ({basicSymptoms.length}):
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
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={basicSymptoms.length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-all ${
            basicSymptoms.length > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Tiếp tục →
        </button>
      </div>
    </div>
  );
};
