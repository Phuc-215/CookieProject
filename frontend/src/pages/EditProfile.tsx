import { useState } from 'react';
import { User, Upload } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelTextarea } from '@/components/PixelTextarea';
import { SecurityCheckModal } from '@/features/SecurityCheckModal';
import { NavBar } from '../components/NavBar';
import { useNav } from '@/hooks/useNav';

type SecureAction = 'email' | 'password' | 'delete' | null;

export function EditProfile() {
  const nav = useNav();

  /* ===== Profile ===== */
  const [username, setUsername] = useState('YourUsername');
  const [bio, setBio] = useState('Home baker exploring pixel-perfect recipes!');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  /* ===== Account ===== */
  const [email, setEmail] = useState('your.email@example.com');
  const [originalEmail, setOriginalEmail] = useState(email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* ===== Edit states ===== */
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  /* ===== Security ===== */
  const [isVerified, setIsVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<SecureAction>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  /* ===== Handlers ===== */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
    nav.back();
  };

  const startSecureAction = (action: SecureAction) => {
    if (!isVerified) {
      setPendingAction(action);
      setShowSecurityModal(true);
      return;
    }
    executeAction(action);
  };

  const executeAction = (action: SecureAction) => {
    if (action === 'email') {
      setOriginalEmail(email);
      setEditingEmail(true);
    }
    if (action === 'password') setEditingPassword(true);
    if (action === 'delete') {
      if (confirm('Are you sure you want to delete your account?')) {
        alert('Account deleted');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <NavBar isLoggedIn />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ================= PROFILE ================= */}
        <div className="pixel-card bg-white p-8">
          <h2 className="text-sm mb-8" style={{ fontFamily: "'Press Start 2P'" }}>
            Profile Settings
          </h2>

          {/* Avatar Section */}
          <div className="mb-8">
            <label className="block text-sm mb-4 uppercase text-[#5D4037]/70">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-[#FF8FAB] pixel-border flex items-center justify-center shrink-0 overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-[#5D4037]" />
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <PixelButton variant="outline" size="md" as="span">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Photo
                  </PixelButton>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-xs text-[#5D4037]/50 mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Username Section */}
          <div className="mb-8">
            <label className="block text-sm mb-3 uppercase text-[#5D4037]/70">
              Username
            </label>
            <PixelInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <p className="text-xs text-[#5D4037]/50 mt-2">
              This is your public display name
            </p>
          </div>

          {/* Bio Section */}
          <div className="mb-8">
            <label className="block text-sm mb-3 uppercase text-[#5D4037]/70">
              Bio
            </label>
            <PixelTextarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            <p className="text-xs text-[#5D4037]/50 mt-2">
              Brief description for your profile. Max 150 characters.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t-[3px] border-[#5D4037]">
            <PixelButton 
              variant="outline" 
              size="md"
              onClick={() => nav.back()}
            >
              Cancel
            </PixelButton>
            <PixelButton 
              variant="primary" 
              size="md"
              onClick={handleSaveProfile}
            >
              Save Changes
            </PixelButton>
          </div>
        </div>

        {/* ================= ACCOUNT ================= */}
        <div className="pixel-card bg-white p-8 mt-6">
          <h3 className="text-sm mb-6" style={{ fontFamily: "'Press Start 2P'" }}>
            Account Settings
          </h3>
          {/* EMAIL */}
            <div className="py-4 border-b-2 border-[#5D4037]">
              <div className="text-sm mb-2">Email</div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <PixelInput
                    value={email}
                    disabled={!editingEmail}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {!editingEmail ? (
                  <PixelButton
                    size="sm"
                    variant="outline"
                    onClick={() => startSecureAction('email')}
                  >
                    Change
                  </PixelButton>
                ) : (
                  <div className="flex gap-2">
                    <PixelButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEmail(originalEmail);
                        setEditingEmail(false);
                      }}
                    >
                      Cancel
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        alert('Email updated');
                        setEditingEmail(false);
                      }}
                    >
                      Save
                    </PixelButton>
                  </div>
                )}
              </div>
            </div>


          {/* PASSWORD */}
          <div className="py-4 border-b-2 border-[#5D4037]">
            <div className="text-sm mb-2">Password</div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                {!editingPassword ? (
                  <PixelInput value="••••••••" disabled />
                ) : (
                  <>
                    <PixelInput
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <PixelInput
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </>
                )}
              </div>

              {!editingPassword ? (
                <PixelButton
                  size="sm"
                  variant="outline"
                  onClick={() => startSecureAction('password')}
                >
                  Change
                </PixelButton>
              ) : (
                <div className="flex gap-2">
                  <PixelButton
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPassword(false)}
                  >
                    Cancel
                  </PixelButton>
                  <PixelButton
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      if (newPassword !== confirmPassword) {
                        alert('Password mismatch');
                        return;
                      }
                      alert('Password updated');
                      setEditingPassword(false);
                    }}
                  >
                    Save
                  </PixelButton>
                </div>
              )}
            </div>
          </div>


          {/* DELETE */}
          <div className="flex justify-between py-3">
            <div>
              <div className="text-sm mb-1">Delete Account</div>
              <div className="text-xs text-[#5D4037]/50">
                Permanently delete your account
              </div>
            </div>
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => startSecureAction('delete')}
            >
              Delete
            </PixelButton>
          </div>
        </div>
      </div>

      {/* ================= SECURITY MODAL ================= */}
      {showSecurityModal && (
        <SecurityCheckModal
          onClose={() => {
            setShowSecurityModal(false);
            setPendingAction(null);
          }}
          onConfirm={(password) => {
            if (password !== '123456') {
              alert('Wrong password');
              return;
            }

            setIsVerified(true);
            setShowSecurityModal(false);
            executeAction(pendingAction);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}