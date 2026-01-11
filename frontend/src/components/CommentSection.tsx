import { useState, useEffect } from 'react';
import { Send, Trash2, MessageSquare, Lock, Loader2 } from 'lucide-react';
import { addCommentApi, getCommentsApi, deleteCommentApi } from '@/api/recipe.api';

// --- DATA TYPE ---
interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  avatar: string;
  content: string;
  createdAt: string;
}

interface UserData {
  id: string;
  name: string;
  avatar: string;
}

interface CommentSectionProps {
  recipeId: string;
  currentUser: UserData | null; 
  onLoginClick?: () => void;
}

// --- HELPER: TIME AGO ---
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

export function CommentSection({ 
  recipeId, 
  currentUser,
  onLoginClick
}: CommentSectionProps) {
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH COMMENTS ---
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        // The controller returns an array directly: [ { id, user_id, username, ... }, ... ]
        const response = await getCommentsApi(recipeId);
        const data = response.data; // Access axios data
        console.log("Fetched comments data:", data);

        // Map Backend Data (Snake_case) to Frontend UI (CamelCase)
        // Note: Backend 'getComments' query currently returns: id, user_id, recipe_id, content, created_at, username
        // It does NOT return avatar_url, so we generate a placeholder based on username.
        const mappedComments: Comment[] = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id.toString(),
          authorId: item.user_id.toString(),
          authorName: item.username || 'Unknown',
          avatar: item.avatar_url,
          content: item.content,
          createdAt: formatTimeAgo(item.created_at),
        })) : [];

        setComments(mappedComments);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) fetchComments();
  }, [recipeId]);

  // --- ADD COMMENT ---
  const handleAddComment = async () => {
    if (!currentUser || !newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await addCommentApi(recipeId, newCommentText);
      const backendComment = response.data.comment;
      console.log("Added comment response:", backendComment);

      // Optimistically add to list (Constructing the UI object)
      const newComment: Comment = {
        id: backendComment.id.toString(),
        authorId: currentUser.id,      
        authorName: currentUser.name,  
        avatar: currentUser.avatar,    
        content: backendComment.content,
        createdAt: 'Just now',
      };

      setComments([newComment, ...comments]);
      setNewCommentText('');
    } catch (error) {
      console.error("Failed to post comment", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE COMMENT ---
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    // Optimistic Update: Remove immediately from UI
    const previousComments = [...comments];
    setComments(comments.filter((c) => c.id !== commentId));

    try {
      await deleteCommentApi(recipeId, commentId);
    } catch (error) {
      console.error("Failed to delete comment", error);
      // Revert if failed
      setComments(previousComments);
      alert("Could not delete comment.");
    }
  };

  return (
    <div className="mt-8 border-t-4 border-[#4A3B32] pt-8">
      {/* HEADER */}
      <h3 className="text-xl font-bold font-vt323 text-[#4A3B32] mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        COMMENTS ({comments.length})
      </h3>

      {/* --- INPUT FORM --- */}
      {currentUser ? (
        <div className="flex gap-4 mb-8 animate-fade-in">
          <div className="w-10 h-10 shrink-0 border-2 border-[#4A3B32] bg-[#FF99AA] overflow-hidden flex items-center justify-center">
             <img src={currentUser.avatar} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={`Comment as ${currentUser.name}...`}
              rows={3}
              disabled={isSubmitting}
              className="w-full border-2 border-[#4A3B32] p-3 font-vt323 text-lg focus:outline-none focus:shadow-[4px_4px_0_#4A3B32] transition-shadow resize-none bg-[#FFF8E7] disabled:opacity-50"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={isSubmitting || !newCommentText.trim()}
                className={`
                  px-4 py-2 border-2 border-[#4A3B32] font-vt323 text-lg uppercase flex items-center gap-2 transition-all
                  ${!newCommentText.trim() || isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#FF99AA] text-[#4A3B32] hover:shadow-[2px_2px_0_#4A3B32] active:translate-y-1 active:shadow-none'
                  }
                `}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'} <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 border-2 border-dashed border-[#4A3B32] bg-[#FFF8E7]/50 p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E0E0E0] border-2 border-[#4A3B32] flex items-center justify-center text-[#4A3B32]/50">
            <Lock size={24} />
          </div>
          <p className="font-vt323 text-xl text-[#4A3B32]">
            You need to be logged in to join the discussion.
          </p>
          <button 
            onClick={onLoginClick}
            className="px-6 py-2 bg-[#4A3B32] text-white font-vt323 text-lg hover:bg-[#5D4037] transition-colors border-2 border-transparent hover:border-[#4A3B32]"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* COMMENT LIST */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A3B32]" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            // Check ownership: Compare strings (API IDs usually string in frontend state)
            const isMine = currentUser && currentUser.id.toString() === comment.authorId;

            return (
              <div key={comment.id} className="flex gap-4 group">
                {/* Avatar */}
                <div className="w-10 h-10 shrink-0 border-2 border-[#4A3B32] bg-white overflow-hidden">
                  <img 
                    src={comment.avatar} 
                    alt={comment.authorName} 
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }} 
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold font-vt323 text-lg text-[#4A3B32] uppercase">
                      {comment.authorName}
                    </span>
                    <span className="text-xs font-vt323 text-gray-500 uppercase">
                      • {comment.createdAt}
                    </span>
                    {/* Badge Owner */}
                    {isMine && (
                      <span className="px-1 bg-[#FF99AA] text-[#4A3B32] text-[10px] font-bold border border-[#4A3B32]">YOU</span>
                    )}
                  </div>
                  
                  <div className="bg-white border-2 border-[#4A3B32] p-3 relative shadow-[2px_2px_0_#E5E5E5]">
                    <div className="absolute top-3 -left-[7px] w-3 h-3 bg-white border-l-2 border-b-2 border-[#4A3B32] rotate-45"></div>
                    <p className="font-vt323 text-lg text-gray-700 leading-snug break-words">
                      {comment.content}
                    </p>
                  </div>

                  {/* Delete Button */}
                  {isMine && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs font-vt323 text-red-400 hover:text-red-600 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 opacity-60">
            <p className="font-vt323 text-xl text-[#4A3B32]">No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}