import { useState } from 'react';
import { PixelModal } from '@/components/modals/PixelModal';
import { FollowList } from '@/components/FollowList';
import type { UserLite } from '@/types/User';
import {
  mockFollowers,
  mockFollowings,
} from '@/mocks/mock_users';

export function FollowersModal({
  onClose,
  isOwner,
}: {
  onClose: () => void;
  isOwner: boolean;
}) {
  const [followers, setFollowers] = useState<UserLite[]>(mockFollowers);

  return (
    <PixelModal title="FOLLOWERS" onClose={onClose}>
      <FollowList
        users={followers}
        type="followers"
        isOwner={isOwner}
        onDeleteFollower={(id) =>
          setFollowers((prev) =>
            prev.filter((u) => u.id !== id)
          )
        }
      />
    </PixelModal>
  );
}

export function FollowingsModal({
  onClose,
  isOwner,
}: {
  onClose: () => void;
  isOwner: boolean;
}) {
  const [followings, setFollowings] =
    useState<UserLite[]>(mockFollowings);

  return (
    <PixelModal title="FOLLOWINGS" onClose={onClose}>
      <FollowList
        users={followings}
        type="followings"
        isOwner={isOwner}
        onUnfollow={(id) =>
          setFollowings((prev) =>
            prev.filter((u) => u.id !== id)
          )
        }
      />
    </PixelModal>
  );
}