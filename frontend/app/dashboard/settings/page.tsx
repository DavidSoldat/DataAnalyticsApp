'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Database,
  Bell,
  Shield,
  Trash2,
  Save,
  Mail,
  Camera,
  Key,
} from 'lucide-react';
import Image from 'next/image';
import {
  DatasetPrefs,
  NotificationPrefs,
  UserProfileResponse,
  userService,
} from '@/services/authService';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [datasetPrefs, setDatasetPrefs] = useState<DatasetPrefs>({
    autoDelete: false,
    autoDeleteDays: 30,
    maxFileSize: 50,
    defaultChartType: 'line',
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    {
      uploadComplete: true,
      uploadFailed: true,
      weeklyReport: false,
      storageWarning: true,
    }
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUserData(profile);
        setDatasetPrefs(
          profile.datasetPrefs || {
            autoDelete: false,
            autoDeleteDays: 30,
            maxFileSize: 50,
            defaultChartType: 'line',
          }
        );
        setNotificationPrefs(
          profile.notificationPrefs || {
            uploadComplete: true,
            uploadFailed: true,
            weeklyReport: false,
            storageWarning: true,
          }
        );
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!userData) return;
    setSaving(true);
    try {
      await userService.updateProfile({
        name: userData.name,
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDatasetPrefs = async () => {
    setSaving(true);
    try {
      await userService.updatePreferences({
        datasetPrefs,
        notificationPrefs,
      });
      alert('Preferences updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return;
    const confirmation = prompt('Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') return;

    try {
      await userService.deleteAccount();
      alert('Account deleted. Redirecting...');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
        <p className='text-gray-600 mt-1'>
          Manage your account settings and preferences
        </p>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
        <div className='border-b border-gray-200 overflow-x-auto'>
          <div className='flex min-w-max'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className='w-5 h-5' />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className='p-6'>
          {activeTab === 'profile' && (
            <div className='space-y-6 max-w-2xl'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Profile Information
                </h2>

                <div className='flex items-center gap-6 mb-6'>
                  <div className='relative'>
                    {userData?.imageUrl ? (
                      <Image
                        src={userData.imageUrl}
                        alt='Profile'
                        className='w-24 h-24 rounded-full object-cover'
                      />
                    ) : (
                      <div className='w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center'>
                        <User className='w-12 h-12 text-blue-600' />
                      </div>
                    )}
                    <button className='absolute bottom-0 right-0 p-2 bg-white border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-all'>
                      <Camera className='w-4 h-4 text-gray-600' />
                    </button>
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      {userData?.name}
                    </h3>
                    <p className='text-sm text-gray-600'>{userData?.email}</p>
                    {userData?.provider !== 'EMAIL' && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Signed in with {userData?.provider}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      value={userData?.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <input
                        type='email'
                        value={userData?.email}
                        disabled={userData?.provider !== 'EMAIL'}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                      />
                    </div>
                    {userData?.provider !== 'EMAIL' && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Email cannot be changed for {userData?.provider}{' '}
                        accounts
                      </p>
                    )}
                  </div>

                  <div className='pt-4'>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className='flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all'
                    >
                      <Save className='w-4 h-4' />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className='space-y-6 max-w-2xl'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Dataset Preferences
                </h2>

                <div className='space-y-6'>
                  <div className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='font-medium text-gray-900 mb-1'>
                          Auto-delete datasets
                        </h3>
                        <p className='text-sm text-gray-600'>
                          Automatically delete datasets after a specified number
                          of days
                        </p>
                      </div>
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={datasetPrefs?.autoDelete}
                          onChange={(e) =>
                            setDatasetPrefs({
                              ...datasetPrefs,
                              autoDelete: e.target.checked,
                            })
                          }
                          className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {datasetPrefs.autoDelete && (
                      <div className='mt-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Delete after (days)
                        </label>
                        <input
                          type='number'
                          min='1'
                          max='365'
                          value={datasetPrefs.autoDeleteDays}
                          onChange={(e) =>
                            setDatasetPrefs({
                              ...datasetPrefs,
                              autoDeleteDays: parseInt(e.target.value),
                            })
                          }
                          className='w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    )}
                  </div>

                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h3 className='font-medium text-gray-900 mb-3'>
                      Maximum file size
                    </h3>
                    <div className='flex items-center gap-4'>
                      <input
                        type='number'
                        min='1'
                        max='100'
                        value={datasetPrefs.maxFileSize}
                        onChange={(e) =>
                          setDatasetPrefs({
                            ...datasetPrefs,
                            maxFileSize: parseInt(e.target.value),
                          })
                        }
                        className='w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <span className='text-gray-700'>MB per file</span>
                    </div>
                    <p className='text-sm text-gray-600 mt-2'>
                      Maximum allowed: 100 MB
                    </p>
                  </div>

                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h3 className='font-medium text-gray-900 mb-3'>
                      Default chart type
                    </h3>
                    <select
                      value={datasetPrefs.defaultChartType}
                      onChange={(e) =>
                        setDatasetPrefs({
                          ...datasetPrefs,
                          defaultChartType: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='line'>Line Chart</option>
                      <option value='bar'>Bar Chart</option>
                      <option value='pie'>Pie Chart</option>
                      <option value='scatter'>Scatter Plot</option>
                    </select>
                  </div>

                  <div className='pt-4'>
                    <button
                      onClick={handleSaveDatasetPrefs}
                      disabled={saving}
                      className='flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all'
                    >
                      <Save className='w-4 h-4' />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className='space-y-6 max-w-2xl'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Notification Preferences
                </h2>

                <div className='space-y-4'>
                  {[
                    {
                      key: 'uploadComplete',
                      label: 'Upload completed',
                      desc: 'Get notified when your dataset upload is complete',
                    },
                    {
                      key: 'uploadFailed',
                      label: 'Upload failed',
                      desc: 'Get notified if your dataset upload fails',
                    },
                    {
                      key: 'weeklyReport',
                      label: 'Weekly report',
                      desc: 'Receive a weekly summary of your dataset activity',
                    },
                    {
                      key: 'storageWarning',
                      label: 'Storage warning',
                      desc: "Get notified when you're running low on storage",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className='border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900 mb-1'>
                            {item.label}
                          </h3>
                          <p className='text-sm text-gray-600'>{item.desc}</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer ml-4'>
                          <input
                            type='checkbox'
                            checked={
                              notificationPrefs[
                                item.key as keyof typeof notificationPrefs
                              ]
                            }
                            onChange={(e) =>
                              setNotificationPrefs({
                                ...notificationPrefs,
                                [item.key]: e.target.checked,
                              })
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className='space-y-6 max-w-2xl'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Security Settings
                </h2>

                <div className='space-y-6'>
                  {userData?.provider === 'EMAIL' && (
                    <div className='border border-gray-200 rounded-lg p-4'>
                      <h3 className='font-medium text-gray-900 mb-4 flex items-center gap-2'>
                        <Key className='w-5 h-5' />
                        Change Password
                      </h3>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Current Password
                          </label>
                          <input
                            type='password'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            New Password
                          </label>
                          <input
                            type='password'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Confirm New Password
                          </label>
                          <input
                            type='password'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <button className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all'>
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}

                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h3 className='font-medium text-gray-900 mb-4'>
                      Connected Accounts
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center'>
                            <Mail className='w-5 h-5 text-gray-600' />
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>Email</p>
                            <p className='text-sm text-gray-600'>
                              {userData?.email}
                            </p>
                          </div>
                        </div>
                        <span className='px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full'>
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='border-2 border-red-200 rounded-lg p-4 bg-red-50'>
                    <h3 className='font-medium text-red-900 mb-2 flex items-center gap-2'>
                      <Trash2 className='w-5 h-5' />
                      Danger Zone
                    </h3>
                    <p className='text-sm text-red-800 mb-4'>
                      Once you delete your account, there is no going back. All
                      your datasets will be permanently deleted.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className='px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all'
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
