'use client';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
      <div
        ref={modalRef}
        className='bg-white w-full max-w-sm rounded-xl p-6 shadow-lg'
      >
        <h2 className='text-lg font-semibold mb-3'>Log out?</h2>
        <p className='text-sm text-gray-600 mb-6'>
          Are you sure you want to log out?
        </p>

        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition'
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className='px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition'
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
