import { api } from '@/lib/axios';

export interface Dataset {
  id: number;
  name: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  totalRows: number;
  totalColumns: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedAt: string;
  updatedAt: string;
}

export interface DatasetColumn {
  id: number;
  columnName: string;
  columnIndex: number;
  dataType: 'NUMERIC' | 'TEXT' | 'DATE' | 'BOOLEAN';
  uniqueValues: number;
  nullCount: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  minValue?: number;
  maxValue?: number;
}

export const datasetService = {
  async getAllDatasets(): Promise<Dataset[]> {
    const response = await api.get('/datasets/user');
    return response.data;
  },

  async getDataset(id: number): Promise<Dataset> {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  async uploadDataset(
    formData: FormData,
    onProgress: (percent: number) => void
  ) {
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
  },

  async getDownloadUrl(
    id: number
  ): Promise<{ downloadUrl: string; filename: string }> {
    const response = await api.get(`/datasets/${id}/download`);
    return response.data;
  },

  async deleteDataset(id: number): Promise<void> {
    await api.delete(`/datasets/${id}`);
  },

  async getDatasetColumns(id: number): Promise<DatasetColumn[]> {
    const response = await api.get(`/datasets/${id}/columns`);
    return response.data;
  },

  async getDatasetWithColumns(id: number) {
    const [datasetRes, columnsRes] = await Promise.all([
      api.get(`/datasets/${id}`),
      api.get(`/datasets/${id}/columns`),
    ]);

    return {
      dataset: datasetRes.data,
      columns: columnsRes.data,
    };
  },

  async getDataPreview(id: number, limit = 10) {
    const response = await api.get(`/datasets/${id}/preview`, {
      params: { limit },
    });

    return response.data;
  },
};
