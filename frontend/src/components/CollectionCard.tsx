import { FolderOpen } from 'lucide-react';

interface CollectionCardProps {
  title: string;
  recipeCount: number;
  coverImages: string[];
  onClick?: () => void;
}

export function CollectionCard({ title, recipeCount, coverImages, onClick }: CollectionCardProps) {
  return (
    <div 
      className="pixel-card bg-white cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_var(--border)] transition-all"
      onClick={onClick}
    >
      {/* Preview Grid */}
      <div className="aspect-square bg-[var(--background)] grid grid-cols-2 gap-0">
        {coverImages.slice(0, 4).map((img, idx) => (
          <div key={idx} className="relative overflow-hidden border border-[var(--border)]">
            <img 
              src={img} 
              alt="" 
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        ))}
        {coverImages.length === 0 && (
          <div className="col-span-2 flex items-center justify-center">
            <FolderOpen className="w-12 h-12 text-[var(--border)]/30" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 border-t-[3px] border-[var(--border)]">
        <h3 className="break-words leading-tight">{title}</h3>
        <p className="text-sm text-[var(--border)]/70">
          {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>
    </div>
  );
}