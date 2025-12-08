import { FC } from 'react';

interface ConfirmModalProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  title = 'Confirm',
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50 z-50'>
      <div className='bg-white rounded-lg p-6 shadow-lg w-80'>
        <h2 className='text-lg font-semibold mb-4'>{title}</h2>
        <p className='mb-6'>{message}</p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onCancel}
            className='px-4 py-2 rounded border border-gray-300 hover:bg-gray-100'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
