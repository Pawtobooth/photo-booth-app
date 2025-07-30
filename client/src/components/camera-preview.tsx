import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";

interface CameraPreviewProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  isSessionActive: boolean;
  photoCount: number;
}

export default function CameraPreview({
  onPhotoCapture,
  isSessionActive,
  photoCount
}: CameraPreviewProps) {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showFlash, setShowFlash] = useState(false);
  const [confetti, setConfetti] = useState<Array<{id: number, color: string, left: number}>>([]);
  const { videoRef, canvasRef, isReady, capturePhoto } = useCamera();

  const startCountdown = () => {
    if (!isSessionActive || isCountingDown) return;
    
    setIsCountingDown(true);
    let count = 5;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownInterval);
        handleCapture();
      }
    }, 1000);
  };

  const handleCapture = async () => {
    try {
      // Flash effect
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);

      // Capture photo
      const photoDataUrl = await capturePhoto();
      if (photoDataUrl) {
        onPhotoCapture(photoDataUrl);
        
        // Confetti effect
        createConfetti();
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCountingDown(false);
    }
  };

  const createConfetti = () => {
    const colors = ['#FF5722', '#FFC107', '#4CAF50', '#2196F3', '#E91E63'];
    const newConfetti = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100
    }));
    
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 2000);
  };

  return (
    <main className="flex-1 bg-gray-100 relative overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Camera Preview Area */}
        <div className="flex-1 relative bg-black">
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Hidden canvas for photo capture */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Camera overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 border-2 border-white/50 rounded-lg"></div>
          </div>
          
          {/* Flash Effect */}
          {showFlash && (
            <div className="flash-effect absolute inset-0 bg-white opacity-0 pointer-events-none" />
          )}
          
          {/* Countdown Overlay */}
          {isCountingDown && (
            <div className="countdown-overlay absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl font-bold text-white mb-4">{countdown}</div>
                <div className="text-xl text-white">Get ready!</div>
              </div>
            </div>
          )}
          
          {/* Capture Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={startCountdown}
              disabled={!isReady || !isSessionActive || isCountingDown}
              className="w-20 h-20 bg-[var(--paw-orange)] hover:bg-[var(--paw-orange-dark)] rounded-full border-4 border-white shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Camera className="text-white text-2xl" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confetti Container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map(({ id, color, left }) => (
          <div
            key={id}
            className="confetti absolute w-3 h-3 rounded"
            style={{
              backgroundColor: color,
              left: `${left}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </main>
  );
}
