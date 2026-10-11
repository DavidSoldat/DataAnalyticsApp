import SignInGoogleButton from '@/components/buttons/SignInGoogle';
import LoginForm from '@/components/forms/LoginForm';

export default function SignUpPage() {
  return (
    <div className='bg-gray-50 h-screen w-screen flex items-center justify-center p-5'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-xl p-6'>
        <LoginForm />
        <div className='flex items-center gap-3 my-4 text-sm text-gray-400'>
          <div className='flex-1 border-t border-gray-200' />
          or
          <div className='flex-1 border-t border-gray-200' />
        </div>
        <SignInGoogleButton />
      </div>
    </div>
  );
}
