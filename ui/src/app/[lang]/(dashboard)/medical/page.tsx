"use client";

import { JSX, useRef, useState } from "react";
import symptomData from "./data/symptoms.json";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

type Symptom = {
  sign: string;
  description: string;
};

type AnatomicalPart = {
  anatomicalPart: string;
  clinicalSigns: Symptom[];
};

type SystemData = {
  system: string;
  description: string;
  anatomicalParts: AnatomicalPart[];
};

const typedSymptomData: SystemData[] = symptomData;

// Gán biểu tượng SVG cho từng hệ
const systemInfoMap: Record<string, { Icon: JSX.Element }> = {
  "Hô hấp": {
    Icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-stethoscope-icon lucide-stethoscope"
      >
        <path d="M11 2v2" />
        <path d="M5 2v2" />
        <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
        <path d="M8 15a6 6 0 0 0 12 0v-3" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },

  "Tuần hoàn": {
    Icon: (
      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21C12 21 5 13.5 5 8.5C5 5.42 7.42 3 10.5 3C12.24 3 13.91 3.81 15 5.08C16.09 3.81 17.76 3 19.5 3C22.58 3 25 5.42 25 8.5C25 13.5 18 21 18 21H12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Thần kinh": {
    Icon: (
      <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },

  "Tiêu hóa": {
    Icon: (
      <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 4V12C8 14 10 16 12 16C14 16 16 14 16 12V4M12 16V20"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Cơ xương khớp": {
    Icon: (
      <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 12L18 12M12 6L12 18"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Nội tiết": {
    Icon: (
      <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 12L16 12M12 8L12 16"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Niệu sinh dục": {
    Icon: (
      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2V22M5 8L12 15L19 8"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Miễn dịch": {
    Icon: (
      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 6V12C3 17 6.5 21 12 22C17.5 21 21 17 21 12V6L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },

  "Toàn thân": {
    Icon: (
      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="4" r="2" fill="currentColor" />
        <path
          d="M12 6V20M6 10H18M6 10L9 20M18 10L15 20"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
};

export default function SymptomSelector() {
  // Ref cho từng hệ để scroll
  const systemRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>(
    {}
  );
  // Trạng thái hệ Accordion đang mở (theo tên hệ)
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(
    new Set()
  );

  // Scroll tới hệ, đồng thời mở Accordion đó
  const scrollToSystem = (system: string) => {
    const ref = systemRefs.current[system];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setExpandedSystems((prev) => new Set(prev).add(system)); // mở hệ đó
    }
  };

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [matchedSystems, setMatchedSystems] = useState<Set<string>>(new Set());

  // Tìm hệ phù hợp dựa trên nhập triệu chứng
  const handleSymptomSearch = (input: string) => {
    const matches = new Set<string>();
    typedSymptomData.forEach((system) => {
      system.anatomicalParts.forEach((part) => {
        part.clinicalSigns.forEach((symptom) => {
          if (symptom.sign.toLowerCase().includes(input.toLowerCase())) {
            matches.add(system.system);
          }
        });
      });
    });
    setMatchedSystems(matches);
  };

  // Bật tắt checkbox triệu chứng
  const handleCheckboxChange = (symptom: string, checked: boolean) => {
    setSelectedSymptoms((prev) =>
      checked ? [...prev, symptom] : prev.filter((s) => s !== symptom)
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cột trái: Danh sách triệu chứng */}
        <div className="w-full md:w-2/3 space-y-6">
          {typedSymptomData.map((system) => {
            // Tạo ref nếu chưa có
            // if (!systemRefs.current[system.system]) {
            //   systemRefs.current[system.system] = React.createRef();
            // }

            // Kiểm tra hệ đang mở không
            const isExpanded = expandedSystems.has(system.system);

            return (
              <Card
                key={system.system}
                ref={systemRefs.current[system.system]}
                className="transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                    {systemInfoMap[system.system]?.Icon}
                    {system.system}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {system.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion
                    type="multiple"
                    defaultValue={
                      isExpanded
                        ? system.anatomicalParts.map(
                            (part) => part.anatomicalPart
                          )
                        : []
                    }
                  >
                    {system.anatomicalParts.map((part) => (
                      <AccordionItem
                        key={part.anatomicalPart}
                        value={part.anatomicalPart}
                      >
                        <AccordionTrigger className="text-base font-medium text-gray-800">
                          {part.anatomicalPart}
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 pl-2">
                          {part.clinicalSigns.map((symptom) => (
                            <Label
                              key={symptom.sign}
                              className="flex items-start gap-2"
                            >
                              <Checkbox
                                checked={selectedSymptoms.includes(
                                  symptom.sign
                                )}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(symptom.sign, !!checked)
                                }
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {symptom.sign}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {symptom.description}
                                </p>
                              </div>
                            </Label>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cột phải: Khu vực tìm kiếm và triệu chứng đã chọn */}
        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-md shadow-sm border h-fit sticky top-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Nhập triệu chứng để tìm hệ liên quan:
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                handleSymptomSearch(e.target.value);
              }}
              placeholder="Ví dụ: đau bụng, sốt, ho..."
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchInput && (
              <p className="text-sm text-gray-600 mt-2">
                {matchedSystems.size > 0 ? (
                  <>
                    🔎 Hệ phù hợp:{" "}
                    {[...matchedSystems].map((sys) => (
                      <button
                        key={sys}
                        onClick={() => scrollToSystem(sys)}
                        className="font-medium text-blue-600 underline hover:text-blue-800 mr-2 transition"
                      >
                        {sys}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    ❌ Không tìm thấy hệ phù hợp với triệu chứng {searchInput}
                  </>
                )}
              </p>
            )}
          </div>

          <h2 className="text-lg font-semibold mb-2 text-green-700">
            ✅ Triệu chứng đã chọn:
          </h2>
          {selectedSymptoms.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {selectedSymptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Chưa chọn triệu chứng nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
