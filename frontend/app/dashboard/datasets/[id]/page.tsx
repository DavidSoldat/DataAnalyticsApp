/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { formatFileSize } from '@/lib/helpers';
import {
  Dataset,
  DatasetColumn,
  datasetService,
} from '@/services/datasetService';
import { useDatasetStore } from '@/stores/datasetStore';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Columns,
  Database,
  Download,
  FileSpreadsheet,
  Hash,
  PieChart,
  Trash2,
  Type,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = Number(params.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'charts'>(
    'overview'
  );
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [columns, setColumns] = useState<DatasetColumn[]>([]);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewLimit, setPreviewLimit] = useState(10);

  const { getDatasetById, removeDataset } = useDatasetStore();

  const fetchDatasetDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedDataset = getDatasetById(datasetId);
      if (cachedDataset) {
        setDataset(cachedDataset);
      }

      const { dataset: fullDataset, columns: datasetColumns } =
        await datasetService.getDatasetWithColumns(datasetId);

      setDataset(fullDataset);
      setColumns(datasetColumns);

      const preview = await datasetService.getDataPreview(
        datasetId,
        previewLimit
      );
      setDataPreview(preview);
    } catch (err: any) {
      console.error('Failed to fetch dataset:', err);
      setError(err.response?.data?.message || 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  }, [datasetId, previewLimit, getDatasetById]);

  useEffect(() => {
    fetchDatasetDetails();
  }, [fetchDatasetDetails]);

  const loadMoreRows = async () => {
    try {
      const newLimit = previewLimit + 10;
      const preview = await datasetService.getDataPreview(datasetId, newLimit);
      setDataPreview(preview);
      setPreviewLimit(newLimit);
    } catch (err) {
      console.error('Failed to load more rows:', err);
    }
  };

  const handleDownload = async () => {
    if (!dataset) return;

    try {
      const { downloadUrl, filename } = await datasetService.getDownloadUrl(
        dataset.id
      );
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download dataset');
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (!dataset) return;

    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    try {
      await datasetService.deleteDataset(dataset.id);
      removeDataset(dataset.id);
      router.push('/dashboard/datasets');
    } catch (err) {
      alert('Failed to delete dataset');
      console.log(err);
    }
  };

  const formatUploadDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
        <p className='text-red-800 font-medium mb-4'>
          {error || 'Dataset not found'}
        </p>
        <Link
          href='/dashboard/datasets'
          className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all inline-block'
        >
          Back to Datasets
        </Link>
      </div>
    );
  }

  // Get table headers from first row of preview data
  const tableHeaders =
    dataPreview.length > 0 ? Object.keys(dataPreview[0]) : [];

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-start gap-4'>
          <Link
            href='/dashboard/datasets'
            className='p-2 hover:bg-gray-100 rounded-lg transition-all mt-1'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </Link>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold text-gray-900'>
                {dataset.name}
              </h1>
              <span
                className={`px-3 py-1 hidden lg:block text-sm font-medium rounded-full ${
                  dataset.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : dataset.status === 'PROCESSING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {dataset.status.toLowerCase()}
              </span>
            </div>
            <p className='text-gray-600 mt-1'>
              Uploaded {formatUploadDate(dataset.uploadedAt)}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleDownload}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all'
          >
            <Download className='w-4 h-4' />
            Download
          </button>
          <button
            onClick={handleDelete}
            className='flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all'
          >
            <Trash2 className='w-4 h-4' />
            Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <Database className='w-4 h-4' />
            Total Rows
          </div>
          <p className='text-2xl font-bold text-gray-900'>
            {dataset.totalRows.toLocaleString()}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <Columns className='w-4 h-4' />
            Columns
          </div>
          <p className='text-2xl font-bold text-gray-900'>
            {dataset.totalColumns}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <FileSpreadsheet className='w-4 h-4' />
            File Size
          </div>
          <p className='text-2xl font-bold text-gray-900'>
            {formatFileSize(dataset.fileSize)}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <Calendar className='w-4 h-4' />
            Upload Date
          </div>
          <p className='text-lg font-semibold text-gray-900'>
            {new Date(dataset.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
        {/* Tab buttons - keep existing */}
        <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 sm:px-6 py-4 font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-center gap-2'>
                <BarChart3 className='w-5 h-5' />
                <span className='hidden sm:inline'>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex-1 px-4 sm:px-6 py-4 font-medium transition-all ${
                activeTab === 'data'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-center gap-2'>
                <Database className='w-5 h-5' />
                <span className='hidden sm:inline'>Data Preview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex-1 px-4 sm:px-6 py-4 font-medium transition-all ${
                activeTab === 'charts'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-center gap-2'>
                <PieChart className='w-5 h-5' />
                <span className='hidden sm:inline'>Charts</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className='p-6'>
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Column Statistics
                  </h3>
                  <div className='space-y-3'>
                    {columns.map((col) => (
                      <div
                        key={col.id}
                        className='bg-gray-50 border border-gray-200 rounded-lg p-4'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            {col.dataType === 'NUMERIC' ? (
                              <Hash className='w-4 h-4 text-blue-600' />
                            ) : col.dataType === 'DATE' ? (
                              <Calendar className='w-4 h-4 text-purple-600' />
                            ) : (
                              <Type className='w-4 h-4 text-green-600' />
                            )}
                            <span className='font-medium text-gray-900'>
                              {col.columnName}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              col.dataType === 'NUMERIC'
                                ? 'bg-blue-100 text-blue-700'
                                : col.dataType === 'DATE'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {col.dataType.toLowerCase()}
                          </span>
                        </div>
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3'>
                          <div>
                            <p className='text-xs text-gray-600'>
                              Unique Values
                            </p>
                            <p className='text-sm font-semibold text-gray-900'>
                              {col.uniqueValues.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-600'>Null Values</p>
                            <p className='text-sm font-semibold text-gray-900'>
                              {col.nullCount}
                            </p>
                          </div>
                          {col.mean !== null && (
                            <>
                              <div>
                                <p className='text-xs text-gray-600'>Mean</p>
                                <p className='text-sm font-semibold text-gray-900'>
                                  {col.mean?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-600'>Range</p>
                                <p className='text-sm font-semibold text-gray-900'>
                                  {col.minValue?.toFixed(2)} -{' '}
                                  {col.maxValue?.toFixed(2)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-gray-600'>
                    Showing first {dataPreview.length} of{' '}
                    {dataset.totalRows.toLocaleString()} rows
                  </p>
                </div>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='bg-gray-50 border-b border-gray-200'>
                        {tableHeaders.map((header) => (
                          <th
                            key={header}
                            className='px-4 py-3 text-left font-semibold text-gray-900'
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPreview.map((row, idx) => (
                        <tr
                          key={idx}
                          className='border-b border-gray-200 hover:bg-gray-50'
                        >
                          {tableHeaders.map((header) => (
                            <td
                              key={header}
                              className='px-4 py-3 text-gray-900'
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dataPreview.length < dataset.totalRows && (
                  <button
                    onClick={loadMoreRows}
                    className='w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all'
                  >
                    Load More Rows
                  </button>
                )}
              </div>
            )}

            {activeTab === 'charts' && (
              <div className='space-y-8'>
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
                  <p className='text-yellow-800'>
                    Charts will be generated based on your data. This feature is
                    coming soon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
