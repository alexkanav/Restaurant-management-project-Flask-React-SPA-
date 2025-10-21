import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { baseApiUrl } from '../../config.json';


export default function ImageUploader({ setNewImage }) {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    if (!image) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`${baseApiUrl}admin/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setNewImage(result.url);
    } catch (error) {
      toast.error(`Помилка завантаження: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={uploadImage}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={!image || isUploading}>
        {isUploading ? 'Завантажую...' : 'Завантажити'}
      </button>
    </form>
  );
}