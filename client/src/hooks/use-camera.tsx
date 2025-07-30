import { useRef, useEffect, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true);
          };
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
        setError('Camera not available in preview mode');
        // For preview mode, create a demo video element
        createDemoPreview();
      }
    };

    const createDemoPreview = () => {
      if (videoRef.current) {
        // Create a canvas with a demo pattern
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create a gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#FF5722');
          gradient.addColorStop(1, '#FF8A50');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add demo text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('DEMO MODE', canvas.width / 2, canvas.height / 2 - 50);
          ctx.font = '24px Arial';
          ctx.fillText('Camera preview will work in deployed version', canvas.width / 2, canvas.height / 2 + 20);
          ctx.fillText('Click the camera button to test the flow', canvas.width / 2, canvas.height / 2 + 60);
          
          // Convert canvas to video stream (for demo)
          canvas.toBlob((blob) => {
            if (blob && videoRef.current) {
              const url = URL.createObjectURL(blob);
              videoRef.current.poster = url;
              videoRef.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
              videoRef.current.style.backgroundSize = 'cover';
              setIsReady(true);
            }
          });
        }
      }
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = async (): Promise<string | null> => {
    if (!canvasRef.current || !isReady) {
      return null;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas dimensions
    canvas.width = 1280;
    canvas.height = 720;

    if (videoRef.current && videoRef.current.videoWidth > 0) {
      // Real camera mode
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      // Demo mode - create a sample photo
      const colors = ['#FF5722', '#4CAF50', '#2196F3', '#E91E63', '#FF9800'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const gradient = context.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, '#333');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add demo elements
      context.fillStyle = 'white';
      context.font = 'bold 64px Arial';
      context.textAlign = 'center';
      context.fillText('📸', canvas.width / 2, canvas.height / 2 - 50);
      context.font = '32px Arial';
      context.fillText(`Demo Photo ${Date.now() % 1000}`, canvas.width / 2, canvas.height / 2 + 50);
      
      // Add timestamp
      context.font = '24px Arial';
      context.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height - 50);
    }

    // Convert to data URL
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  return {
    videoRef,
    canvasRef,
    isReady,
    error,
    capturePhoto
  };
}
