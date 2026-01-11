import { useState, useEffect } from "react";
import { Heart, Bookmark, Trash2, Clock, Pencil, Cookie } from "lucide-react";

import { unlikeRecipeApi, likeRecipeApi } from "@/api/recipe.api";
import { addRecipeToCollectionApi } from "@/api/collection.api"; 

import { AddToCollectionModal } from "./modals/AddToCollectionModal";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  author: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
  likes: number;
  isLiked?: boolean; 
  isSaved?: boolean;
  onClick?: () => void;
  onLike?: (id: string) => void; 
  onSave?: (id: string) => void;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  showEdit?: boolean;
  onEdit?: (id: string) => void;
  canRemove?: boolean; 
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
  likes, 
  isLiked = false, 
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
  
  // --- LOCAL STATE (FIXED: Consistent naming) ---
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likes);
  const [localIsSaved, setLocalIsSaved] = useState(isSaved);
  const [imageError, setImageError] = useState(false);
  
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const sizeMode = small ? "small" : large ? "large" : "default";

  useEffect(() => {
    setLocalIsLiked(isLiked);
    setLocalLikesCount(likes);
    setLocalIsSaved(isSaved);
  }, [isLiked, isSaved, likes]);

  // Reset image error when image prop changes
  useEffect(() => {
    if (image) {
      setImageError(false);
    }
  }, [image]);

  const difficultyColor = {
    Easy: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
    Medium: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    Hard: "bg-[var(--foreground)] text-white",
  };

  // --- HANDLERS ---
  const handleLikeClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (onLike) onLike(id);

    if (!localIsLiked) {
      try {
        await likeRecipeApi(id);
        setLocalIsLiked(true);
        setLocalLikesCount((prev) => prev + 1);
      } catch (error) {
        console.error("Error liking recipe:", error);
      }
    } else {
      try {
        await unlikeRecipeApi(id);
        setLocalIsLiked(false);
        setLocalLikesCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error unliking recipe:", error);
      }
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    
    // FIX: If already saved, do nothing (Disabled)
    if (localIsSaved) return;
    
    setShowCollectionModal(true);
    if(onSave) onSave(id); 
  };

  const handleAddToJar = async (jarId: string) => {
    try {
        await addRecipeToCollectionApi(jarId, id);
        setLocalIsSaved(true);
    } catch (error) {
        console.error("Failed to add to collection", error);
        alert("Failed to save recipe");
    } finally {
        setShowCollectionModal(false);
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
        {(!image || image.trim() === '' || imageError) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF8E1] via-[#FFE4C4] to-[#FFF8E1] relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, #4A3B32 8px, #4A3B32 16px)`,
                backgroundSize: '16px 16px'
              }}
            />
            {/* Cookie icon with pixel art style */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Cookie 
                className={`
                  text-[#D7B899] 
                  drop-shadow-[3px_3px_0px_rgba(74,59,50,0.3)]
                  ${sizeMode === "small" ? "w-16 h-16" : sizeMode === "large" ? "w-32 h-32" : "w-24 h-24"}
                `}
                strokeWidth={2}
                fill="currentColor"
              />
              {sizeMode !== "small" && (
                <span className="text-[#4A3B32]/60 font-vt323 text-sm uppercase tracking-wider font-bold">
                  No Image
                </span>
              )}
            </div>
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            style={{ imageRendering: "pixelated" }}
            onError={() => setImageError(true)}
          />
        )}

          {/* ACTION ICONS */}
          <div
            className={`absolute top-2 right-2 flex gap-2 ${
              sizeMode === "small" ? "scale-75 origin-top-right" : ""
            }`}
          >
            {/* LIKE BUTTON */}
            <button
              className={`
                w-8 h-8 pixel-border flex items-center justify-center transition-colors
                ${localIsLiked ? "bg-[#FF99AA]" : "bg-white"} 
              `}
              onClick={(e) => handleLikeClick(e, id)}
            >
              <Heart
                className={`w-4 h-4 ${
                  localIsLiked 
                    ? "fill-[var(--primary-foreground)] text-[var(--primary-foreground)]" 
                    : "text-black"
                }`}
              />
            </button>

            {/* SAVE BUTTON (Disabled if Saved) */}
            <button
              disabled={localIsSaved}
              className={`
                w-8 h-8 pixel-border flex items-center justify-center transition-colors
                ${localIsSaved 
                    ? "bg-[#4DB6AC] cursor-default opacity-100"
                    : "bg-white hover:bg-gray-100"
                }
              `}
              onClick={handleBookmarkClick}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  localIsSaved ? "fill-[var(--secondary-foreground)] text-[var(--secondary-foreground)]" : ""
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
              {sizeMode !== 'small' && <Clock size={12} />}
              {time}
            </span>

            {/* Likes Tag */}
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

              {/* DELETE */}
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

              {/* REMOVE */}
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

      {showCollectionModal && (
        <AddToCollectionModal 
          onClose={() => setShowCollectionModal(false)}
          onAdd={handleAddToJar}
        />
      )}
    </>
  );
}