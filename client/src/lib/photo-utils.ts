export async function generatePhotoLayout(
  photoDataUrls: string[],
  format: "4r-grid" | "photo-strip",
  backgroundColor: "white" | "black"
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  // Set dimensions based on format to match reference image
  if (format === "4r-grid") {
    // 4R format: Portrait orientation like reference - 4" x 6" at 300 DPI = 1200 x 1800 pixels
    canvas.width = 1200;
    canvas.height = 1800;
  } else {
    // Photo strip: 2" x 6" at 300 DPI = 600 x 1800 pixels
    canvas.width = 600;
    canvas.height = 1800;
  }

  // Set background color
  ctx.fillStyle = backgroundColor === "white" ? "#FFFFFF" : "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load and draw photos
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  try {
    const images = await Promise.all(photoDataUrls.map(loadImage));

    if (format === "4r-grid") {
      // Calculate dimensions for 2x2 grid with proper spacing like reference
      const margin = 40; // Outer margin
      const spacing = 20; // Space between photos
      const logoSpace = 120; // Space reserved for logo at top and bottom
      
      const availableWidth = canvas.width - (2 * margin) - spacing;
      const availableHeight = canvas.height - logoSpace - (2 * margin) - spacing;
      
      const photoWidth = availableWidth / 2;
      const photoHeight = availableHeight / 2;
      
      // Draw photos in 2x2 grid
      images.forEach((img, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = margin + col * (photoWidth + spacing);
        const y = margin + 80 + row * (photoHeight + spacing); // 80px from top for title space
        
        // Draw photo with slight rounded corners (fallback for older browsers)
        ctx.save();
        try {
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, photoWidth, photoHeight, 8);
          } else {
            // Fallback for browsers without roundRect
            ctx.rect(x, y, photoWidth, photoHeight);
          }
          ctx.clip();
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
          ctx.restore();
          
          // Add subtle border
          ctx.strokeStyle = backgroundColor === "white" ? "#E0E0E0" : "#404040";
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, photoWidth, photoHeight, 8);
          } else {
            ctx.rect(x, y, photoWidth, photoHeight);
          }
          ctx.stroke();
        } catch (error) {
          // Simple fallback - just draw the image
          ctx.restore();
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
          
          // Simple border
          ctx.strokeStyle = backgroundColor === "white" ? "#E0E0E0" : "#404040";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, photoWidth, photoHeight);
        }
      });
    } else {
      // Draw photos in vertical strip
      const photoWidth = canvas.width - 80; // 40px margins on each side
      const photoHeight = (canvas.height - 160) / 4; // 80px top/bottom margins, 40px for logo
      
      images.forEach((img, index) => {
        const y = 80 + index * photoHeight;
        ctx.drawImage(img, 40, y, photoWidth, photoHeight);
      });
    }

    // Add title at top (like "FOR YOU STUDIO" in reference)
    ctx.fillStyle = backgroundColor === "white" ? "#333333" : "#FFFFFF";
    ctx.font = "bold 36px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const titleText = "PAWTOBOOTH";
    ctx.fillText(titleText, canvas.width / 2, 40);

    // Add tagline below title
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("four dimensions of life", canvas.width / 2, 70);

    // Add Pawtobooth logo at bottom right corner (like reference)
    ctx.fillStyle = "#FF5722";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    
    const logoX = canvas.width - 40;
    const logoY = canvas.height - 20;
    
    // Add logo background (white rounded rectangle with fallback)
    const logoText = "Pawtobooth";
    const textMetrics = ctx.measureText(logoText);
    const logoWidth = textMetrics.width + 20;
    const logoHeight = 30;
    
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    try {
      if (ctx.roundRect) {
        ctx.roundRect(logoX - logoWidth, logoY - logoHeight, logoWidth, logoHeight, 15);
      } else {
        ctx.rect(logoX - logoWidth, logoY - logoHeight, logoWidth, logoHeight);
      }
      ctx.fill();
    } catch (error) {
      // Simple fallback
      ctx.fillRect(logoX - logoWidth, logoY - logoHeight, logoWidth, logoHeight);
    }
    
    // Add logo text
    ctx.fillStyle = "#FF5722";
    ctx.fillText(logoText, logoX - 10, logoY - 8);

    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Failed to generate photo layout:', error);
    throw error;
  }
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareImage(dataUrl: string, title: string = "Pawtobooth Photos") {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `pawtobooth-${Date.now()}.png`, { type: 'image/png' });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: title,
        text: 'Check out my photos from Pawtobooth!',
      });
      return true;
    } else if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to share image:', error);
    return false;
  }
}
