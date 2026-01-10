import { useState, useEffect } from 'react';
import { PixelModal } from '@/components/modals/PixelModal';
import { FollowList } from '@/components/FollowList';
import type { UserLite } from '@/types/User';
import { getFollowersApi, getFollowingsApi, unfollowUserApi, followUserApi, getFollowStatusApi } from '@/api/user.api';

export function FollowersModal({
  onClose,
  isOwner,
  userId,
}: {
  onClose: () => void;
  isOwner: boolean;
  userId: string | number;
}) {
  const [followers, setFollowers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = (() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.id ?? null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await getFollowersApi(userId);
        
        // If not logged in, just show the list without follow status
        if (!currentUserId) {
          const mapped = res.data.users.map((u) => ({
            id: String(u.id),
            name: u.username,
            avatar: u.avatar_url || undefined,
            isFollowing: false, // Not logged in, so can't follow
          }));
          setFollowers(mapped);
          setLoading(false);
          return;
        }
        
        // Fetch follow status for each follower if current user is logged in
        const mapped = await Promise.all(
          res.data.users.map(async (u) => {
            let isFollowing = false;
            if (String(currentUserId) !== String(u.id)) {
              try {
                const statusRes = await getFollowStatusApi(u.id);
                isFollowing = statusRes.data.isFollowing;
                console.log(`User ${u.username} (${u.id}): isFollowing = ${isFollowing}`);
              } catch (err) {
                console.error(`Failed to get follow status for user ${u.id}:`, err);
                // If error, assume not following
                isFollowing = false;
              }
            }
            return {
              id: String(u.id),
              name: u.username,
              avatar: u.avatar_url || undefined,
              isFollowing,
            };
          })
        );
        console.log('Final followers state:', mapped);
        setFollowers(mapped);
      } catch (err) {
        console.error('Failed to load followers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowers();
  }, [userId, currentUserId]);

  return (
    <PixelModal title="FOLLOWERS" onClose={onClose}>
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <FollowList
          users={followers}
          type="followers"
          isOwner={isOwner}
          currentUserId={currentUserId ?? undefined}
          onFollow={currentUserId ? async (id) => {
            if (String(currentUserId) === id) return;
            try {
              await followUserApi(id);
              setFollowers((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, isFollowing: true } : u
                )
              );
            } catch (err) {
              console.error('Failed to follow:', err);
            }
          } : undefined}
          onUnfollow={currentUserId ? async (id) => {
            if (String(currentUserId) === id) return;
            try {
              await unfollowUserApi(id);
              setFollowers((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, isFollowing: false } : u
                )
              );
            } catch (err) {
              console.error('Failed to unfollow:', err);
            }
          } : undefined}
          onUserClick={(id) => {
            onClose();
            window.location.href = `/profile/${id}`;
          }}
        />
      )}
    </PixelModal>
  );
}

export function FollowingsModal({
  onClose,
  isOwner,
  userId,
}: {
  onClose: () => void;
  isOwner: boolean;
  userId: string | number;
}) {
  const [followings, setFollowings] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = (() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.id ?? null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const res = await getFollowingsApi(userId);
        
        // If not logged in, just show the list without follow status
        if (!currentUserId) {
          const mapped = res.data.users.map((u) => ({
            id: String(u.id),
            name: u.username,
            avatar: u.avatar_url || undefined,
            isFollowing: false, // Not logged in, so can't follow
          }));
          setFollowings(mapped);
          setLoading(false);
          return;
        }
        
        // Fetch follow status for each following if current user is logged in
        const mapped = await Promise.all(
          res.data.users.map(async (u) => {
            let isFollowing = false;
            if (String(currentUserId) !== String(u.id)) {
              try {
                const statusRes = await getFollowStatusApi(u.id);
                isFollowing = statusRes.data.isFollowing;
                console.log(`User ${u.username} (${u.id}): isFollowing = ${isFollowing}`);
              } catch (err) {
                console.error(`Failed to get follow status for user ${u.id}:`, err);
                // If error, assume not following
                isFollowing = false;
              }
            }
            return {
              id: String(u.id),
              name: u.username,
              avatar: u.avatar_url || undefined,
              isFollowing,
            };
          })
        );
        console.log('Final followings state:', mapped);
        setFollowings(mapped);
      } catch (err) {
        console.error('Failed to load followings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowings();
  }, [userId, currentUserId]);

  return (
    <PixelModal title="FOLLOWINGS" onClose={onClose}>
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <FollowList
          users={followings}
          type="followings"
          isOwner={isOwner}
          currentUserId={currentUserId ?? undefined}
          onUnfollow={currentUserId ? async (id) => {
            if (String(currentUserId) === id) return;
            try {
              await unfollowUserApi(id);
              setFollowings((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, isFollowing: false } : u
                )
              );
            } catch (err) {
              console.error('Failed to unfollow:', err);
            }
          } : undefined}
          onFollow={currentUserId ? async (id) => {
            if (String(currentUserId) === id) return;
            try {
              await followUserApi(id);
              setFollowings((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, isFollowing: true } : u
                )
              );
            } catch (err) {
              console.error('Failed to follow:', err);
            }
          } : undefined}
          onUserClick={(id) => {
            onClose();
            window.location.href = `/profile/${id}`;
          }}
        />
      )}
    </PixelModal>
  );
}