'use client';
import { uploadDataset } from '@/services/datasetService';
import { AlertCircle, Check, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadDatasetPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: (fileRejections) => {
      setError(fileRejections[0]?.errors[0]?.message || 'Invalid file');
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadDataset(formData, (percent) => {
        setProgress(percent);
      });

      console.log(response);

      setUploadComplete(true);

      setTimeout(() => {
        router.push('/dashboard/datasets');
      }, 1500);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setError('');
    setUploadComplete(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className='max-w-4xl mx-auto space-y-6 flex flex-col justify-center '>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Upload Dataset</h1>
        <p className='text-gray-600 mt-2'>
          Upload a CSV or Excel file to analyze your data
        </p>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm'>
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-4'>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isDragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <Upload
                  className={`w-8 h-8 ${
                    isDragActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
              </div>

              <div>
                <p className='text-lg font-medium text-gray-900 mb-1'>
                  {isDragActive
                    ? 'Drop your file here'
                    : 'Drag & drop your file here'}
                </p>
                <p className='text-sm text-gray-500'>
                  or click to browse from your computer
                </p>
              </div>

              <span className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all'>
                Browse Files
              </span>

              <div className='text-xs text-gray-500 space-y-1'>
                <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
                <p>Maximum file size: 50MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-blue-100 rounded-lg'>
                  <FileSpreadsheet className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <p className='font-medium text-gray-900'>{file.name}</p>
                  <p className='text-sm text-gray-500'>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {!uploading && !uploadComplete && (
                <button
                  onClick={removeFile}
                  className='p-2 hover:bg-gray-200 rounded-lg transition-all'
                  title='Remove file'
                >
                  <X className='w-5 h-5 text-gray-600' />
                </button>
              )}

              {uploadComplete && (
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Check className='w-5 h-5 text-green-600' />
                </div>
              )}
            </div>

            {uploading && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Uploading...</span>
                  <span className='text-gray-900 font-medium'>{progress}%</span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                  <div
                    className='bg-blue-600 h-full rounded-full transition-all'
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {uploadComplete && (
              <div className='flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg'>
                <Check className='w-5 h-5 text-green-600 shrink-0' />
                <div>
                  <p className='font-medium text-green-900'>
                    Upload successful!
                  </p>
                  <p className='text-sm text-green-700'>
                    Redirecting to your datasets...
                  </p>
                </div>
              </div>
            )}

            {!uploading && !uploadComplete && (
              <div className='flex gap-3'>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    uploading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload & Analyze'}
                </button>

                <button
                  onClick={removeFile}
                  className='px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all'
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className='mt-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <AlertCircle className='w-5 h-5 text-red-600 shrink-0' />
            <p className='text-sm text-red-900'>{error}</p>
          </div>
        )}
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-xl p-6'>
        <h3 className='font-semibold text-blue-900 mb-3 flex items-center gap-2'>
          <AlertCircle className='w-5 h-5' />
          Tips for best results
        </h3>
        <ul className='space-y-2 text-sm text-blue-800'>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5'>•</span>
            <span>
              Ensure your CSV/Excel file has column headers in the first row
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5'>•</span>
            <span>Remove any empty rows or columns before uploading</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5'>•</span>
            <span>Use consistent date formats throughout your dataset</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5'>•</span>
            <span>
              Files are processed securely and automatically deleted after
              analysis
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
