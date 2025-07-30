import { LayoutGrid, AlignJustify, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ControlSidebarProps {
  selectedFormat: "4r-grid" | "photo-strip";
  selectedBackground: "white" | "black";
  copyCount: number;
  onFormatChange: (format: "4r-grid" | "photo-strip") => void;
  onBackgroundChange: (background: "white" | "black") => void;
  onCopyCountChange: (count: number) => void;
}

export default function ControlSidebar({
  selectedFormat,
  selectedBackground,
  copyCount,
  onFormatChange,
  onBackgroundChange,
  onCopyCountChange
}: ControlSidebarProps) {
  return (
    <aside className="w-80 bg-white shadow-lg p-6 flex flex-col gap-6">
      {/* Print Format Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Print Format</h3>
        
        {/* 4R Grid Option */}
        <Card 
          className={`print-format-card cursor-pointer p-4 mb-4 transition-all duration-200 hover:shadow-lg ${
            selectedFormat === "4r-grid" 
              ? "border-[var(--paw-orange)] bg-orange-50" 
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onFormatChange("4r-grid")}
        >
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
              selectedFormat === "4r-grid" 
                ? "bg-[var(--paw-orange)]" 
                : "bg-gray-100"
            }`}>
              <LayoutGrid className={`text-xl ${
                selectedFormat === "4r-grid" ? "text-white" : "text-gray-600"
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">4R Grid</h4>
              <p className="text-sm text-gray-600">4 photos in print layout</p>
              <p className="text-xs text-gray-500">6" × 4" grid size</p>
            </div>
          </div>
        </Card>
        
        {/* Photo Strip Option */}
        <Card 
          className={`print-format-card cursor-pointer p-4 transition-all duration-200 hover:shadow-lg ${
            selectedFormat === "photo-strip" 
              ? "border-[var(--paw-orange)] bg-orange-50" 
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onFormatChange("photo-strip")}
        >
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
              selectedFormat === "photo-strip" 
                ? "bg-[var(--paw-orange)]" 
                : "bg-gray-100"
            }`}>
              <AlignJustify className={`text-xl ${
                selectedFormat === "photo-strip" ? "text-white" : "text-gray-600"
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Photo Strip</h4>
              <p className="text-sm text-gray-600">4 photos in strip</p>
              <p className="text-xs text-gray-500">2" × 6" strip size</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Background Color Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Background Color</h3>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className={`bg-toggle flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
              selectedBackground === "white" 
                ? "border-[var(--paw-orange)] shadow-lg scale-105" 
                : "border-gray-300"
            }`}
            onClick={() => onBackgroundChange("white")}
          >
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span className="font-medium text-gray-700">White</span>
          </Button>
          <Button
            variant="outline"
            className={`bg-toggle flex-1 bg-gray-900 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
              selectedBackground === "black" 
                ? "border-[var(--paw-orange)] shadow-lg scale-105" 
                : "border-gray-300"
            }`}
            onClick={() => onBackgroundChange("black")}
          >
            <div className="w-4 h-4 bg-black rounded"></div>
            <span className="font-medium text-white">Black</span>
          </Button>
        </div>
      </div>
      
      {/* Copy Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Number of Copies</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full"
            onClick={() => copyCount > 1 && onCopyCountChange(copyCount - 1)}
            disabled={copyCount <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-2xl font-bold text-gray-800 w-8 text-center">{copyCount}</span>
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full"
            onClick={() => copyCount < 10 && onCopyCountChange(copyCount + 1)}
            disabled={copyCount >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
