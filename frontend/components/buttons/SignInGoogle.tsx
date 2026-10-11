'use client';

import Image from 'next/image';
import { api } from '@/lib/axios';

export default function SignInGoogleButton() {
  return (
    <a
      href={`${api.defaults.baseURL}/auth/oauth2/authorization/google`}
      className='flex w-full items-center justify-center cursor-pointer gap-3 rounded-lg bg-indigo-50 px-6 py-3 font-semibold hover:bg-indigo-100 transition-colors'
    >
      <Image
        src='https://authjs.dev/img/providers/google.svg'
        alt='Google logo'
        height='24'
        width='24'
        unoptimized
      />
      <span className='whitespace-nowrap'>Continue with Google</span>
    </a>
  );
}
