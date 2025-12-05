import { api } from '@/lib/axios';

export const uploadDataset = async (
  formData: FormData,
  onProgress: (percent: number) => void
) => {
  const response = await api.post('/datasets/upload', formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      const total = event.total || event.loaded;
      const percent = Math.round((event.loaded / total) * 100);
      onProgress(percent);
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error('Upload failed');
  }

  return response.data;
};
