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
    
    // Initialize audio context on user interaction
    initAudioContext();
    
    // Play initial countdown beep
    setTimeout(() => playCountdownBeep(), 100);
    
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

  const initAudioContext = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (error) {
      console.log('Could not initialize audio context');
    }
  };

  const playCountdownBeep = () => {
    // Create countdown beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Countdown beep - shorter and softer than camera sound
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Audio context not available:', error);
      // Fallback - try to beep using system sound
      try {
        // Create a short audio element as fallback
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJhfCeqbHHgdX4r4+x9rAn0Q==');
        audio.volume = 0.3;
        audio.play();
      } catch (e) {
        console.log('Fallback audio also failed');
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

  const playCameraSound = () => {
    // Create camera shutter sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create a more realistic camera shutter sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Two-tone shutter sound
      oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      oscillator1.type = 'square';
      
      oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
      oscillator2.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.2);
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio context not available:', error);
      // Fallback - try to play a simple beep
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiB');
        audio.volume = 0.5;
        audio.play();
      } catch (e) {
        console.log('Fallback audio also failed');
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
