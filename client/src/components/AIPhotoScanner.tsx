import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Sparkles, X, Search, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface ScanResult {
  category: string | null;
  searchQuery: string;
  description: string;
  confidence: "high" | "medium" | "low";
}

interface AIPhotoScannerProps {
  open: boolean;
  onClose: () => void;
}

export function AIPhotoScanner({ open, onClose }: AIPhotoScannerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const handleFile = (file: File) => {
    setResult(null);
    setError(null);
    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const scanImage = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = preview.split(",")[1];
      const res = await fetch("/api/ai/scan-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Scan failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Could not analyse image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!result) return;
    const params = new URLSearchParams();
    if (result.category) params.set("category", result.category.toLowerCase().replace(/\s+/g, ""));
    if (result.searchQuery) params.set("search", result.searchQuery);
    onClose();
    handleReset();
    setLocation(`/catalog?${params.toString()}`);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const confidenceColor: Record<string, string> = {
    high: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); handleReset(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Product Finder
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload a photo of any tile, fixture, or fitting — Gemini AI will find matching products for you.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Upload area */}
          {!preview ? (
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              data-testid="ai-scanner-dropzone"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Drop a photo here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse from your device</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">JPG</Badge>
                  <Badge variant="outline" className="text-xs">PNG</Badge>
                  <Badge variant="outline" className="text-xs">WebP</Badge>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                data-testid="ai-scanner-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={preview} alt="Uploaded" className="w-full max-h-56 object-cover" />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                data-testid="ai-scanner-remove-image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">AI Analysis</p>
                {result.confidence && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${confidenceColor[result.confidence] || ""}`}>
                    {result.confidence} confidence
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">{result.description}</p>
              {result.category && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{result.category}</Badge>
                </div>
              )}
              {result.searchQuery && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Search:</span>
                  <span className="font-medium text-primary">"{result.searchQuery}"</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!preview ? (
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => fileRef.current?.click()}
                data-testid="ai-scanner-upload-btn"
              >
                <Upload className="h-4 w-4" /> Choose Photo
              </Button>
            ) : !result ? (
              <Button
                className="flex-1 gap-2"
                onClick={scanImage}
                disabled={loading}
                data-testid="ai-scanner-scan-btn"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Scan with AI</>
                )}
              </Button>
            ) : (
              <>
                <Button variant="outline" className="gap-2" onClick={handleReset} data-testid="ai-scanner-retry-btn">
                  <Camera className="h-4 w-4" /> Try Another
                </Button>
                <Button className="flex-1 gap-2" onClick={handleSearch} data-testid="ai-scanner-search-btn">
                  <Search className="h-4 w-4" /> Find Products
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
