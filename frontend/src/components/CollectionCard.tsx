import { FolderOpen, Pencil, Trash2 } from 'lucide-react';

interface CollectionCardProps {
  id: string;
  title: string;
  recipeCount: number;
  // Rename this to match your HomeFeed data (usually camelCase in React)
  // Or keep it snake_case if your DB returns it that way. 
  // I will support both just in case.
  cover_images?: string[]; 
  coverImages?: string[]; // Added this to handle the mismatch from previous HomeFeed code
  ownerUsername?: string; // Made optional to prevent crashes if missing
  onClick?: (id: string) => void;

  showEdit?: boolean;
  onEdit?: (id: string) => void;

  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function CollectionCard({
  id,
  title,
  recipeCount,
  cover_images,
  coverImages, // Destructure this too
  ownerUsername = 'Unknown', // Default value
  onClick,
  showEdit = false,
  onEdit,
  showDelete = false,
  onDelete,
}: CollectionCardProps) {

  // FIX: Merge the two potential prop names and ensure it defaults to an empty array
  // This handles cases where parent passes 'coverImages' OR 'cover_images' OR undefined
  const validImages = cover_images || coverImages || [];

  return (
    <div
      className="
        pixel-card bg-white cursor-pointer
        hover:translate-x-1 hover:translate-y-1
        hover:shadow-[2px_2px_0_var(--border)]
        transition-all
      "
      onClick={() => onClick?.(id)}
    >
      {/* PREVIEW GRID */}
      <div className="relative aspect-square bg-[var(--background)] grid grid-cols-2">
        {/* FIX: Map over validImages instead of cover_images directly */}
        {validImages.slice(0, 4).map((img, idx) => (
          <div
            key={idx}
            className="overflow-hidden border border-[var(--border)]"
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        ))}

        {validImages.length === 0 && (
          <div className="col-span-2 flex items-center justify-center">
            <FolderOpen className="w-12 h-12 opacity-30" />
          </div>
        )}

        {/* ACTION ICONS */}
        {(showEdit || showDelete) && (
          <div className="absolute top-2 right-2 flex gap-2">
            {showEdit && (
              <button
                className="w-8 h-8 pixel-border bg-white flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(id);
                }}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}

            {showDelete && (
              <button
                className="w-8 h-8 pixel-border bg-[var(--primary)] flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 border-t-[3px] border-[var(--border)]">
        <h3 className="uppercase font-bold break-words leading-tight">
          {title}
        </h3>
        <p className="text-xs opacity-50 mb-1">
          by {ownerUsername}
        </p>
        <p className="text-sm opacity-60">
          {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>
    </div>
  );
}