'use client';

import Image from 'next/image';

export default function SignInGoogleButton() {
  return (
    <form>
      <button className='flex items-center cursor-pointer gap-6 text-lg rounded-full bg-indigo-50 px-6 py-3 font-medium'>
        <Image
          src='https://authjs.dev/img/providers/google.svg'
          alt='Google logo'
          height='24'
          width='24'
        />
        <span className='whitespace-nowrap'>Continue with Google</span>
      </button>
    </form>
  );
}
