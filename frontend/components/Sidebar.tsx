'use client';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Database,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import LogoutModal from './modals/LogoutModal';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Datasets', href: '/dashboard/datasets', icon: Database },
];

const bottomLinks = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await api.post('/auth/logout');
    logout();
    router.push('/');
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className='lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4'>
        <Link href='/dashboard' className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
            <Database className='w-5 h-5 text-white' />
          </div>
          <span className='font-bold text-xl text-gray-900'>AnalyticsApp</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='p-2 hover:bg-gray-100 rounded-lg transition-all'
          aria-label='Toggle menu'
        >
          {mobileMenuOpen ? (
            <X className='w-6 h-6 text-gray-700' />
          ) : (
            <Menu className='w-6 h-6 text-gray-700' />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/60 bg-opacity-50 z-40'
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 
          flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${
            mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        <div className='hidden lg:block p-6 border-b border-gray-200'>
          <Link href='/dashboard' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
              <Database className='w-5 h-5 text-white' />
            </div>
            <span className='font-bold text-xl text-gray-900'>
              AnalyticsApp
            </span>
          </Link>
        </div>

        <div className='lg:hidden p-6 lg:border-b border-gray-200 flex items-center justify-between'>
          <Link
            href='/dashboard'
            className='flex items-center gap-2'
            onClick={closeMobileMenu}
          >
            <div className='w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
              <Database className='w-5 h-5 text-white' />
            </div>
            <span className='font-bold text-xl text-gray-900'>
              AnalyticsApp
            </span>
          </Link>
          <button
            onClick={closeMobileMenu}
            className='p-2 hover:bg-gray-100 rounded-lg transition-all lg:hidden'
          >
            <X className='w-5 h-5 text-gray-700' />
          </button>
        </div>

        <nav className='flex flex-col flex-1 p-4 overflow-y-auto'>
          <div className='space-y-1'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className='mt-auto space-y-1 border-t border-gray-200 pt-4'>
            {bottomLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group
                  ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? 'text-gray-700'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }
                  />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setLogoutModalOpen(true);
                closeMobileMenu();
              }}
              className='flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all group'
            >
              <LogOut
                size={20}
                className='text-gray-400 group-hover:text-red-600'
              />
              Log out
            </button>
          </div>
        </nav>
      </aside>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
