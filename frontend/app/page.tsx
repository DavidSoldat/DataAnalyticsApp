import {
  Database,
  BarChart3,
  Upload,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white overflow-x-hidden max-w-full'>
      <nav className='bg-white border-b border-gray-200 w-full'>
        <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
                <Database className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold text-gray-900'>
                Datalytics
              </span>
            </div>
            <div className='hidden md:flex items-center gap-3'>
              <Link
                href='/login'
                className='px-4 py-2 text-gray-700 hover:text-gray-900 font-medium'
              >
                Log In
              </Link>
              <Link
                href='/register'
                className='px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm'
              >
                Sign Up Free
              </Link>
            </div>
            <div className='flex md:hidden items-center gap-3'>
              <Link
                href='/register'
                className='px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm'
              >
                Join now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className=' mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
        <div className='text-center max-w-3xl mx-auto'>
          <div
            className='inline-flex items-center gap-2 px-4 py-2 bg-blue-100 
            text-blue-700 rounded-full text-sm font-medium mb-6 cursor-pointer
            transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] 
          hover:bg-blue-200'
          >
            <Zap className='w-4 h-4' />
            Free Analytics Platform
          </div>

          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
            Transform Your Data Into
            <span className='text-blue-600'> Actionable Insights</span>
          </h1>
          <p className='text-xl text-gray-600 mb-8'>
            Upload CSV or Excel files and get instant analytics, beautiful
            visualizations, and detailed statistics. No coding required.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/register'
              className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl text-lg'
            >
              Get Started Free
              <ArrowRight className='w-5 h-5' />
            </Link>
            <Link
              href='#features'
              className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all border-2 border-gray-200 text-lg'
            >
              See How It Works
            </Link>
          </div>
          <p className='text-sm text-gray-500 mt-4'>
            ✨ No credit card required • 500MB free storage • Unlimited uploads
          </p>
        </div>

        <div className='mt-16 relative'>
          <div className='absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent z-10'></div>
          <div className='rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200'>
            <div className='bg-linear-to-br from-blue-50 to-indigo-50 p-8'>
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <div className='flex items-center justify-between flex-col md:flex-row gap-4 mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Dashboard
                  </h3>
                  <div className='px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg'>
                    Upload Dataset
                  </div>
                </div>
                <div className='grid md:grid-cols-4 grid-rows-4 md:grid-rows-1 gap-4 mb-8'>
                  <div className='bg-blue-50 rounded-lg p-4'>
                    <p className='text-sm text-blue-600 mb-1'>Total Datasets</p>
                    <p className='text-3xl font-bold text-blue-900'>12</p>
                  </div>
                  <div className='bg-green-50 rounded-lg p-4'>
                    <p className='text-sm text-green-600 mb-1'>Total Rows</p>
                    <p className='text-3xl font-bold text-green-900'>45,823</p>
                  </div>
                  <div className='bg-purple-50 rounded-lg p-4'>
                    <p className='text-sm text-purple-600 mb-1'>Last Upload</p>
                    <p className='text-lg font-bold text-purple-900'>
                      2 hours ago
                    </p>
                  </div>
                  <div className='bg-orange-50 rounded-lg p-4'>
                    <p className='text-sm text-orange-600 mb-1'>Storage Used</p>
                    <p className='text-2xl font-bold text-orange-900'>
                      24.5 MB
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  {[
                    'sales_q4_2024.csv',
                    'customer_survey.xlsx',
                    'inventory_data.csv',
                  ].map((file, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                          <BarChart3 className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>{file}</p>
                          <p className='text-sm text-gray-500'>
                            5,420 rows • Uploaded 2 hours ago
                          </p>
                        </div>
                      </div>
                      <span className='px-3 py-1 hidden md:block bg-green-100 text-green-700 text-xs font-medium rounded-full'>
                        completed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='features' className='py-20 bg-white'>
        <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Everything You Need for Data Analysis
            </h2>
            <p className='text-xl text-gray-600'>
              Powerful features that make data analysis simple and intuitive
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200'>
              <div className='w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4'>
                <Upload className='w-6 h-6 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Easy Upload
              </h3>
              <p className='text-gray-700 mb-4'>
                Drag & drop CSV or Excel files. Support for files up to 50MB
                with instant processing.
              </p>
              <ul className='space-y-2'>
                {[
                  'CSV & Excel support',
                  'Drag & drop interface',
                  'Automatic validation',
                ].map((item, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'
                  >
                    <Check className='w-4 h-4 text-blue-600' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className='bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200'>
              <div className='w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4'>
                <BarChart3 className='w-6 h-6 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Instant Analytics
              </h3>
              <p className='text-gray-700 mb-4'>
                Get detailed column statistics, data types, and quality insights
                automatically.
              </p>
              <ul className='space-y-2'>
                {[
                  'Column statistics',
                  'Data type detection',
                  'Missing value analysis',
                ].map((item, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'
                  >
                    <Check className='w-4 h-4 text-green-600' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className='bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200'>
              <div className='w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4'>
                <TrendingUp className='w-6 h-6 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Beautiful Charts
              </h3>
              <p className='text-gray-700 mb-4'>
                Create stunning visualizations with line charts, bar charts, and
                pie charts.
              </p>
              <ul className='space-y-2'>
                {[
                  'Multiple chart types',
                  'Interactive visualizations',
                  'Export capabilities',
                ].map((item, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm text-gray-700'
                  >
                    <Check className='w-4 h-4 text-purple-600' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 bg-linear-to-b from-gray-50 to-white'>
        <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              How It Works
            </h2>
            <p className='text-xl text-gray-600'>
              Get insights from your data in three simple steps
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-12'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6'>
                1
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Upload Your Data
              </h3>
              <p className='text-gray-600'>
                Drag and drop your CSV or Excel file. We support files up to
                50MB.
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6'>
                2
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Automatic Analysis
              </h3>
              <p className='text-gray-600'>
                Our system automatically analyzes your data and generates
                statistics.
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6'>
                3
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                View Insights
              </h3>
              <p className='text-gray-600'>
                Explore interactive charts, statistics, and download your
                analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 bg-white'>
        <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Powerful Analytics Interface
            </h2>
            <p className='text-xl text-gray-600'>
              Everything you need to understand your data
            </p>
          </div>

          <div className='space-y-12'>
            <div className='bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200'>
              <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                <div className='p-6 border-b border-gray-200'>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Manage Your Datasets
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Browse, search, and organize all your uploads
                  </p>
                </div>
                <div className='p-6 grid md:grid-cols-3 grid-rows-3 md:grid-rows-1 gap-4'>
                  {[
                    'sales_q4_2024.csv',
                    'customer_survey.xlsx',
                    'inventory_data.csv',
                  ].map((file, i) => (
                    <div
                      key={i}
                      className='border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all'
                    >
                      <div className='flex items-center gap-2 mb-3'>
                        <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                          <BarChart3 className='w-4 h-4 text-green-600' />
                        </div>
                        <p className='font-semibold text-sm text-gray-900'>
                          {file}
                        </p>
                      </div>
                      <div className='space-y-1 text-xs text-gray-600'>
                        <p>Rows: 5,420</p>
                        <p>Columns: 12</p>
                        <p>Size: 2.4 MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200'>
              <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                <div className='p-6 border-b border-gray-200'>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Detailed Column Statistics
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Understand every aspect of your data
                  </p>
                </div>
                <div className='p-6 space-y-4'>
                  {[
                    {
                      name: 'product_id',
                      type: 'numeric',
                      unique: 245,
                      nulls: 0,
                      mean: '1523.50',
                    },
                    {
                      name: 'price',
                      type: 'numeric',
                      unique: 892,
                      nulls: 12,
                      mean: '45.32',
                    },
                    { name: 'category', type: 'text', unique: 8, nulls: 0 },
                  ].map((col, i) => (
                    <div
                      key={i}
                      className='bg-gray-50 border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <span className='font-semibold text-gray-900'>
                          {col.name}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            col.type === 'numeric'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {col.type}
                        </span>
                      </div>
                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-600'>Unique Values</p>
                          <p className='font-semibold text-gray-900'>
                            {col.unique}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600'>Null Values</p>
                          <p className='font-semibold text-gray-900'>
                            {col.nulls}
                          </p>
                        </div>
                        {col.mean && (
                          <div>
                            <p className='text-gray-600'>Mean</p>
                            <p className='font-semibold text-gray-900'>
                              {col.mean}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 bg-linear-to-r from-blue-600 to-indigo-600'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Ready to Analyze Your Data?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Join thousands of users who trust Datalytics for their data analysis
            needs
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/register'
              className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-all shadow-lg text-lg'
            >
              Start Free Today
              <ArrowRight className='w-5 h-5' />
            </Link>
          </div>
          <p className='text-blue-100 mt-6'>
            <Shield className='w-4 h-4 inline mr-2' />
            Free forever • No credit card required • Secure & private
          </p>
        </div>
      </section>

      <footer className='bg-gray-900 text-gray-300 py-12'>
        <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center gap-2 mb-4 md:mb-0'>
              <div className='w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
                <Database className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold text-white'>Datalytics</span>
            </div>
            <div className='text-center md:text-right'>
              <p className='text-sm'>© 2024 Datalytics. All rights reserved.</p>
              <p className='text-sm mt-1'>Made with ❤️ for data enthusiasts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
