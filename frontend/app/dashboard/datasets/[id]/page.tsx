'use client';
import {
  AlertCircle,
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
  TrendingUp,
  Type,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function DatasetDetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'charts'>(
    'overview'
  );

  // This will come from your API based on dataset ID
  const dataset = {
    id: 1,
    name: 'sales_q4_2024.csv',
    type: 'csv',
    size: 2.4,
    rows: 5420,
    columns: 12,
    uploadedAt: '2 hours ago',
    uploadDate: '2024-12-02',
  };

  // Column statistics from backend analysis
  const columnStats = [
    {
      name: 'product_id',
      type: 'numeric',
      unique: 245,
      nulls: 0,
      mean: 1523.5,
      min: 1,
      max: 3045,
    },
    { name: 'product_name', type: 'text', unique: 245, nulls: 0 },
    { name: 'category', type: 'text', unique: 8, nulls: 0 },
    {
      name: 'price',
      type: 'numeric',
      unique: 892,
      nulls: 12,
      mean: 45.32,
      min: 5.99,
      max: 299.99,
    },
    {
      name: 'quantity_sold',
      type: 'numeric',
      unique: 156,
      nulls: 0,
      mean: 127.8,
      min: 1,
      max: 500,
    },
    {
      name: 'revenue',
      type: 'numeric',
      unique: 3201,
      nulls: 0,
      mean: 5789.23,
      min: 5.99,
      max: 149995.0,
    },
    { name: 'date', type: 'date', unique: 92, nulls: 0 },
    { name: 'region', type: 'text', unique: 4, nulls: 0 },
  ];

  // Sample data preview (first 10 rows)
  const dataPreview = [
    {
      id: 1,
      product_name: 'Laptop Pro 15"',
      category: 'Electronics',
      price: 1299.99,
      quantity: 45,
      revenue: 58499.55,
      date: '2024-10-01',
      region: 'North',
    },
    {
      id: 2,
      product_name: 'Wireless Mouse',
      category: 'Accessories',
      price: 29.99,
      quantity: 234,
      revenue: 7017.66,
      date: '2024-10-01',
      region: 'South',
    },
    {
      id: 3,
      product_name: 'USB-C Cable',
      category: 'Accessories',
      price: 12.99,
      quantity: 567,
      revenue: 7365.33,
      date: '2024-10-02',
      region: 'East',
    },
    {
      id: 4,
      product_name: 'Office Chair',
      category: 'Furniture',
      price: 299.99,
      quantity: 78,
      revenue: 23399.22,
      date: '2024-10-02',
      region: 'West',
    },
    {
      id: 5,
      product_name: 'Desk Lamp',
      category: 'Furniture',
      price: 45.5,
      quantity: 123,
      revenue: 5596.5,
      date: '2024-10-03',
      region: 'North',
    },
  ];

  // Chart data examples
  const categoryData = [
    { name: 'Electronics', value: 2345, color: '#3b82f6' },
    { name: 'Furniture', value: 1567, color: '#10b981' },
    { name: 'Accessories', value: 891, color: '#f59e0b' },
    { name: 'Office Supplies', value: 617, color: '#8b5cf6' },
  ];

  const revenueOverTime = [
    { date: 'Oct 1', revenue: 45230 },
    { date: 'Oct 8', revenue: 52340 },
    { date: 'Oct 15', revenue: 48920 },
    { date: 'Oct 22', revenue: 61450 },
    { date: 'Oct 29', revenue: 58760 },
    { date: 'Nov 5', revenue: 67230 },
    { date: 'Nov 12', revenue: 72450 },
    { date: 'Nov 19', revenue: 69340 },
    { date: 'Nov 26', revenue: 81250 },
    { date: 'Dec 3', revenue: 85670 },
  ];

  const regionData = [
    { region: 'North', sales: 1523 },
    { region: 'South', sales: 1289 },
    { region: 'East', sales: 1456 },
    { region: 'West', sales: 1152 },
  ];

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
              <span className='px-3 py-1 hidden lg:block bg-green-100 text-green-700 text-sm font-medium rounded-full'>
                Active
              </span>
            </div>
            <p className='text-gray-600 mt-1'>Uploaded {dataset.uploadedAt}</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all'>
            <Download className='w-4 h-4' />
            Download
          </button>
          <button className='flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all'>
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
            {dataset.rows.toLocaleString()}
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <Columns className='w-4 h-4' />
            Columns
          </div>
          <p className='text-2xl font-bold text-gray-900'>{dataset.columns}</p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <FileSpreadsheet className='w-4 h-4' />
            File Size
          </div>
          <p className='text-2xl font-bold text-gray-900'>{dataset.size} MB</p>
        </div>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
            <Calendar className='w-4 h-4' />
            Upload Date
          </div>
          <p className='text-lg font-semibold text-gray-900'>
            {dataset.uploadDate}
          </p>
        </div>
      </div>

      {/* Tabs */}
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
                  {columnStats.map((col) => (
                    <div
                      key={col.name}
                      className='bg-gray-50 border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          {col.type === 'numeric' ? (
                            <Hash className='w-4 h-4 text-blue-600' />
                          ) : col.type === 'date' ? (
                            <Calendar className='w-4 h-4 text-purple-600' />
                          ) : (
                            <Type className='w-4 h-4 text-green-600' />
                          )}
                          <span className='font-medium text-gray-900'>
                            {col.name}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            col.type === 'numeric'
                              ? 'bg-blue-100 text-blue-700'
                              : col.type === 'date'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {col.type}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3'>
                        <div>
                          <p className='text-xs text-gray-600'>Unique Values</p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {col.unique.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-600'>Null Values</p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {col.nulls}
                          </p>
                        </div>
                        {col.mean !== undefined && (
                          <>
                            <div>
                              <p className='text-xs text-gray-600'>Mean</p>
                              <p className='text-sm font-semibold text-gray-900'>
                                {col.mean.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs text-gray-600'>Range</p>
                              <p className='text-sm font-semibold text-gray-900'>
                                {col.min} - {col.max}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 shrink-0' />
                  <div>
                    <h4 className='font-semibold text-blue-900 mb-1'>
                      Data Quality Summary
                    </h4>
                    <p className='text-sm text-blue-800'>
                      Your dataset has <strong>12 null values</strong> in the
                      price column. Consider cleaning this data for more
                      accurate analysis. All other columns are complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600'>
                  Showing first 5 of {dataset.rows.toLocaleString()} rows
                </p>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-gray-50 border-b border-gray-200'>
                      <th className='px-4 py-3 text-left font-semibold text-gray-900'>
                        ID
                      </th>
                      <th className='px-4 py-3 text-left font-semibold text-gray-900'>
                        Product Name
                      </th>
                      <th className='px-4 py-3 text-left font-semibold text-gray-900'>
                        Category
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-900'>
                        Price
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-900'>
                        Quantity
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-900'>
                        Revenue
                      </th>
                      <th className='px-4 py-3 text-left font-semibold text-gray-900'>
                        Date
                      </th>
                      <th className='px-4 py-3 text-left font-semibold text-gray-900'>
                        Region
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row) => (
                      <tr
                        key={row.id}
                        className='border-b border-gray-200 hover:bg-gray-50'
                      >
                        <td className='px-4 py-3 text-gray-900'>{row.id}</td>
                        <td className='px-4 py-3 text-gray-900'>
                          {row.product_name}
                        </td>
                        <td className='px-4 py-3'>
                          <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded'>
                            {row.category}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-right text-gray-900'>
                          ${row.price}
                        </td>
                        <td className='px-4 py-3 text-right text-gray-900'>
                          {row.quantity}
                        </td>
                        <td className='px-4 py-3 text-right font-medium text-gray-900'>
                          ${row.revenue.toLocaleString()}
                        </td>
                        <td className='px-4 py-3 text-gray-600'>{row.date}</td>
                        <td className='px-4 py-3 text-gray-900'>
                          {row.region}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className='w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all'>
                Load More Rows
              </button>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className='space-y-8'>
              {/* Revenue Over Time */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5 text-blue-600' />
                  Revenue Over Time
                </h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={revenueOverTime}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis dataKey='date' stroke='#6b7280' />
                      <YAxis stroke='#6b7280' />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Line
                        type='monotone'
                        dataKey='revenue'
                        stroke='#3b82f6'
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales by Category */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <PieChart className='w-5 h-5 text-green-600' />
                  Sales by Category
                </h3>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <ResponsiveContainer width='100%' height={300}>
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent as number * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => value.toLocaleString()}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='space-y-3'>
                    {categoryData.map((item) => (
                      <div
                        key={item.name}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-4 h-4 rounded'
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className='font-medium text-gray-900'>
                            {item.name}
                          </span>
                        </div>
                        <span className='text-gray-600'>
                          {item.value.toLocaleString()} sales
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales by Region */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <BarChart3 className='w-5 h-5 text-purple-600' />
                  Sales by Region
                </h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis dataKey='region' stroke='#6b7280' />
                      <YAxis stroke='#6b7280' />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => value.toLocaleString()}
                      />
                      <Bar
                        dataKey='sales'
                        fill='#8b5cf6'
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
