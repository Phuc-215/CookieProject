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
  const [allFollowers, setAllFollowers] = useState<UserLite[]>([]);
  const [displayedCount, setDisplayedCount] = useState(5);
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

  // Get displayed followers (first N items)
  const displayedFollowers = allFollowers.slice(0, displayedCount);
  const hasMore = displayedCount < allFollowers.length;

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
          setAllFollowers(mapped);
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
        setAllFollowers(mapped);
      } catch (err) {
        console.error('Failed to load followers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowers();
  }, [userId, currentUserId]);

  const handleLoadMore = () => {
    setDisplayedCount(prev => Math.min(prev + 5, allFollowers.length));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && hasMore && !loading) {
      handleLoadMore();
    }
  };

  return (
    <PixelModal title="FOLLOWERS" onClose={onClose} width="400px">
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div 
          className="max-h-[400px] overflow-y-auto pr-2"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#5D4037 #FFF8E1'
          }}
        >
          <FollowList
            users={displayedFollowers}
            type="followers"
            isOwner={isOwner}
            currentUserId={currentUserId ?? undefined}
            onFollow={currentUserId ? async (id) => {
              if (String(currentUserId) === id) return;
              try {
                await followUserApi(id);
                setAllFollowers((prev) =>
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
                setAllFollowers((prev) =>
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
          {hasMore && (
            <div className="text-center mt-4 pb-2">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 text-xs pixel-border bg-[#FFF8E1] hover:bg-[#FFE082] transition-colors"
              >
                Load More ({allFollowers.length - displayedCount} remaining)
              </button>
            </div>
          )}
        </div>
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
  const [allFollowings, setAllFollowings] = useState<UserLite[]>([]);
  const [displayedCount, setDisplayedCount] = useState(5);
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

  // Get displayed followings (first N items)
  const displayedFollowings = allFollowings.slice(0, displayedCount);
  const hasMore = displayedCount < allFollowings.length;

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
          setAllFollowings(mapped);
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
        setAllFollowings(mapped);
      } catch (err) {
        console.error('Failed to load followings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowings();
  }, [userId, currentUserId]);

  const handleLoadMore = () => {
    setDisplayedCount(prev => Math.min(prev + 5, allFollowings.length));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && hasMore && !loading) {
      handleLoadMore();
    }
  };

  return (
    <PixelModal title="FOLLOWINGS" onClose={onClose} width="400px">
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div 
          className="max-h-[400px] overflow-y-auto pr-2"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#5D4037 #FFF8E1'
          }}
        >
          <FollowList
            users={displayedFollowings}
            type="followings"
            isOwner={isOwner}
            currentUserId={currentUserId ?? undefined}
            onUnfollow={currentUserId ? async (id) => {
              if (String(currentUserId) === id) return;
              try {
                await unfollowUserApi(id);
                setAllFollowings((prev) =>
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
                setAllFollowings((prev) =>
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
          {hasMore && (
            <div className="text-center mt-4 pb-2">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 text-xs pixel-border bg-[#FFF8E1] hover:bg-[#FFE082] transition-colors"
              >
                Load More ({allFollowings.length - displayedCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </PixelModal>
  );
}