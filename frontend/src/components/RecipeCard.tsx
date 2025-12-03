import { Heart, Bookmark, Trash2 } from "lucide-react";

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
  showDelete?: boolean;
  onDelete?: (id: string) => void;
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
  showDelete = false,
  onDelete,
}: RecipeCardProps) {
  const difficultyColor = {
    Easy: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
    Medium: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    Hard: "bg-[var(--foreground)] text-white",
  };

  return (
    <div
      className="
        pixel-card bg-white
        cursor-pointer
        hover:translate-x-1 hover:translate-y-1
        hover:shadow-[2px_2px_0_var(--border)]
        transition-all
      "
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-[var(--card)]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />

        <div className="absolute top-2 right-2 flex gap-2">
          {/* Like Button */}
          <button
            className={`
              w-8 h-8 pixel-border flex items-center justify-center
              ${isLiked ? "bg-[var(--primary)]" : "bg-white"}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <Heart
              className={`
                w-4 h-4
                ${isLiked ? "fill-[var(--primary-foreground)]" : ""}
              `}
            />
          </button>

          {/* Save Button */}
          <button
            className={`
              w-8 h-8 pixel-border flex items-center justify-center
              ${isSaved ? "bg-[var(--secondary)]" : "bg-white"}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <Bookmark
              className={`
                w-4 h-4
                ${isSaved ? "fill-[var(--secondary-foreground)]" : ""}
              `}
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 border-t-[3px] border-[var(--border)]">
        <h4 className="uppercase mb-2 truncate">{title}</h4>

        <p className="text-sm text-[color-mix(in_srgb,var(--foreground) 70%,transparent)] mb-3">
          by {author}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 text-xs pixel-border uppercase ${difficultyColor[difficulty]}`}
          >
            {difficulty}
          </span>

          <span className="px-2 py-1 text-xs pixel-border bg-white uppercase">
            {time}
          </span>

          {/* Likes count */}
          <span className="px-2 py-1 text-xs pixel-border bg-white uppercase ml-auto flex items-center gap-1">
            <Heart className="w-3 h-3 fill-[var(--primary)]" />
            {likes}
          </span>
        </div>

        {/* Delete Button */}
        {showDelete && (
          <button
            className="
              w-full mt-3 px-3 py-2 pixel-border
              bg-[var(--primary)]
              hover:bg-[color-mix(in_srgb,var(--primary) 85%, black)]
              transition-colors
              flex items-center justify-center gap-2
              text-sm uppercase
            "
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Recipe
          </button>
        )}
      </div>
    </div>
  );
}
