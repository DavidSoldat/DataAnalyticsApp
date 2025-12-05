'use client';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export default function LogOutButton() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const logOut = async () => {
    await api.post('/auth/logout');
    logout(); 
    router.push('/login');
  };
  return (
    <button
      onClick={logOut}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition mt-auto
                ${isActive ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
    >
      Log Out
    </button>
  );
}
