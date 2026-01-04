import { PixelModal } from '@/components/modals/PixelModal';
import { PixelInput } from '@/components/PixelInput';
import { PixelButton } from '@/components/PixelButton';
import forgot_hamster from "@/assets/forgot_hamster.svg";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
}

export function ForgotPasswordModal({ open, onClose, onNext }: Props) {
  if (!open) return null;

  return (
    <PixelModal
      title="Forgot your password?"
      onClose={onClose}
      showBack
      onBack={onClose}
    >
      <div className="flex justify-center mb-6">
        <img src={forgot_hamster} className="w-28 h-28" />
      </div>

      <p className="text-sm text-center mb-6 text-[var(--choco)]/70">
        Don't worry - it happens! We'll help you reset it
      </p>

      <PixelInput
        label="Email *"
        placeholder="baker@cookie.exe"
      />

      <PixelButton
        variant="secondary"
        size="lg"
        className="w-full mt-6"
        onClick={onNext}
      >
        Send Reset Link
      </PixelButton>
    </PixelModal>
  );
}

