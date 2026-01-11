import { useState, useEffect } from 'react';
import { Loader2, Plus, Check } from 'lucide-react';
import { PixelModal } from '@/components/modals/PixelModal';
import { PixelButton } from "@/components/PixelButton";
import { useNav } from '@/hooks/useNav';
import { useAuth } from "@/contexts/AuthContext";
import { getUserCollectionsApi } from '@/api/collection.api';

interface CookieJar {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface Props {
  onClose: () => void;
  // onAdd now returns a Promise so the parent can handle the API call
  onAdd: (jarId: string) => Promise<void>; 
}

// Helper to generate consistent pastel colors from IDs
const getColor = (id: number | string) => {
  const colors = ["#4DB6AC", "#FF8FAB", "#FFCC80", "#90CAF9", "#CE93D8"];
  const index = typeof id === 'number' ? id : parseInt(id as string, 10) || 0;
  return colors[index % colors.length];
};

export function AddToCollectionModal({ onClose, onAdd }: Props) {
  const nav = useNav();
  const { viewer } = useAuth();
  
  const [jars, setJars] = useState<CookieJar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToId, setAddingToId] = useState<string | null>(null);

  // 1. Fetch Collections on Mount
  useEffect(() => {
    const fetchCollections = async () => {
      if (!viewer?.id) return;
      try {
        setIsLoading(true);
        // Call API
        const response = await getUserCollectionsApi(viewer.id);
        
        // Map DB Data (snake_case) to UI Data
        const mappedJars: CookieJar[] = response.data.data.map((col) => ({
          id: col.id.toString(),
          name: col.title,
          color: getColor(col.id),
          count: col.recipe_count
        }));
        
        setJars(mappedJars);
      } catch (error) {
        console.error("Failed to load collections", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [viewer]);

  // 2. Handle Add Click
  const handleAddClick = async (jarId: string) => {
    setAddingToId(jarId);
    try {
      await onAdd(jarId); // Trigger parent's API call
      // Optional: Show success state briefly or close immediately
      setTimeout(() => {
        onClose(); 
      }, 500);
    } catch (error) {
      console.error("Failed to add to jar", error);
      setAddingToId(null); // Reset on error
    }
  };

  return (
    <PixelModal title="COOKIE JARS" onClose={onClose} width="420px">
      <div className="space-y-4">
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#4A3B32]" />
          </div>
        ) : jars.length === 0 ? (
          <div className="text-center text-gray-500 font-vt323 text-lg py-4">
            No cookie jars found. Create one!
          </div>
        ) : (
          jars.map((jar) => (
            <div
              key={jar.id}
              className="flex items-center justify-between pixel-border p-3 hover:bg-[#FFF8E1] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 pixel-border flex items-center justify-center font-vt323 font-bold text-white text-xs"
                  style={{ backgroundColor: jar.color }}
                >
                  {jar.count}
                </div>
                <span className="text-sm uppercase font-vt323 text-lg">{jar.name}</span>
              </div>

              <PixelButton
                size="sm"
                variant={addingToId === jar.id ? "primary" : "outline"}
                disabled={addingToId !== null}
                onClick={() => handleAddClick(jar.id)}
              >
                {addingToId === jar.id ? <Check size={14}/> : "Add"}
              </PixelButton>
            </div>
          ))
        )}

        <div className="flex justify-center pt-2 border-t-2 border-dashed border-[#4A3B32]/20">
          <PixelButton
            variant="ghost"
            size="md"
            onClick={() => {
              onClose();
              nav.createCollection();
            }}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Create new cookie jar
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
}