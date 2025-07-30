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
      // Photo strip layout (2" x 6") - matching reference image exactly
      const margin = 20; // Small margin from edges
      const logoSpace = 100; // Space for logo at bottom
      const photoSpacing = 10; // Small gap between photos
      
      const photoWidth = canvas.width - (2 * margin);
      const availableHeight = canvas.height - margin - logoSpace - (3 * photoSpacing); // Space for 4 photos + 3 gaps
      const photoHeight = availableHeight / 4;
      
      // Draw photos stacked vertically like reference image
      images.forEach((img, index) => {
        const x = margin;
        const y = margin + index * (photoHeight + photoSpacing);
        
        // Draw photo with slight rounded corners
        ctx.save();
        try {
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, photoWidth, photoHeight, 6);
          } else {
            ctx.rect(x, y, photoWidth, photoHeight);
          }
          ctx.clip();
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
          ctx.restore();
          
          // Add subtle border
          ctx.strokeStyle = backgroundColor === "white" ? "#E0E0E0" : "#404040";
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, photoWidth, photoHeight, 6);
          } else {
            ctx.rect(x, y, photoWidth, photoHeight);
          }
          ctx.stroke();
        } catch (error) {
          // Simple fallback
          ctx.restore();
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
          ctx.strokeStyle = backgroundColor === "white" ? "#E0E0E0" : "#404040";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, photoWidth, photoHeight);
        }
      });
      
      // Add Pawtobooth logo at bottom (like reference image)
      ctx.fillStyle = backgroundColor === "white" ? "#333333" : "#FFFFFF"; // White on black background, dark on white
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const logoY = canvas.height - logoSpace / 2;
      ctx.fillText("Pawtobooth", canvas.width / 2, logoY);
    }

    // Add title at top only for 4R grid format
    if (format === "4r-grid") {
      ctx.fillStyle = backgroundColor === "white" ? "#333333" : "#FFFFFF";
      ctx.font = "bold 36px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const titleText = "PAWTOBOOTH";
      ctx.fillText(titleText, canvas.width / 2, 40);

      // Add tagline below title
      ctx.font = "16px Arial, sans-serif";
      ctx.fillText("four dimensions of life", canvas.width / 2, 70);
    }



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
