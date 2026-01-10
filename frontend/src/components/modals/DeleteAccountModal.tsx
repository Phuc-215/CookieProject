import { PixelButton } from '../PixelButton';

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAccountModal({ onClose, onConfirm, isLoading }: DeleteAccountModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white pixel-border rounded w-full max-w-sm p-8">
        <h2 
          className="text-sm mb-4 text-pink-600 text-center"
          style={{ fontFamily: "'Press Start 2P'" }}
        >
          Delete Account
        </h2>
        
        <div className="mb-6 space-y-3 text-center">
          <p className="text-sm font-semibold text-[#5D4037]">
            Are you sure you want to delete your account?
          </p>
          <p className="text-xs text-pink-600">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <p className="text-xs text-[#5D4037]/70">
            You will be logged out immediately.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <PixelButton
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </PixelButton>
          <PixelButton
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-pink-400 hover:bg-pink-700"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
