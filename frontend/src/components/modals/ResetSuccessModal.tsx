import { PixelModal } from '@/components/modals/PixelModal';
import { PixelButton } from '@/components/PixelButton';
import success_hamster from '@/assets/success_hamster.svg';

export function ResetSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <PixelModal onClose={onClose}>
      <div className="flex justify-center mb-6">
        <img src={success_hamster} className="w-32 h-32" />
      </div>

      <h2
        className="text-center text-xl mb-2"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        Abracadabra!
      </h2>

      <p className="text-sm text-center mb-6">
        Your password has been updated,
        you now have access to your account!
      </p>

      <PixelButton
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={onClose}
      >
        Close
      </PixelButton>
    </PixelModal>
  );
}