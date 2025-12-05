'use client';
import { api } from '@/lib/axios';
import { LoginFormData, loginSchema } from '@/lib/zodSchemas';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const resolver = zodResolver(
    loginSchema
  ) as unknown as Resolver<LoginFormData>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { setUser } = useAuthStore();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data.user);
      router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Login to your account
        </h1>
      </div>

      <div className='space-y-5'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Email
          </label>
          <input
            type='email'
            autoComplete='email'
            id='email'
            {...register('email')}
            className={`w-full px-3 py-2 rounded-lg border-2 transition-colors focus:outline-none ${
              errors.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-indigo-600'
            }`}
            placeholder='email@example.com'
          />
          {errors.email && (
            <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Password
          </label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              autoComplete='new-password'
              required
              {...register('password')}
              className={`w-full px-3 py-2 rounded-lg border-2 transition-colors focus:outline-none ${
                errors.password
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-indigo-600'
              }`}
              placeholder='••••••••'
            />
            <button
              type='button'
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className='absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.password.message}
            </p>
          )}
        </div>
        <div className='flex items-center justify-between'>
          <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none'>
            <input
              type='checkbox'
              {...register('rememberMe')}
              className='w-4 h-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500'
            />
            Remember me
          </label>

          <Link
            href='/forgot-password'
            className='text-sm text-indigo-600 font-medium hover:text-indigo-700'
          >
            Forgot password?
          </Link>
        </div>
        <div className='pt-4'>
          <button
            type='submit'
            disabled={!isValid}
            className='w-full cursor-pointer py-3 px-6 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Login
          </button>
        </div>

        <div className='text-center text-sm text-gray-600'>
          Dont have an account?{' '}
          <Link
            href={'/register'}
            type='button'
            className='text-indigo-600 cursor-pointer font-semibold hover:text-indigo-700'
          >
            Register
          </Link>
        </div>
      </div>
    </form>
  );
}
