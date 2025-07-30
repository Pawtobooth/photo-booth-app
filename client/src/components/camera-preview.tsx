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
    
    // Play initial countdown beep immediately on user click
    playCountdownBeep();
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep();
      } else {
        clearInterval(countdownInterval);
        handleCapture();
      }
    }, 1000);
  };

  const playCountdownBeep = async () => {
    console.log('Playing countdown beep...');
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed');
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Simple beep sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log('Countdown beep played successfully');
    } catch (error) {
      console.log('Web Audio API failed:', error);
      // Simple fallback beep
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJhfCeqbHHgdX4r4+x9rAn0Q==';
        audio.volume = 0.3;
        await audio.play();
        console.log('Fallback beep played');
      } catch (e) {
        console.log('All audio methods failed:', e);
      }
    }
  };

  const handleCapture = async () => {
    try {
      // Play camera shutter sound
      playCameraSound();
      
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

  const playCameraSound = async () => {
    console.log('Playing camera shutter sound...');
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed for camera sound');
      }
      
      // Create camera shutter sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Camera click sound
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      console.log('Camera shutter sound played successfully');
    } catch (error) {
      console.log('Web Audio API failed for camera sound:', error);
      // Fallback beep
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJhfCeqbHHgdX4r4+x9rAn0Q==';
        audio.volume = 0.5;
        await audio.play();
        console.log('Fallback camera sound played');
      } catch (e) {
        console.log('All camera audio methods failed:', e);
      }
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
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
              <div className="text-center">
                <div className="text-8xl font-bold text-white mb-4 drop-shadow-lg">{countdown}</div>
                <div className="text-xl text-white drop-shadow-md">Get ready!</div>
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
