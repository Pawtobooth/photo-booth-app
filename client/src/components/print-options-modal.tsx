import React, { useState } from "react";
import { Printer, Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { generatePhotoLayout } from "@/lib/photo-utils";

interface PrintOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionState: {
    selectedFormat: "4r-grid" | "photo-strip";
    selectedBackground: "white" | "black";
    copyCount: number;
    capturedPhotos: Array<{ id: string; dataUrl: string; timestamp: Date }>;
  };
}

export default function PrintOptionsModal({
  isOpen,
  onClose,
  sessionState
}: PrintOptionsModalProps) {
  const [layoutPreview, setLayoutPreview] = useState<string | null>(null);

  const generatePreview = async () => {
    try {
      console.log('Generating preview with photos:', sessionState.capturedPhotos.length);
      const preview = await generatePhotoLayout(
        sessionState.capturedPhotos.map(p => p.dataUrl),
        sessionState.selectedFormat,
        sessionState.selectedBackground
      );
      console.log('Preview generated successfully:', preview ? 'Yes' : 'No');
      setLayoutPreview(preview);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      alert('Failed to generate print preview. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!layoutPreview) return;
    
    const link = document.createElement('a');
    link.href = layoutPreview;
    link.download = `pawtobooth-${sessionState.selectedFormat}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDirectPrint = () => {
    if (!layoutPreview) {
      alert('Print preview is still generating. Please wait a moment and try again.');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pawtobooth Print</title>
            <style>
              @page {
                margin: 0;
                size: auto;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  background: white !important;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                img { 
                  width: 100%; 
                  height: auto; 
                  page-break-inside: avoid;
                  display: block;
                }
                @page { margin: 0; }
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
              img {
                max-width: 100%;
                height: auto;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${layoutPreview}" alt="Pawtobooth Photos" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert('Pop-up blocked. Please allow pop-ups for printing or use the download option.');
    }
  };

  const handleShare = async () => {
    if (!layoutPreview) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(layoutPreview);
      const blob = await response.blob();
      const file = new File([blob], `pawtobooth-${Date.now()}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Pawtobooth Photos',
          text: 'Check out my photos from Pawtobooth!',
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('Image copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      handleDownload(); // Fallback to download
    }
  };

  // Generate preview when modal opens
  React.useEffect(() => {
    if (isOpen && sessionState.capturedPhotos.length === 4) {
      generatePreview();
    }
  }, [isOpen, sessionState]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--paw-orange)] flex items-center gap-2">
            <Printer className="h-6 w-6" />
            Choose how you'd like to print your {sessionState.selectedFormat === "4r-grid" ? "4R" : "photo strip"} ({sessionState.copyCount} copy)
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <Card className="p-4 bg-gray-50">
              {layoutPreview ? (
                <img 
                  src={layoutPreview} 
                  alt="Print preview"
                  className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500">Generating preview...</div>
                </div>
              )}
            </Card>
          </div>

          {/* Print Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Print Options</h3>
            
            {/* Direct Print */}
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleDirectPrint}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--paw-orange)] rounded-lg flex items-center justify-center">
                  <Printer className="text-white h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Direct Print</h4>
                  <p className="text-sm text-gray-600">Print directly from your browser to any connected printer</p>
                </div>
              </div>
            </Card>

            {/* Download & Print */}
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleDownload}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Download className="text-white h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Download & Print</h4>
                  <p className="text-sm text-gray-600">Save to device, then print from photo app or printer software</p>
                </div>
              </div>
            </Card>

            {/* Share to Print */}
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleShare}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Share2 className="text-white h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Share to Print</h4>
                  <p className="text-sm text-gray-600">Share to phone, email, or cloud storage for printing</p>
                </div>
              </div>
            </Card>

            {/* Print Service Options */}
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-blue-800 mb-2">Print Service Options</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Local print shops (CVS, Walgreens, Costco)</li>
                <li>• Online services (Shutterfly, Snapfish)</li>
                <li>• Mobile printing (HP Smart, Canon PRINT)</li>
                <li>• Instant printers (Fujifilm Instax, Polaroid)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[var(--paw-orange)] hover:bg-[var(--paw-orange-dark)]"
          >
            Start New Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
