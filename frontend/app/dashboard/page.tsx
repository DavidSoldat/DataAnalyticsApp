'use client';
import { useState } from 'react';
import {
  BarChart3,
  Upload,
  FileText,
  Clock,
  TrendingUp,
  Database,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats] = useState({
    totalDatasets: 12,
    totalRows: 45823,
    lastUpload: '2 hours ago',
    storageUsed: '24.5 MB',
  });

  const recentDatasets = [
    {
      id: 1,
      name: 'sales_q4_2024.csv',
      rows: 5420,
      uploadedAt: '2 hours ago',
      status: 'completed',
    },
    {
      id: 2,
      name: 'customer_survey.xlsx',
      rows: 892,
      uploadedAt: '1 day ago',
      status: 'completed',
    },
    {
      id: 3,
      name: 'inventory_data.csv',
      rows: 15603,
      uploadedAt: '3 days ago',
      status: 'completed',
    },
  ];

  return (
    <div className='space-y-6 h-full'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600 mt-1'>
            Welcome back! Here&apos;s what&apos;s happening with your data.
          </p>
        </div>
        <Link
          href='/dashboard/datasets/upload'
          className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md'
        >
          <Upload className='w-4 h-4' />
          Upload Dataset
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-blue-700'>
                Total Datasets
              </p>
              <p className='text-3xl font-bold text-blue-900 mt-2'>
                {stats.totalDatasets}
              </p>
            </div>
            <div className='p-3 bg-blue-600 rounded-lg'>
              <Database className='w-6 h-6 text-white' />
            </div>
          </div>
          <p className='text-xs text-blue-600 mt-3 flex items-center gap-1'>
            <TrendingUp className='w-3 h-3' />
            +3 this week
          </p>
        </div>

        <div className='bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 hover:shadow-lg transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-green-700'>Total Rows</p>
              <p className='text-3xl font-bold text-green-900 mt-2'>
                {stats.totalRows.toLocaleString()}
              </p>
            </div>
            <div className='p-3 bg-green-600 rounded-lg'>
              <BarChart3 className='w-6 h-6 text-white' />
            </div>
          </div>
          <p className='text-xs text-green-600 mt-3'>Across all datasets</p>
        </div>

        <div className='bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-purple-700'>Last Upload</p>
              <p className='text-2xl font-bold text-purple-900 mt-2'>
                {stats.lastUpload}
              </p>
            </div>
            <div className='p-3 bg-purple-600 rounded-lg'>
              <Clock className='w-6 h-6 text-white' />
            </div>
          </div>
          <p className='text-xs text-purple-600 mt-3'>sales_q4_2024.csv</p>
        </div>

        <div className='bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 hover:shadow-lg transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-orange-700'>
                Storage Used
              </p>
              <p className='text-3xl font-bold text-orange-900 mt-2'>
                {stats.storageUsed}
              </p>
            </div>
            <div className='p-3 bg-orange-600 rounded-lg'>
              <FileText className='w-6 h-6 text-white' />
            </div>
          </div>
          <p className='text-xs text-orange-600 mt-3'>of 500 MB free tier</p>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <Link
            href='/dashboard/datasets/upload'
            className='flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group'
          >
            <div className='p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-all'>
              <Upload className='w-5 h-5 text-gray-600 group-hover:text-blue-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>Upload New</p>
              <p className='text-xs text-gray-500'>CSV or Excel file</p>
            </div>
          </Link>

          <Link
            href='/dashboard/datasets'
            className='flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group'
          >
            <div className='p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-all'>
              <Database className='w-5 h-5 text-gray-600 group-hover:text-green-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>Browse Datasets</p>
              <p className='text-xs text-gray-500'>View all uploads</p>
            </div>
          </Link>

          <Link
            href='/dashboard/settings'
            className='flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group'
          >
            <div className='p-2 bg-gray-100 rounded-lg group-hover:bg-purple-100 transition-all'>
              <BarChart3 className='w-5 h-5 text-gray-600 group-hover:text-purple-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>View Analytics</p>
              <p className='text-xs text-gray-500'>Insights & trends</p>
            </div>
          </Link>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Recent Datasets
          </h2>
          <Link
            href='/dashboard/datasets'
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
          >
            View all →
          </Link>
        </div>
        <div className='divide-y divide-gray-200'>
          {recentDatasets.map((dataset) => (
            <a
              key={dataset.id}
              href={`/dashboard/datasets/${dataset.id}`}
              className='flex items-center justify-between p-5 hover:bg-gray-50 transition-all group'
            >
              <div className='flex items-center gap-4'>
                <div className='p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-all'>
                  <FileText className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <p className='font-medium text-gray-900 group-hover:text-blue-600 transition-all'>
                    {dataset.name}
                  </p>
                  <p className='text-sm text-gray-500 mt-0.5'>
                    {dataset.rows.toLocaleString()} rows • Uploaded{' '}
                    {dataset.uploadedAt}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <span className='px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full'>
                  {dataset.status}
                </span>
                <svg
                  className='w-5 h-5 text-gray-400 group-hover:text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      {stats.totalDatasets === 0 && (
        <div className='bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center'>
          <div className='max-w-sm mx-auto'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Upload className='w-8 h-8 text-blue-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No datasets yet
            </h3>
            <p className='text-gray-600 mb-6'>
              Get started by uploading your first CSV or Excel file to begin
              analyzing your data.
            </p>
            <Link
              href='/dashboard/datasets/upload'
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all'
            >
              <Upload className='w-4 h-4' />
              Upload Your First Dataset
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
