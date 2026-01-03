import { useState } from 'react';
import { PixelModal } from '@/components/PixelModal';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import security_hamster from "@/assets/security_hamster.svg";

interface Props {
  onConfirm: (password: string) => void;
  onClose: () => void;
}

export function SecurityCheckModal({ onConfirm, onClose }: Props) {
  const [password, setPassword] = useState('');

  return (
    <PixelModal
      title="Security Check"
      onClose={onClose}
      width="380px"
    >
      <div className="flex justify-center mb-6">
        <img src={security_hamster} className="w-32 h-32" />
      </div>
      <p className="text-xs mb-4 text-[#5D4037]/70">
        For security reasons, please enter your current password
      </p>

      <PixelInput
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Current password"
      />

      <div className="mt-6 flex justify-end gap-3">
        <PixelButton
          variant="outline"
          size="md"
          onClick={onClose}
        >
          Cancel
        </PixelButton>

        <PixelButton
          variant="primary"
          size="md"
          onClick={() => onConfirm(password)}
        >
          Continue
        </PixelButton>
      </div>
    </PixelModal>
  );
}
