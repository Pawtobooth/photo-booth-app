import { useState } from "react";
import { Camera, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CameraPreview from "@/components/camera-preview";
import ControlSidebar from "@/components/control-sidebar";
import InfoPanel from "@/components/info-panel";
import PrintOptionsModal from "@/components/print-options-modal";
import { usePhotoSession } from "@/hooks/use-photo-session";

export default function Photobooth() {
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const {
    sessionState,
    updatePrintFormat,
    updateBackgroundColor,
    updateCopyCount,
    addPhoto,
    removePhoto,
    resetSession,
    getCurrentStep,
    getProgressPercentage
  } = usePhotoSession();

  const handleStartSession = () => {
    if (sessionState.capturedPhotos.length === 4) {
      setShowPrintOptions(true);
    }
  };

  const handlePhotoCapture = (photoDataUrl: string) => {
    addPhoto(photoDataUrl);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Camera className="text-2xl text-[var(--paw-orange)]" />
          <h1 className="text-2xl font-bold text-[var(--paw-orange)]">Pawtobooth</h1>
          <span className="text-sm text-gray-500 ml-2">four dimensions of life</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Step <span>{getCurrentStep()}</span> of 4
          </div>
          <div className="w-64">
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <ControlSidebar
          selectedFormat={sessionState.selectedFormat}
          selectedBackground={sessionState.selectedBackground}
          copyCount={sessionState.copyCount}
          onFormatChange={updatePrintFormat}
          onBackgroundChange={updateBackgroundColor}
          onCopyCountChange={updateCopyCount}
        />

        {/* Center - Camera Preview */}
        <CameraPreview
          onPhotoCapture={handlePhotoCapture}
          isSessionActive={sessionState.capturedPhotos.length < 4}
          photoCount={sessionState.capturedPhotos.length}
        />

        {/* Right - Info Panel */}
        <InfoPanel
          capturedPhotos={sessionState.capturedPhotos}
          selectedFormat={sessionState.selectedFormat}
          selectedBackground={sessionState.selectedBackground}
          copyCount={sessionState.copyCount}
          onRemovePhoto={removePhoto}
        />
      </div>

      {/* Bottom Action Bar */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Button>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={resetSession}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </Button>
            
            <Button 
              onClick={handleStartSession}
              className="bg-[var(--paw-orange)] hover:bg-[var(--paw-orange-dark)] text-white"
            >
              {sessionState.capturedPhotos.length === 4 ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Continue to Print Options
                </>
              ) : sessionState.capturedPhotos.length > 0 ? (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo {sessionState.capturedPhotos.length + 1} of 4
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Photo Session
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>

      {/* Print Options Modal */}
      <PrintOptionsModal
        isOpen={showPrintOptions}
        onClose={() => setShowPrintOptions(false)}
        sessionState={sessionState}
      />
    </div>
  );
}
