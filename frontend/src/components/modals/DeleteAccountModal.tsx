import { PixelModal } from '@/components/modals/PixelModal';
import { PixelButton } from '@/components/PixelButton';
import delete_hamster from '@/assets/delete_hamster.svg';

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAccountModal({
  onClose,
  onConfirm,
  isLoading,
}: DeleteAccountModalProps) {
  return (
    <PixelModal onClose={onClose}>
      {/* Hamster */}
      <div className="flex justify-center mb-4">
        <img
          src={delete_hamster}
          alt="Sad hamster"
          className="w-24 h-24"
        />
      </div>

      {/* Title */}
      <h2
        className="text-center mb-2 text-[var(--choco)]"
        style={{ fontSize: '14px' }}
      >
        Say goodbye?
      </h2>

      {/* Content */}
      <p className="text-center text-sm text-[var(--choco)] mb-1">
        This will close your little bakery.
      </p>

      <p className="text-center text-xs text-[var(--pink)] mb-6">
        All recipes and crumbs will be gone forever.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <PixelButton
          variant="outline"
          size="lg"
          className="w-1/2"
          onClick={onClose}
          disabled={isLoading}
        >
          Keep baking
        </PixelButton>

        <PixelButton
          variant="destructive"
          size="lg"
          className="w-1/2"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Closing...' : 'Say goodbye'}
        </PixelButton>
      </div>
    </PixelModal>
  );
}