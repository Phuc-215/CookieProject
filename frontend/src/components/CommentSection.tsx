import { useState } from 'react';
import { Send, Trash2, MessageSquare, User, Lock } from 'lucide-react';
// import { PixelButton } from './PixelButton'; 
// import { PixelTextarea } from './PixelTextarea'; 

// --- DATA TYPE ---
interface Comment {
  id: string;
  authorId: string; // Thêm authorId để so sánh quyền sở hữu
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
  initialComments?: Comment[];
  currentUser: UserData | null; // Có thể là null nếu chưa login
  onLoginClick?: () => void;    // Hàm callback để mở modal login hoặc chuyển trang
}

// --- MOCK DATA ---
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    authorId: 'user_99',
    authorName: 'ChefMario',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Mario',
    content: 'This recipe is amazing! My kids loved it.',
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    authorId: 'user_123', // Giả sử đây là ID của user 'BinhBaker'
    authorName: 'BinhBaker',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Binh',
    content: 'Can I substitute butter with oil?',
    createdAt: '5 hours ago',
  },
];

export function CommentSection({ 
  recipeId, 
  initialComments = MOCK_COMMENTS, 
  currentUser,
  onLoginClick
}: CommentSectionProps) {
  
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIC: ADD COMMENT
  const handleAddComment = () => {
    // Chặn nếu chưa login hoặc input rỗng
    if (!currentUser || !newCommentText.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newComment: Comment = {
        id: Date.now().toString(),
        authorId: currentUser.id,      // Lấy ID thật
        authorName: currentUser.name,  // Lấy tên thật
        avatar: currentUser.avatar,    // Lấy avatar thật
        content: newCommentText,
        createdAt: 'Just now',
      };

      setComments([newComment, ...comments]);
      setNewCommentText('');
      setIsSubmitting(false);
    }, 500);
  };

  // LOGIC: DELETE COMMENT
  const handleDeleteComment = (commentId: string) => {
    if (confirm('Delete this comment?')) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };

  return (
    <div className="mt-8 border-t-4 border-[#4A3B32] pt-8">
      {/* HEADER */}
      <h3 className="text-xl font-bold font-vt323 text-[#4A3B32] mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        COMMENTS ({comments.length})
      </h3>

      {/* --- CONDITIONAL RENDERING INPUT FORM --- */}
      {currentUser ? (
        // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> HIỆN KHUNG NHẬP
        <div className="flex gap-4 mb-8 animate-fade-in">
          <div className="w-10 h-10 shrink-0 border-2 border-[#4A3B32] bg-[#FF99AA] overflow-hidden flex items-center justify-center">
             <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={`Comment as ${currentUser.name}...`}
              rows={3}
              className="w-full border-2 border-[#4A3B32] p-3 font-vt323 text-lg focus:outline-none focus:shadow-[4px_4px_0_#4A3B32] transition-shadow resize-none bg-[#FFF8E7]"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={isSubmitting || !newCommentText.trim()}
                className={`
                  px-4 py-2 border-2 border-[#4A3B32] font-vt323 text-lg uppercase flex items-center gap-2 transition-all
                  ${!newCommentText.trim() 
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
        // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> HIỆN THÔNG BÁO LOGIN
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
        {comments.length > 0 ? (
          comments.map((comment) => {
            // Kiểm tra quyền sở hữu: Chỉ khi currentUser tồn tại VÀ ID khớp nhau
            const isMine = currentUser && currentUser.id === comment.authorId;

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
                    <p className="font-vt323 text-lg text-gray-700 leading-snug">
                      {comment.content}
                    </p>
                  </div>

                  {/* Chỉ hiện nút Delete nếu là comment của chính mình */}
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
            <p className="font-vt323 text-xl text-[#4A3B32]">No comments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}