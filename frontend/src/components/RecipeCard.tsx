import { useState } from "react";
import { Heart, Bookmark, Trash2, Clock, Pencil } from "lucide-react";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  author: string;
  difficulty: "easy" | "medium" | "hard";
  time: string;
  likes: number;
  isLiked?: boolean; // Used as initial value
  isSaved?: boolean;
  onClick?: () => void;
  onLike?: (id: string) => void; // Optional: just to notify parent
  onSave?: (id: string) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  showEdit?: boolean;
  onEdit?: (id: string) => void;
  canRemove?: boolean; // for cookie jar view
  onRemove?: () => void;
  large?: boolean;
  small?: boolean;
}

export function RecipeCard({
  id,
  title,
  image,
  author,
  difficulty,
  time,
  likes, // Initial likes count
  isLiked = false, // Initial liked status
  isSaved = false,
  onClick,
  onLike,
  onSave,
  showDelete = false,
  onDelete,
  showEdit = false,
  onEdit,
  canRemove = false,
  onRemove,
  large,
  small,
}: RecipeCardProps) {
  
  // --- 1. LOCAL STATE ---
  // We initialize the state with the props passed in.
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likes);

  const sizeMode = small ? "small" : large ? "large" : "default";

  const difficultyColor = {
    Easy: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
    Medium: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    Hard: "bg-[var(--foreground)] text-white",
  };

  // --- 2. INTERNAL HANDLER ---
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick

    // Toggle logic
    if (localIsLiked) {
      setLocalIsLiked(false);
      setLocalLikesCount((prev) => prev - 1);
    } else {
      setLocalIsLiked(true);
      setLocalLikesCount((prev) => prev + 1);
    }

    // Optional: Still call the prop if the parent needs to know (e.g. for analytics)
    if (onLike) {
      onLike(id);
    }
  };

  return (
    <div
      className={`
        pixel-card bg-white cursor-pointer
        hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_var(--border)]
        transition-all
        ${sizeMode === "small" ? "flex flex-row" : ""}
      `}
      onClick={onClick}
    >
      {/* IMAGE */}
      <div
        className={`
          relative bg-[var(--card)]
          ${sizeMode === "small" ? "w-36 h-full flex-shrink-0" : ""}
          ${sizeMode === "large" ? "aspect-[3/2]" : ""}
          ${sizeMode === "default" ? "aspect-square" : ""}
        `}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />

        {/* ACTION ICONS */}
        <div
          className={`absolute top-2 right-2 flex gap-2 ${
            sizeMode === "small" ? "scale-75 origin-top-right" : ""
          }`}
        >
          <button
            className={`
              w-8 h-8 pixel-border flex items-center justify-center transition-colors
              ${localIsLiked ? "bg-[#FF99AA]" : "bg-white"} 
            `}
            // Use the internal handler here
            onClick={handleLikeClick}
          >
            <Heart
              className={`w-4 h-4 ${
                localIsLiked 
                  ? "fill-[var(--primary-foreground)] text-[var(--primary-foreground)]" 
                  : "text-black"
              }`}
            />
          </button>

          <button
            className={`
              w-8 h-8 pixel-border flex items-center justify-center transition-colors
              ${isSaved ? "bg-[var(--secondary)]" : "bg-white"}
            `}
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(id);
            }}
          >
            <Bookmark
              className={`w-4 h-4 ${
                isSaved ? "fill-[var(--secondary-foreground)]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div
        className={`
          p-4 py-5
          ${
            sizeMode === "small"
              ? "border-l-[3px] border-[var(--border)] flex flex-col justify-center flex-1 gap-2"
              : "border-t-[3px] border-[var(--border)]"
          }
        `}
      >
        <h4 className="uppercase font-bold break-words leading-tight">{title}</h4>

        <p className="text-sm text-[color-mix(in_srgb,var(--foreground)70%,transparent)]">
          by {author}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-auto">
          
          {/* Difficulty Tag */}
          <span
            className={`
              pixel-border uppercase whitespace-nowrap
              ${difficultyColor[difficulty]}
              ${sizeMode === 'small' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}
            `}
          >
            {difficulty}
          </span>

          {/* Time Tag */}
          <span className={`
            pixel-border bg-white uppercase whitespace-nowrap flex items-center gap-1
            ${sizeMode === 'small' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}
          `}>
            {/* Hide clock icon on very small cards to save space */}
            {sizeMode !== 'small' && <Clock size={12} />}
            {time}
          </span>

          {/* Likes Tag - Pushed to right */}
          <span className={`
            pixel-border bg-white uppercase ml-auto flex items-center gap-1 whitespace-nowrap
            ${sizeMode === 'small' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}
          `}>
            <Heart className={`w-3 h-3 ${localIsLiked ? "fill-[var(--primary)] text-[var(--primary)]" : ""}`} />
            {localLikesCount}
          </span>
        </div>

        {(showEdit || showDelete || canRemove) && (
          <div className="mt-3 flex gap-2">
            
            {/* EDIT */}
            {showEdit && (
              <button
                className="
                  flex-1 px-4 py-2 pixel-border
                  bg-[var(--secondary)]
                  hover:bg-[color-mix(in_srgb,var(--secondary)85%,black)]
                  transition-colors
                  flex items-center justify-center gap-2
                  text-sm uppercase
                "
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(id);
                }}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            )}

            {/* DELETE (profile / owner) */}
            {showDelete && (
              <button
                className="
                  px-3 py-2 pixel-border
                  bg-[var(--primary)]
                  hover:bg-[color-mix(in_srgb,var(--primary)85%,black)]
                  transition-colors
                  flex items-center justify-center
                "
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* REMOVE (collection) */}
            {canRemove && (
              <button
                className="
                  mt-3 w-full
                  px-4 py-2
                  pixel-border
                  bg-[var(--primary)]
                  hover:bg-[color-mix(in_srgb,var(--primary)85%,black)]
                  transition-colors
                  flex items-center justify-center gap-2
                  text-sm uppercase
                "
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
              >
                <Trash2 className="w-4 h-4" />
                Remove from Cookie Jar
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}