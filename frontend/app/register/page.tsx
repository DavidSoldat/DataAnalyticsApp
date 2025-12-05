import RegisterForm from '@/components/forms/RegisterForm';

export default function SignUpPage() {
  return (
    <div className='bg-gray-50 h-screen w-screen flex items-center justify-center p-5'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-xl p-6'>
        <RegisterForm />
      </div>
    </div>
  );
}
