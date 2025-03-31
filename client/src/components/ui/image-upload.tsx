import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Loader2, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imagePath: string) => void;
  initialImage?: string;
  className?: string;
}

export function ImageUpload({ onImageUpload, initialImage, className = '' }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setIsUploading(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setIsUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setIsUploading(false);
      return;
    }

    try {
      // Convert to base64
      const base64Data = await fileToBase64(file);
      
      // Upload the image
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data,
          filename: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const imagePath = data.filePath;
      
      // Update state and call the callback
      setImage(imagePath);
      onImageUpload(imagePath);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <div className="space-y-4">
        {image ? (
          <div className="relative">
            <img 
              src={image} 
              alt="Uploaded preview" 
              className="max-h-[300px] w-full object-contain rounded-md border"
            />
            <Button 
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleImageRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-md h-[200px] cursor-pointer bg-muted/20"
            onClick={handleButtonClick}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-center font-medium">Click to upload an image</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {!image && !isUploading && (
          <div className="flex justify-center">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Select Image'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}