import React, { useState, useCallback } from 'react';
import Icon from './AppIcon';
import api from '../lib/api';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  folder = 'mtr_uploads',
  maxImages = 10,
  label = 'Images'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadToCloudinary = async (file) => {
    try {
      // Get signature from backend
      const sigResponse = await api.get(`/api/cloudinary/signature?folder=${folder}&resource_type=image`);
      const sig = sigResponse.data;

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', sig.timestamp);
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      );

      const result = await uploadResponse.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.secure_url;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check max images limit
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const newImages = [...images];
    const totalFiles = files.length;
    let completed = 0;

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const url = await uploadToCloudinary(file);
        newImages.push(url);
        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      } catch (err) {
        setError(err.message || 'Upload failed');
      }
    }

    setUploading(false);
    setUploadProgress(0);
    onImagesChange(newImages);
    
    // Reset input
    e.target.value = '';
  }, [images, maxImages, folder, onImagesChange]);

  const removeImage = useCallback((index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const setAsFeatured = useCallback((index) => {
    // Move the selected image to the first position
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#B8C4A8]">{label}</label>
      
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div 
            key={index} 
            className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
              index === 0 ? 'border-[#5A9A3A]' : 'border-[#3A5A3A]'
            }`}
          >
            <img 
              src={url} 
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#5A9A3A] text-white text-xs rounded">
                Featured
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => setAsFeatured(index)}
                  className="p-2 bg-[#5A9A3A] text-white rounded-lg hover:bg-[#4A8A2A] transition-colors"
                  title="Set as featured"
                >
                  <Icon name="Star" size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-[#3A5A3A] hover:border-[#5A9A3A] cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors bg-[#2A4A2A]/50">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <>
                <Icon name="Loader2" size={24} className="text-[#5A9A3A] animate-spin" />
                <span className="text-xs text-[#B8C4A8]">{uploadProgress}%</span>
              </>
            ) : (
              <>
                <Icon name="Plus" size={24} className="text-[#5A9A3A]" />
                <span className="text-xs text-[#B8C4A8]">Add Images</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <Icon name="AlertCircle" size={14} />
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-xs text-[#B8C4A8]/70">
        {images.length}/{maxImages} images • First image is featured • Max 5MB per image
      </p>
    </div>
  );
};

export default ImageUpload;
