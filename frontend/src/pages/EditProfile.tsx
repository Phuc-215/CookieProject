import { useEffect, useState } from 'react';
import { User, Upload } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelTextarea } from '@/components/PixelTextarea';
import { SecurityCheckModal } from '@/components/modals/SecurityCheckModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { NavBar } from '../components/NavBar';
import { useNav } from '@/hooks/useNav';
import { getUserProfileApi, updateUserProfileApi, uploadAvatarApi, deleteAccountApi } from '@/api/user.api';
import { verifyPasswordApi, changePasswordApi } from '@/api/auth.api';
import type { UserProfile } from '@/types/User';
import { useRef } from 'react';

type SecureAction = 'email' | 'password' | 'delete' | null;

interface Viewer {
  id: number;
  username: string;
  email?: string;
}

interface EditProfileProps {
  viewer?: Viewer | null;
  onLogout?: () => void;
}

export function EditProfile({ viewer }: EditProfileProps) {
  const nav = useNav();

  /* ===== Error translation ===== */
  const getError = (errorCode: string): string => {
    const errorMap: Record<string, string> = {
      'USERNAME_EXISTS': 'This username is already taken. Please choose a different one.',
      'EMAIL_EXISTS': 'This email is already registered. Please use a different email.',
      'FORBIDDEN': 'You do not have permission to update this profile.',
      'INVALID_USER_ID': 'Invalid user ID.',
      'NO_CHANGES_TO_UPDATE': 'No changes to update.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'INTERNAL_SERVER_ERROR': 'Server error. Please try again later.',
      'TOKEN_INVALID': 'Your session has expired. Please log in again.',
      'UNAUTHORIZED': 'You need to be logged in to do this.',
      'INVALID_PASSWORD': 'Incorrect password. Please try again.',
      'PASSWORD_TOO_SHORT': 'Password must be at least 6 characters.',
      'CURRENT_AND_NEW_PASSWORD_REQUIRED': 'Both current and new password are required.',
      'No changes to update': 'No changes to update.',
      'Missing user id': 'Unable to identify your account. Please log in again.',
      'Invalid image type. Use JPG/PNG/GIF/WebP': 'Image format not supported. Please use JPG, PNG, GIF, or WebP.'
    };
    return errorMap[errorCode] || errorCode;
  };

  /* ===== Profile ===== */
  const [username, setUsername] = useState('YourUsername');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ===== Server data ===== */
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

  /* ===== Account ===== */
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* ===== Edit states ===== */
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  /* ===== Security ===== */
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<SecureAction>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userId = (() => {
    if (viewer?.id) {
      console.log('[EditProfile] userId from viewer:', viewer.id);
      return viewer.id;
    }
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('[EditProfile] userId from localStorage:', parsed.id);
        return parsed.id;
      } catch {
        console.error('[EditProfile] Failed to parse localStorage user');
        return null;
      }
    }
    console.log('[EditProfile] No userId found');
    return null;
  })();

  useEffect(() => {
    if (!userId) {
      setFormError('Missing user id');
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getUserProfileApi(userId);
        if (!active) return;
        setProfile(res.data);
        setUsername(res.data.username);
        if (res.data.email) {
          setEmail(res.data.email);
          setOriginalEmail(res.data.email);
        }
        if (res.data.bio !== undefined && res.data.bio !== null) {
          setBio(res.data.bio || '');
        }
        if (res.data.avatar_url) {
          setAvatarPreview(res.data.avatar_url);
        }
      } catch (err: any) {
        if (!active) return;
        const msg = err?.response?.data?.message || 'Failed to load profile';
        setFormError(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  /* ===== Handlers ===== */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side validate type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFormError('Invalid image type. Use JPG/PNG/GIF/WebP');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Store the file for upload
    setAvatarFile(file);
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      setFormError('Missing user id');
      console.error('[EditProfile] Save failed: userId is null or 0');
      return;
    }

    console.log('[EditProfile] Attempting save with userId:', userId);

    const payload: Partial<UserProfile> = {};
    if (username && username !== profile?.username) {
      payload.username = username.trim();
    }
    if (email && email !== originalEmail) {
      payload.email = email.trim();
    }
    if (bio !== undefined && bio !== (profile?.bio || '')) {
      payload.bio = bio.trim();
    }

    const file = avatarFile;
    if (Object.keys(payload).length === 0 && !file) {
      setFormError('No changes to update');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const res = await updateUserProfileApi(userId, payload);
      const updatedUser = res.data.user;
      setProfile(updatedUser);
      setUsername(updatedUser.username);
      if (updatedUser.email) {
        setEmail(updatedUser.email);
        setOriginalEmail(updatedUser.email);
      }
      if (updatedUser.bio !== undefined) {
        setBio(updatedUser.bio || '');
      }
      if (file) {
        const up = await uploadAvatarApi(userId, file);
        const avatarUrl = up.data.avatarUrl;
        setAvatarPreview(avatarUrl);
        const merged = { ...updatedUser, avatar_url: avatarUrl } as any;
        localStorage.setItem('user', JSON.stringify(merged));
      } else {
        if (updatedUser.avatar_url) setAvatarPreview(updatedUser.avatar_url);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        nav.back();
      }, 1500);
    } catch (err: any) {
      // Surface API or Supabase errors to help debug
      const rawMsg = (err?.response?.data && (err.response.data.message || JSON.stringify(err.response.data)))
        || err?.message
        || 'Failed to update profile';
      const friendlyError = getError(rawMsg);
      console.error('[EditProfile] Save error details:', {
        status: err?.response?.status,
        message: err?.response?.data?.message,
        fullError: err
      });
      setFormError(friendlyError);
    } finally {
      setSaving(false);
    }
  };

  const startSecureAction = (action: SecureAction) => {
    if (!isVerified) {
      setPendingAction(action);
      setShowSecurityModal(true);
      return;
    }
    executeAction(action);
  };

  const executeAction = (action: SecureAction, password?: string) => {
    if (password) setVerifiedPassword(password);
    if (action === 'email') {
      setEditingEmail(true);
    }
    if (action === 'password') {
      setEditingPassword(true);
    }
    if (action === 'delete') {
      setShowDeleteModal(true);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    
    try {
      setDeleting(true);
      setAccountError(null);
      
      await deleteAccountApi(userId);
      
      // Clear local storage and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAccountSuccess('Account deleted successfully. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || 'Failed to delete account';
      setAccountError(getError(rawMsg));
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!userId || !email) return;
    
    try {
      setSaving(true);
      setAccountError(null);
      
      const res = await updateUserProfileApi(userId, { email: email.trim() });
      const updatedUser = res.data.user;
      
      setProfile(updatedUser);
      setEmail(updatedUser.email || '');
      setOriginalEmail(updatedUser.email || '');
      setEditingEmail(false);
      setIsVerified(false);
      setVerifiedPassword(null);
      
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, email: updatedUser.email }));
      }
      
      setAccountSuccess('Email updated successfully!');
      setTimeout(() => setAccountSuccess(null), 3000);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || 'Failed to update email';
      setAccountError(getError(rawMsg));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (currentPassword?: string) => {
    if (!currentPassword) {
      setAccountError('Password verification required. Please click Change again.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setAccountError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setAccountError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setSaving(true);
      setAccountError(null);
      
      await changePasswordApi({
        currentPassword,
        newPassword
      });
      
      setEditingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setVerifiedPassword(null);
      setIsVerified(false);
      
      setAccountSuccess('Password changed successfully!');
      setTimeout(() => setAccountSuccess(null), 3000);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || 'Failed to change password';
      setAccountError(getError(rawMsg));
    } finally {
      setSaving(false);
    }
  };

  if (formError && !profile) {
    return <div className="p-8 text-pink-600">{formError}</div>;
  }

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
                  <PixelButton variant="outline" size="md" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Photo
                  </PixelButton>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
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

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded pixel-border px-4 py-3 flex items-center gap-3">
              <p className="text-green-700 text-sm font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div className="mb-6 bg-pink-50 border-2 border-pink-300 rounded pixel-border px-4 py-3">
              <p className="text-pink-700 text-sm font-semibold">{formError}</p>
            </div>
          )}

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
                        setIsVerified(false);
                      }}
                    >
                      Cancel
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      variant="primary"
                      onClick={handleSaveEmail}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
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
                    onClick={() => {
                      setEditingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setIsVerified(false);
                      setVerifiedPassword(null);
                    }}
                  >
                    Cancel
                  </PixelButton>
                  <PixelButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleSavePassword(verifiedPassword || '')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
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

          {/* Messages */}
          {accountSuccess && (
            <div className="mt-6 bg-green-50 border-2 border-green-500 rounded pixel-border px-4 py-3 flex items-center gap-3">
              <p className="text-green-700 text-sm font-semibold">{accountSuccess}</p>
            </div>
          )}

          {accountError && (
            <div className="mt-6 bg-pink-50 border-2 border-pink-300 rounded pixel-border px-4 py-3">
              <p className="text-pink-700 text-sm font-semibold">{accountError}</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= DELETE ACCOUNT MODAL ================= */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => {
            setShowDeleteModal(false);
            setFormError(null);
          }}
          onConfirm={handleDeleteAccount}
          isLoading={deleting}
        />
      )}

      {/* ================= SECURITY MODAL ================= */}
      {showSecurityModal && (
        <SecurityCheckModal
          onClose={() => {
            setShowSecurityModal(false);
            setPendingAction(null);
          }}
          onConfirm={async (password) => {
            try {
              setAccountError(null);
              
              // Verify password with backend
              await verifyPasswordApi(password);
              
              setIsVerified(true);
              setShowSecurityModal(false);
              executeAction(pendingAction, password);
              setPendingAction(null);
            } catch (err: any) {
              const rawMsg = err?.response?.data?.message || 'Invalid password';
              const friendlyMsg = rawMsg === 'INVALID_PASSWORD' 
                ? 'Incorrect password. Please try again.' 
                : getError(rawMsg);
              setAccountError(friendlyMsg);
              setShowSecurityModal(false);
              setPendingAction(null);
            } finally {
            }
          }}
        />
      )}
    </div>
  );
}