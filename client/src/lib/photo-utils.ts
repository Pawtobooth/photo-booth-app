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

  // Set dimensions based on format
  if (format === "4r-grid") {
    // 4R format: 6" x 4" at 300 DPI = 1800 x 1200 pixels
    canvas.width = 1800;
    canvas.height = 1200;
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
      // Draw photos in 2x2 grid
      const photoWidth = (canvas.width - 60) / 2; // 30px margin, 30px between
      const photoHeight = (canvas.height - 120) / 2; // 30px top/bottom margin, 30px between, 60px for logo
      
      images.forEach((img, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = 30 + col * (photoWidth + 30);
        const y = 30 + row * (photoHeight + 30);
        
        ctx.drawImage(img, x, y, photoWidth, photoHeight);
      });
    } else {
      // Draw photos in vertical strip
      const photoWidth = canvas.width - 60; // 30px margins
      const photoHeight = (canvas.height - 120) / 4; // 30px margins, 60px for logo
      
      images.forEach((img, index) => {
        const y = 30 + index * photoHeight;
        ctx.drawImage(img, 30, y, photoWidth, photoHeight);
      });
    }

    // Add Pawtobooth logo
    ctx.fillStyle = "#FF5722";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    
    const logoText = "Pawtobooth";
    const logoX = 30;
    const logoY = canvas.height - 10;
    
    ctx.fillText(logoText, logoX, logoY);

    // Add tagline
    ctx.fillStyle = backgroundColor === "white" ? "#666666" : "#CCCCCC";
    ctx.font = "14px Inter, sans-serif";
    const taglineText = "four dimensions of life";
    const textMetrics = ctx.measureText(logoText);
    ctx.fillText(taglineText, logoX + textMetrics.width + 10, logoY);

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
