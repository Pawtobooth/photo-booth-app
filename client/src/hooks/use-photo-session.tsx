import { useState, useCallback } from "react";

interface PhotoData {
  id: string;
  dataUrl: string;
  timestamp: Date;
}

interface SessionState {
  sessionId: string;
  selectedFormat: "4r-grid" | "photo-strip";
  selectedBackground: "white" | "black";
  copyCount: number;
  capturedPhotos: PhotoData[];
}

export function usePhotoSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: `session-${Date.now()}`,
    selectedFormat: "4r-grid",
    selectedBackground: "white",
    copyCount: 1,
    capturedPhotos: []
  });

  const updatePrintFormat = useCallback((format: "4r-grid" | "photo-strip") => {
    setSessionState(prev => ({ ...prev, selectedFormat: format }));
  }, []);

  const updateBackgroundColor = useCallback((background: "white" | "black") => {
    setSessionState(prev => ({ ...prev, selectedBackground: background }));
  }, []);

  const updateCopyCount = useCallback((count: number) => {
    setSessionState(prev => ({ ...prev, copyCount: Math.max(1, Math.min(10, count)) }));
  }, []);

  const addPhoto = useCallback((photoDataUrl: string) => {
    setSessionState(prev => {
      if (prev.capturedPhotos.length >= 4) return prev;
      
      const newPhoto: PhotoData = {
        id: `photo-${Date.now()}`,
        dataUrl: photoDataUrl,
        timestamp: new Date()
      };
      
      return {
        ...prev,
        capturedPhotos: [...prev.capturedPhotos, newPhoto]
      };
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setSessionState(prev => ({
      ...prev,
      capturedPhotos: prev.capturedPhotos.filter((_, i) => i !== index)
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSessionState({
      sessionId: `session-${Date.now()}`,
      selectedFormat: "4r-grid",
      selectedBackground: "white",
      copyCount: 1,
      capturedPhotos: []
    });
  }, []);

  const getCurrentStep = useCallback(() => {
    const photoCount = sessionState.capturedPhotos.length;
    if (photoCount === 0) return 1; // Setup
    if (photoCount < 4) return 2; // Capture
    if (photoCount === 4) return 3; // Preview
    return 4; // Print
  }, [sessionState.capturedPhotos.length]);

  const getProgressPercentage = useCallback(() => {
    const step = getCurrentStep();
    return (step / 4) * 100;
  }, [getCurrentStep]);

  return {
    sessionState,
    updatePrintFormat,
    updateBackgroundColor,
    updateCopyCount,
    addPhoto,
    removePhoto,
    resetSession,
    getCurrentStep,
    getProgressPercentage
  };
}
