import { Camera, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface InfoPanelProps {
  capturedPhotos: Array<{ id: string; dataUrl: string; timestamp: Date }>;
  selectedFormat: "4r-grid" | "photo-strip";
  selectedBackground: "white" | "black";
  copyCount: number;
  onRemovePhoto: (index: number) => void;
}

export default function InfoPanel({
  capturedPhotos,
  selectedFormat,
  selectedBackground,
  copyCount,
  onRemovePhoto
}: InfoPanelProps) {
  return (
    <aside className="w-64 bg-white shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo Preview</h3>
      
      {/* Photo thumbnails */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Array.from({ length: 4 }, (_, index) => {
          const photo = capturedPhotos[index];
          return (
            <div 
              key={index}
              className={`photo-slot aspect-square rounded-lg flex items-center justify-center ${
                photo 
                  ? "border-2 border-[var(--paw-orange)] bg-orange-50" 
                  : "border-2 border-dashed border-gray-300 bg-gray-50"
              }`}
            >
              {photo ? (
                <div className="relative w-full h-full">
                  <img 
                    src={photo.dataUrl} 
                    alt={`Captured photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    onClick={() => onRemovePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Camera className="text-gray-400 text-2xl" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200 p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Instructions
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Position yourself in the frame</li>
          <li>• Click the orange camera button</li>
          <li>• Follow the 5-second countdown</li>
          <li>• Take 4 amazing photos!</li>
        </ul>
      </Card>
      
      {/* Current Settings Summary */}
      <Card className="bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Current Settings</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            Format: <span className="font-medium">
              {selectedFormat === "4r-grid" ? "4R Grid" : "Photo Strip"}
            </span>
          </div>
          <div>
            Background: <span className="font-medium">
              {selectedBackground === "white" ? "White" : "Black"}
            </span>
          </div>
          <div>
            Copies: <span className="font-medium">{copyCount}</span>
          </div>
        </div>
      </Card>
    </aside>
  );
}
