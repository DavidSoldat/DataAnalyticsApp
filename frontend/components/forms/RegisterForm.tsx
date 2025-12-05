'use client';
import { api } from '@/lib/axios';
import { RegisterFormData, registerSchema } from '@/lib/zodSchemas';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { setUser } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await api.post('/auth/register', data);
      setUser(res.data.user);
      router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          Create your account
        </h1>
      </div>

      <div className='space-y-5'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Full Name
          </label>
          <input
            type='text'
            id='name'
            autoComplete='username'
            {...register('name')}
            className={`w-full px-3 py-2 rounded-lg border-2 transition-colors focus:outline-none ${
              errors.name
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-indigo-600'
            }`}
            placeholder='Full Name'
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Confirm Password
          </label>
          <div className='relative'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete='new-password'
              id='confirmPassword'
              {...register('confirmPassword')}
              className={`w-full px-3 py-2 rounded-lg border-2 transition-colors focus:outline-none ${
                errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-indigo-600'
              }`}
              placeholder='••••••••'
            />
            <button
              type='button'
              tabIndex={-1}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className='pt-4'>
          <button
            type='button'
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid}
            className='w-full cursor-pointer py-3 px-6 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Register
          </button>
        </div>

        <div className='text-center text-sm text-gray-600'>
          Already have an account?{' '}
          <Link
            href={'/login'}
            type='button'
            className='text-indigo-600 cursor-pointer font-semibold hover:text-indigo-700'
          >
            Login
          </Link>
        </div>
      </div>
    </form>
  );
}
