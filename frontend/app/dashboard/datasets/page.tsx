/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ConfirmModal from '@/components/modals/ConfirmModal';
import { formatUploadDate, safeDate, safeTime } from '@/lib/helpers';
import { Dataset, datasetService } from '@/services/datasetService';
import { useDatasetStore } from '@/stores/datasetStore';
import {
  ArrowUpDown,
  Calendar,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  MoreVertical,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyDatasetsPage() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<number | null>(null);

  const { datasets, loading, error, fetchDatasets, removeDataset } =
    useDatasetStore();

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  };

  const sortedDatasets = Array.isArray(datasets)
    ? [...datasets].sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return safeTime(b.uploadedAt) - safeTime(a.uploadedAt);
          case 'oldest':
            return safeTime(a.uploadedAt) - safeTime(b.uploadedAt);
          default:
            return 0;
        }
      })
    : [];
  const filteredDatasets = sortedDatasets.filter((dataset) => {
    if (!dataset || !dataset.name) return false;

    const matchesSearch = dataset.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterBy === 'all' ||
      (dataset.fileType && dataset.fileType.toLowerCase() === filterBy);

    return matchesSearch && matchesFilter;
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id); // open modal
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await datasetService.deleteDataset(deleteId);
      removeDataset(deleteId);
    } catch (err: any) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset. Please try again.');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => setDeleteId(null);

  const handleDownload = async (id: number) => {
    try {
      const { downloadUrl, filename } = await datasetService.getDownloadUrl(id);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowOptionsMenu(null);
    } catch (err: any) {
      console.error('Failed to download dataset:', err);
      alert('Failed to download dataset. Please try again.');
    }
  };

  const totalRows =
    datasets?.reduce((sum, d) => sum + (d?.totalRows || 0), 0) || 0;

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
        <p className='text-red-800 font-medium mb-4'>{error}</p>
        <button
          onClick={() => fetchDatasets(true)}
          className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all'
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>My Datasets</h1>
          <p className='text-gray-600 mt-1'>
            Manage and analyze your uploaded datasets
          </p>
        </div>
        <Link
          href='/dashboard/datasets/upload'
          className='inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md'
        >
          <Upload className='w-4 h-4' />
          Upload New
        </Link>
      </div>

      {/* Stats Bar */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Database className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <p className='text-sm text-gray-600'>Total Datasets</p>
              <p className='text-2xl font-bold text-gray-900'>
                {datasets.length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <FileSpreadsheet className='w-5 h-5 text-green-600' />
            </div>
            <div>
              <p className='text-sm text-gray-600'>Total Rows</p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalRows.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Calendar className='w-5 h-5 text-purple-600' />
            </div>
            <div>
              <p className='text-sm text-gray-600'>Last Upload</p>
              <p className='text-lg font-semibold text-gray-900'>
                {datasets.length > 0
                  ? safeDate(datasets[0].uploadedAt)
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl p-4 shadow-sm'>
        <div className='flex flex-col lg:flex-row gap-3'>
          {/* Search */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search datasets...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-all'
              >
                <X className='w-4 h-4 text-gray-400' />
              </button>
            )}
          </div>

          {/* Filter by Type */}
          <div className='flex gap-2'>
            <button
              onClick={() => setFilterBy('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterBy === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterBy('csv')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterBy === 'csv'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => setFilterBy('excel')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterBy === 'excel'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Excel
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className='relative'>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all'
            >
              <ArrowUpDown className='w-4 h-4' />
              <span className='hidden sm:inline'>Sort:</span>
              <span className='capitalize'>
                {sortBy === 'recent'
                  ? 'Newest'
                  : sortBy === 'oldest'
                  ? 'Oldest'
                  : sortBy}
              </span>
            </button>

            {showSortMenu && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setShowSortMenu(false)}
                />
                <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1'>
                  <button
                    onClick={() => {
                      setSortBy('recent');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${
                      sortBy === 'recent'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('oldest');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${
                      sortBy === 'oldest'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Oldest First
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${
                      sortBy === 'name'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('size');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${
                      sortBy === 'size'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Largest Size
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('rows');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${
                      sortBy === 'rows'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Most Rows
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterBy !== 'all' || sortBy !== 'recent') && (
          <div className='flex items-center gap-2 mt-3 pt-3 border-t border-gray-200'>
            <span className='text-sm text-gray-600'>Active filters:</span>
            <div className='flex flex-wrap gap-2'>
              {searchQuery && (
                <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded'>
                  Search: &apos;{searchQuery}&apos;
                  <button
                    onClick={() => setSearchQuery('')}
                    className='hover:bg-blue-200 rounded'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}
              {filterBy !== 'all' && (
                <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded'>
                  Type: {filterBy.toUpperCase()}
                  <button
                    onClick={() => setFilterBy('all')}
                    className='hover:bg-blue-200 rounded'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}
              {sortBy !== 'recent' && (
                <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded'>
                  Sort: {sortBy === 'oldest' ? 'Oldest' : sortBy}
                  <button
                    onClick={() => setSortBy('recent')}
                    className='hover:bg-blue-200 rounded'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterBy('all');
                  setSortBy('recent');
                }}
                className='text-xs text-red-600 hover:text-red-700 font-medium'
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Datasets Grid */}
      {filteredDatasets.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className='bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all group cursor-pointer'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-start gap-3 flex-1 min-w-0'>
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      dataset.fileType === 'CSV'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <FileSpreadsheet
                      className={`w-5 h-5 ${
                        dataset.fileType === 'CSV'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors'>
                      {dataset.name}
                    </h3>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      {formatUploadDate(dataset.uploadedAt)}
                    </p>
                  </div>
                </div>

                {/* Options Menu */}
                <div className='relative'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptionsMenu(
                        showOptionsMenu === dataset.id ? null : dataset.id
                      );
                    }}
                    className='p-1.5 hover:bg-gray-100 rounded-lg transition-all'
                  >
                    <MoreVertical className='w-5 h-5 text-gray-600' />
                  </button>

                  {showOptionsMenu === dataset.id && (
                    <>
                      <div
                        className='fixed inset-0 z-10'
                        onClick={() => setShowOptionsMenu(null)}
                      />
                      <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1'>
                        <Link
                          href={`/dashboard/datasets/${dataset.id}`}
                          className='w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all'
                        >
                          <Eye className='w-4 h-4' />
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDownload(dataset.id)}
                          className='w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all'
                        >
                          <Download className='w-4 h-4' />
                          Download
                        </button>
                        <div className='border-t border-gray-200 my-1' />
                        <button
                          // onClick={() => handleDelete(dataset.id)}
                          onClick={() => handleDeleteClick(dataset.id)}
                          className='w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all'
                        >
                          <Trash2 className='w-4 h-4' />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dataset Stats */}
              <div className='space-y-2 mb-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Rows</span>
                  <span className='font-medium text-gray-900'>
                    {dataset.totalRows
                      ? dataset.totalRows.toLocaleString()
                      : '—'}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Columns</span>
                  <span className='font-medium text-gray-900'>
                    {dataset.totalColumns}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Size</span>
                  <span className='font-medium text-gray-900'>
                    {formatFileSize(dataset.fileSize)}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Status</span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
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
              </div>

              {/* View Button */}
              <Link
                href={`/dashboard/datasets/${dataset.id}`}
                className='block w-full text-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-all'
              >
                View Analysis
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className='bg-white border border-gray-200 rounded-xl p-12 text-center'>
          <div className='max-w-sm mx-auto'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No datasets found
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Upload your first dataset to get started'}
            </p>
            {!searchQuery && (
              <Link
                href='/dashboard/datasets/upload'
                className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all'
              >
                <Upload className='w-4 h-4' />
                Upload Dataset
              </Link>
            )}
          </div>
        </div>
      )}
      {deleteId !== null && (
        <ConfirmModal
          message='Are you sure you want to delete this dataset?'
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
